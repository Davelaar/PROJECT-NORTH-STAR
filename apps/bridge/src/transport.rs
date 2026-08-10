//! RFID hardware transport abstraction.
//! Codec stays independent; this module only moves bytes to/from tags.
//! Physical PC/SC is optional (`--features pcsc` + FEATURE_RFID_WRITE=true).

use crate::cfs::{self, MemoryTag};
use serde_json::{json, Value};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct WriteVerifyResult {
    pub uid_hex: String,
    pub key_a_hex: String,
    pub verified: bool,
    pub backup_path: Option<String>,
    pub transport: String,
    pub blocks_hex: [String; 3],
}

pub trait RfidTransport {
    fn name(&self) -> &'static str;
    fn list_readers(&self) -> Result<Vec<String>, String>;
    fn write_and_verify(
        &mut self,
        plaintext: &[u8],
        ciphertext: &[u8],
        uid_hint: Option<&str>,
    ) -> Result<WriteVerifyResult, String>;
}

/// In-memory MIFARE sector simulation (always available; used for tests + UI simulate).
pub struct SimulatedTransport {
    pub uid_hex: String,
}

impl Default for SimulatedTransport {
    fn default() -> Self {
        Self {
            uid_hex: "35B94A19".into(),
        }
    }
}

impl RfidTransport for SimulatedTransport {
    fn name(&self) -> &'static str {
        "simulated"
    }

    fn list_readers(&self) -> Result<Vec<String>, String> {
        Ok(vec!["Simulated MIFARE Classic 1K".into()])
    }

    fn write_and_verify(
        &mut self,
        plaintext: &[u8],
        ciphertext: &[u8],
        uid_hint: Option<&str>,
    ) -> Result<WriteVerifyResult, String> {
        let uid = uid_hint.unwrap_or(&self.uid_hex);
        let mut tag = MemoryTag::new(uid)?;
        let before = tag.sector1_blocks();
        let backup = backup_blocks("simulated", uid, &before)?;
        let (uid_hex, key_a, blocks) = tag.write_and_verify(plaintext, ciphertext)?;
        Ok(WriteVerifyResult {
            uid_hex,
            key_a_hex: key_a,
            verified: true,
            backup_path: Some(backup),
            transport: self.name().into(),
            blocks_hex: [blocks[0].clone(), blocks[1].clone(), blocks[2].clone()],
        })
    }
}

fn backup_dir() -> PathBuf {
    if let Ok(p) = std::env::var("OF_BRIDGE_RFID_BACKUP_DIR") {
        return PathBuf::from(p);
    }
    dirs_fallback()
}

fn dirs_fallback() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
    PathBuf::from(home).join(".open-filament").join("rfid-backups")
}

