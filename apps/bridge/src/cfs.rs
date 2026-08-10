//! Creality CFS-compatible RFID crypto (mirrors `@open-filament/rfid-cfs`).
//! Community reverse engineering — not affiliated with Creality.
//! See docs/CREALITY_CFS_RFID.md for algorithm notes and sources.

use aes::cipher::{BlockDecrypt, BlockEncrypt, KeyInit};
use aes::Aes128;
use aes::cipher::generic_array::GenericArray;

pub const DATA_KEY_HEX: &str = "484043466B526E7A404B4174424A7032";
pub const UID_KEY_HEX: &str = "713362755e74316e71665a2870662431";
pub const PAYLOAD_LEN: usize = 48;
pub const BLOCK_SIZE: usize = 16;

fn key_from_hex(hex_key: &str) -> Result<[u8; 16], String> {
    let bytes = hex::decode(hex_key).map_err(|e| e.to_string())?;
    if bytes.len() != 16 {
        return Err(format!("AES key must be 16 bytes, got {}", bytes.len()));
    }
    let mut key = [0u8; 16];
    key.copy_from_slice(&bytes);
    Ok(key)
}

fn aes_ecb_crypt(encrypt: bool, key: &[u8; 16], data: &[u8]) -> Result<Vec<u8>, String> {
    if data.is_empty() || data.len() % BLOCK_SIZE != 0 {
        return Err(format!(
            "data length must be multiple of {BLOCK_SIZE}, got {}",
            data.len()
        ));
    }
    let cipher = Aes128::new(GenericArray::from_slice(key));
    let mut out = data.to_vec();
    for chunk in out.chunks_exact_mut(BLOCK_SIZE) {
        let block = GenericArray::from_mut_slice(chunk);
        if encrypt {
            cipher.encrypt_block(block);
        } else {
            cipher.decrypt_block(block);
        }
    }
    Ok(out)
}

pub fn encrypt_payload(plaintext: &[u8]) -> Result<Vec<u8>, String> {
    if plaintext.len() != PAYLOAD_LEN {
        return Err(format!(
            "plaintext must be {PAYLOAD_LEN} bytes, got {}",
            plaintext.len()
        ));
    }
    let key = key_from_hex(DATA_KEY_HEX)?;
    aes_ecb_crypt(true, &key, plaintext)
}

pub fn decrypt_payload(ciphertext: &[u8]) -> Result<Vec<u8>, String> {
    if ciphertext.len() != PAYLOAD_LEN {
        return Err(format!(
            "ciphertext must be {PAYLOAD_LEN} bytes, got {}",
            ciphertext.len()
        ));
    }
    let key = key_from_hex(DATA_KEY_HEX)?;
    aes_ecb_crypt(false, &key, ciphertext)
}

/// Derive MIFARE Sector 1 Key A (6 bytes) from UID (first 4 bytes repeated to 16).
pub fn derive_uid_key_a(uid: &[u8]) -> Result<Vec<u8>, String> {
    if uid.len() < 4 {
        return Err("UID must be at least 4 bytes".into());
    }
    let mut buf = [0u8; 16];
    for i in 0..16 {
        buf[i] = uid[i % 4];
    }
    let key = key_from_hex(UID_KEY_HEX)?;
    let encrypted = aes_ecb_crypt(true, &key, &buf)?;
    Ok(encrypted[..6].to_vec())
}

pub fn resolve_material_code(material: &str) -> Result<String, String> {
    let raw = material.trim();
    if raw.len() == 6 && raw.chars().all(|c| c.is_ascii_digit()) {
        return Ok(raw.to_string());
    }
    if raw.len() == 5 && raw.chars().all(|c| c.is_ascii_digit()) {
        return Ok(format!("1{raw}"));
    }
    let code = match raw.to_ascii_uppercase().as_str() {
        "PLA" => "100001",
        "PLA-SILK" | "PLASILK" => "100002",
        "PETG" => "100003",
        "ABS" => "100004",
        "TPU" => "100005",
        "PLA-CF" | "PLACF" => "100006",
        "ASA" => "100007",
        "PA" => "100008",
        "PA-CF" | "PACF" => "100009",
        "PC" => "100021",
        other => {
            return Err(format!("Unknown material \"{other}\""));
        }
    };
    Ok(code.to_string())
}

pub fn resolve_length_code(weight_or_code: &str) -> Result<String, String> {
    let raw = weight_or_code.trim();
    if raw.len() == 4 && raw.chars().all(|c| c.is_ascii_digit()) {
        return Ok(raw.to_string());
    }
    let code = match raw.to_ascii_lowercase().as_str() {
        "1000" | "1kg" => "0330",
        "750" | "750g" => "0247",
        "600" | "600g" => "0198",
        "500" | "500g" => "0165",
        "250" | "250g" => "0082",
        other => return Err(format!("Unknown weight/length \"{other}\"")),
    };
    Ok(code.to_string())
}

pub fn normalize_color(color: &str) -> Result<String, String> {
    let raw = color.trim();
    if raw.len() == 7 && raw.starts_with('#') {
        return Ok(raw.to_ascii_uppercase());
    }
    if raw.len() == 7 && raw.starts_with('0') {
        return Ok(format!("#{}", raw[1..].to_ascii_uppercase()));
    }
    if raw.len() == 6 && raw.chars().all(|c| c.is_ascii_hexdigit()) {
        return Ok(format!("#{}", raw.to_ascii_uppercase()));
    }
    Err(format!("Color must be #RRGGBB — got \"{color}\""))
}