fn backup_blocks(transport: &str, uid: &str, blocks: &[Vec<u8>; 3]) -> Result<String, String> {
    let dir = backup_dir();
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let path = dir.join(format!("{transport}-{uid}-{ts}.json"));
    let doc = json!({
        "uid": uid,
        "transport": transport,
        "blocksHex": [
            hex::encode(&blocks[0]),
            hex::encode(&blocks[1]),
            hex::encode(&blocks[2]),
        ],
        "createdAt": ts,
    });
    fs::write(&path, serde_json::to_vec_pretty(&doc).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;
    Ok(path.display().to_string())
}

pub fn feature_rfid_write_enabled() -> bool {
    std::env::var("FEATURE_RFID_WRITE").ok().as_deref() == Some("true")
}

pub fn list_readers_json() -> Value {
    let readers = SimulatedTransport::default()
        .list_readers()
        .unwrap_or_default();
    #[cfg(feature = "pcsc")]
    {
        if let Ok(mut extra) = PcscTransport::list_reader_names() {
            readers.append(&mut extra);
        }
    }
    json!({
        "ok": true,
        "readers": readers.iter().map(|n| json!({ "name": n })).collect::<Vec<_>>(),
        "pcscFeatureCompiled": cfg!(feature = "pcsc"),
        "featureRfidWrite": feature_rfid_write_enabled(),
        "note": "Physical write requires FEATURE_RFID_WRITE=true and a PC/SC reader (build --features pcsc). Simulate path always available."
    })
}

pub fn write_with_policy(
    body_material: &str,
    body_color: &str,
    weight: &str,
    serial: Option<&str>,
    batch: Option<&str>,
    date: Option<&str>,
    supplier: Option<&str>,
    uid: Option<&str>,
    force_simulate: bool,
) -> Result<Value, String> {
    let (ascii, fields) = cfs::encode_plaintext(
        body_material,
        body_color,
        weight,
        serial,
        batch,
        date,
        supplier,
    )?;
    let ct = cfs::encrypt_payload(ascii.as_bytes())?;

    let use_simulate = force_simulate || !feature_rfid_write_enabled();
    let result = if use_simulate {
        let mut t = SimulatedTransport {
            uid_hex: uid.unwrap_or("35B94A19").to_string(),
        };
        t.write_and_verify(ascii.as_bytes(), &ct, uid)?
    } else {
        #[cfg(feature = "pcsc")]
        {
            let mut t = PcscTransport::connect_first()?;
            t.write_and_verify(ascii.as_bytes(), &ct, uid)?
        }
        #[cfg(not(feature = "pcsc"))]
        {
            return Err(
                "FEATURE_RFID_WRITE=true but bridge was not built with --features pcsc. Use simulate-write or rebuild."
                    .into(),
            );
        }
    };

    if !result.verified {
        return Err("Write verification failed — tag left unrestored; restore from backup if needed".into());
    }

    Ok(json!({
        "ok": true,
        "verified": true,
        "format": "creality-cfs-v1",
        "plaintextAscii": ascii,
        "ciphertextHex": hex::encode(&ct),
        "fields": fields,
        "uidHex": result.uid_hex,
        "keyAHex": result.key_a_hex,
        "blocksHex": {
            "block4": result.blocks_hex[0],
            "block5": result.blocks_hex[1],
            "block6": result.blocks_hex[2],
        },
        "backupPath": result.backup_path,
        "transport": result.transport,
        "physicalWrite": !use_simulate,
    }))
}

#[cfg(feature = "pcsc")]
mod pcsc_impl {
    use super::*;
    use pcsc::{Context, Protocols, Scope, ShareMode, MAX_BUFFER_SIZE};

    pub struct PcscTransport {
        // Keep context alive for card session; simplified MVP: reconnect per op.
    }

    impl PcscTransport {
        pub fn list_reader_names() -> Result<Vec<String>, String> {
            let ctx = Context::establish(Scope::User).map_err(|e| e.to_string())?;
            let mut buf = vec![0u8; 4096];
            let names = ctx.list_readers(&mut buf).map_err(|e| e.to_string())?;
            Ok(names.map(|s| s.to_string_lossy().into_owned()).collect())
        }

        pub fn connect_first() -> Result<Self, String> {
            let names = Self::list_reader_names()?;
            if names.is_empty() {
                return Err("No PC/SC readers found".into());
            }
            Ok(Self {})
        }
    }

    impl RfidTransport for PcscTransport {
        fn name(&self) -> &'static str {
            "pcsc"
        }

        fn list_readers(&self) -> Result<Vec<String>, String> {
            Self::list_reader_names()
        }

        fn write_and_verify(
            &mut self,
            plaintext: &[u8],
            ciphertext: &[u8],
            uid_hint: Option<&str>,
        ) -> Result<WriteVerifyResult, String> {
            // Minimal PC/SC path: authenticate + write blocks 4-6, read back, compare.
            // Many ACR122U setups need vendor-specific wrapping; document UNKNOWN gaps.
            let ctx = Context::establish(Scope::User).map_err(|e| e.to_string())?;
            let mut readers_buf = vec![0u8; 4096];
            let mut readers = ctx
                .list_readers(&mut readers_buf)
                .map_err(|e| e.to_string())?;
            let reader = readers
                .next()
                .ok_or_else(|| "No PC/SC readers found".to_string())?;
            let card = ctx
                .connect(reader, ShareMode::Shared, Protocols::ANY)
                .map_err(|e| format!("connect: {e}"))?;

            // Get UID via Get Data
            let mut rapdu = [0; MAX_BUFFER_SIZE];
            let get_uid = [0xFF, 0xCA, 0x00, 0x00, 0x00];
            let uid_resp = card
                .transmit(&get_uid, &mut rapdu)
                .map_err(|e| format!("UID: {e}"))?;
            if uid_resp.len() < 4 {
                return Err("Failed to read UID".into());
            }
            let uid_bytes = &uid_resp[..uid_resp.len().saturating_sub(2).min(uid_resp.len())];
            // Strip SW1SW2 if present
            let uid = if uid_resp.len() >= 2 {
                &uid_resp[..uid_resp.len() - 2]
            } else {
                uid_bytes
            };
            let uid_hex = hex::encode(uid);
            if let Some(hint) = uid_hint {
                if hint.to_lowercase() != uid_hex.to_lowercase() {
                    return Err(format!("UID mismatch: tag={uid_hex} hint={hint}"));
                }
            }
            let key_a = cfs::derive_uid_key_a(uid)?;

            // Load Key A into reader and authenticate sector 1 (block 4)
            let mut load = vec![0xFF, 0x82, 0x00, 0x00, 0x06];
            load.extend_from_slice(&key_a);
            card.transmit(&load, &mut rapdu)
                .map_err(|e| format!("load key: {e}"))?;
            let auth = [0xFF, 0x86, 0x00, 0x00, 0x05, 0x01, 0x00, 0x04, 0x60, 0x00];
            card.transmit(&auth, &mut rapdu)
                .map_err(|e| format!("auth: {e}"))?;

            // Backup existing blocks
            let mut before: [Vec<u8>; 3] = [vec![], vec![], vec![]];
            for (i, block) in [4u8, 5u8, 6u8].into_iter().enumerate() {
                let cmd = [0xFF, 0xB0, 0x00, block, 0x10];
                let data = card
                    .transmit(&cmd, &mut rapdu)
                    .map_err(|e| format!("read block {block}: {e}"))?;
                before[i] = data[..data.len().saturating_sub(2)].to_vec();
            }
            let backup = backup_blocks("pcsc", &uid_hex, &before)?;

            // Write ciphertext blocks
            for (i, block) in [4u8, 5u8, 6u8].into_iter().enumerate() {
                let mut cmd = vec![0xFF, 0xD6, 0x00, block, 0x10];
                cmd.extend_from_slice(&ciphertext[i * 16..(i + 1) * 16]);
                card.transmit(&cmd, &mut rapdu)
                    .map_err(|e| format!("write block {block}: {e}"))?;
            }

            // Verify read-back
            let mut verified = true;
            let mut blocks_hex = [String::new(), String::new(), String::new()];
            for (i, block) in [4u8, 5u8, 6u8].into_iter().enumerate() {
                let cmd = [0xFF, 0xB0, 0x00, block, 0x10];
                let data = card
                    .transmit(&cmd, &mut rapdu)
                    .map_err(|e| format!("verify read {block}: {e}"))?;
                let body = &data[..data.len().saturating_sub(2)];
                blocks_hex[i] = hex::encode(body);
                if body != &ciphertext[i * 16..(i + 1) * 16] {
                    verified = false;
                }
            }
            let _ = plaintext; // encoded separately; ciphertext is what is on tag
            if !verified {
                return Err("PC/SC write verification failed".into());
            }
            Ok(WriteVerifyResult {
                uid_hex,
                key_a_hex: hex::encode(key_a),
                verified: true,
                backup_path: Some(backup),
                transport: "pcsc".into(),
                blocks_hex,
            })
        }
    }
}

#[cfg(feature = "pcsc")]
pub use pcsc_impl::PcscTransport;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn simulated_write_verifies() {
        let (ascii, _) =
            cfs::encode_plaintext("ASA", "#6B5E54", "1kg", Some("219722"), None, None, None)
                .unwrap();
        let ct = cfs::encrypt_payload(ascii.as_bytes()).unwrap();
        let mut t = SimulatedTransport::default();
        let r = t
            .write_and_verify(ascii.as_bytes(), &ct, Some("35B94A19"))
            .unwrap();
        assert!(r.verified);
        assert_eq!(r.transport, "simulated");
        assert!(r.backup_path.is_some());
    }
}