fn pad_field(value: &str, len: usize) -> String {
    let mut s: String = value
        .chars()
        .filter(|c| c.is_ascii_graphic() || *c == ' ')
        .collect();
    if s.len() > len {
        s.truncate(len);
    }
    while s.len() < len {
        s.push('0');
    }
    s
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct PlaintextFields {
    pub batch: String,
    pub date: String,
    pub supplier: String,
    pub material: String,
    pub color: String,
    pub length: String,
    pub serial: String,
    pub reserve: String,
}

pub fn encode_plaintext(
    material: &str,
    color: &str,
    weight_or_length: &str,
    serial: Option<&str>,
    batch: Option<&str>,
    date: Option<&str>,
    supplier: Option<&str>,
) -> Result<(String, PlaintextFields), String> {
    let fields = PlaintextFields {
        batch: pad_field(batch.unwrap_or("OF1"), 3),
        date: pad_field(date.unwrap_or("24120"), 5),
        supplier: pad_field(supplier.unwrap_or("0A2"), 3),
        material: resolve_material_code(material)?,
        color: normalize_color(color)?,
        length: resolve_length_code(weight_or_length)?,
        serial: pad_field(serial.unwrap_or("000001"), 6),
        reserve: pad_field("00000000000000", 14),
    };
    let ascii = format!(
        "{}{}{}{}{}{}{}{}",
        fields.batch,
        fields.date,
        fields.supplier,
        fields.material,
        fields.color,
        fields.length,
        fields.serial,
        fields.reserve
    );
    if ascii.len() != PAYLOAD_LEN {
        return Err(format!("plaintext length {} ≠ {PAYLOAD_LEN}", ascii.len()));
    }
    Ok((ascii, fields))
}

pub struct MemoryTag {
    pub uid: Vec<u8>,
    blocks: std::collections::HashMap<u8, Vec<u8>>,
}

impl MemoryTag {
    pub fn new(uid_hex: &str) -> Result<Self, String> {
        let uid = hex::decode(uid_hex).map_err(|e| e.to_string())?;
        if uid.len() < 4 {
            return Err("UID must be at least 4 bytes".into());
        }
        Ok(Self {
            uid,
            blocks: std::collections::HashMap::new(),
        })
    }

    pub fn sector1_blocks(&self) -> [Vec<u8>; 3] {
        [
            self.blocks.get(&4).cloned().unwrap_or_else(|| vec![0u8; 16]),
            self.blocks.get(&5).cloned().unwrap_or_else(|| vec![0u8; 16]),
            self.blocks.get(&6).cloned().unwrap_or_else(|| vec![0u8; 16]),
        ]
    }

    pub fn write_and_verify(
        &mut self,
        plaintext: &[u8],
        ciphertext: &[u8],
    ) -> Result<(String, String, [String; 3]), String> {
        if ciphertext.len() != PAYLOAD_LEN {
            return Err("ciphertext must be 48 bytes".into());
        }
        for i in 0..3 {
            let start = i * 16;
            self.blocks
                .insert((4 + i) as u8, ciphertext[start..start + 16].to_vec());
        }
        let key_a = derive_uid_key_a(&self.uid)?;
        let mut readback = Vec::with_capacity(PAYLOAD_LEN);
        for i in 0..3u8 {
            let block = self
                .blocks
                .get(&(4 + i))
                .ok_or_else(|| format!("missing block {}", 4 + i))?;
            readback.extend_from_slice(block);
        }
        if readback != ciphertext {
            return Err("read-back ciphertext mismatch".into());
        }
        let decrypted = decrypt_payload(&readback)?;
        if decrypted != plaintext {
            return Err("decrypted plaintext mismatch".into());
        }
        Ok((
            hex::encode(&self.uid[..4]),
            hex::encode(&key_a),
            [
                hex::encode(&ciphertext[0..16]),
                hex::encode(&ciphertext[16..32]),
                hex::encode(&ciphertext[32..48]),
            ],
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encrypts_community_hyperpla_vector() {
        let pt = b"1A5241201B3D010010000000033000000100000000000000";
        assert_eq!(pt.len(), 48);
        let ct = encrypt_payload(pt).unwrap();
        assert_eq!(
            hex::encode(&ct[0..16]),
            "07881a468b7d754a76a07c9ebb452b63"
        );
        assert_eq!(
            hex::encode(&ct[16..32]),
            "e07623e57aa4dfc8f23bb22f645dc64b"
        );
        assert_eq!(
            hex::encode(&ct[32..48]),
            "fac8f07509292df943d4cdf64cba06a1"
        );
        assert_eq!(decrypt_payload(&ct).unwrap(), pt);
    }

    #[test]
    fn encrypts_asa_fixture_vector() {
        let pt = b"OF1241200A2100007#A52A2A033000000100000000000000";
        let ct = encrypt_payload(pt).unwrap();
        assert_eq!(
            hex::encode(&ct),
            "570700bc6689d0e4dbc0840f249691dcb1050d9143427d5906342c43383f1a02fac8f07509292df943d4cdf64cba06a1"
        );
    }

    #[test]
    fn derives_uid_key_a() {
        let uid = hex::decode("35B94A19").unwrap();
        assert_eq!(hex::encode(derive_uid_key_a(&uid).unwrap()), "239e7fe23653");
    }

    #[test]
    fn memory_tag_roundtrip() {
        let (ascii, _) = encode_plaintext("ASA", "#A52A2A", "1kg", None, Some("OF1"), Some("24120"), Some("0A2"))
            .unwrap();
        let pt = ascii.as_bytes();
        let ct = encrypt_payload(pt).unwrap();
        let mut tag = MemoryTag::new("35B94A19").unwrap();
        let (uid, key_a, _) = tag.write_and_verify(pt, &ct).unwrap();
        assert_eq!(uid, "35b94a19");
        assert_eq!(key_a, "239e7fe23653");
    }
}
