//! Preset install / list with backup under allowlisted filament dirs.

use crate::slicers::{is_path_allowlisted, resolve_install_dir};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallRequest {
    pub slicer: String,
    /// JSON preset body (Creality / Orca / Bambu).
    pub preset_json: Option<Value>,
    /// Raw text preset body (PrusaSlicer INI / config bundle).
    pub preset_text: Option<String>,
    pub info_text: Option<String>,
    pub file_name: String,
    pub user_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct InstallResponse {
    pub ok: bool,
    pub json_path: String,
    pub info_path: Option<String>,
    pub backup_dir: Option<String>,
    pub filament_dir: String,
}

fn sanitize_file_name(name: &str, slicer: &str) -> Result<String, String> {
    let base = Path::new(name)
        .file_name()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "Invalid fileName".to_string())?;
    if base.contains("..") || base.contains('/') || base.contains('\\') {
        return Err("fileName must be a bare file name".into());
    }
    let lower = base.to_ascii_lowercase();
    let with_ext = if slicer == "prusaslicer" {
        if lower.ends_with(".ini") {
            base.to_string()
        } else {
            format!("{base}.ini")
        }
    } else if lower.ends_with(".json") {
        base.to_string()
    } else {
        format!("{base}.json")
    };
    Ok(with_ext)
}

fn backup_existing(target: &Path, filament_dir: &Path) -> Result<Option<PathBuf>, String> {
    if !target.exists() {
        return Ok(None);
    }
    let ts = chrono::Utc::now().format("%Y%m%dT%H%M%SZ");
    let backup_root = filament_dir.join(".open-filament-backups").join(format!("of-{ts}"));
    fs::create_dir_all(&backup_root).map_err(|e| e.to_string())?;
    let dest = backup_root.join(target.file_name().unwrap());
    fs::copy(target, &dest).map_err(|e| e.to_string())?;
    let info = target.with_extension("info");
    if info.exists() {
        let _ = fs::copy(&info, backup_root.join(info.file_name().unwrap()));
    }
    Ok(Some(backup_root))
}

pub fn install_preset(req: InstallRequest) -> Result<InstallResponse, String> {
    let slicer = match req.slicer.as_str() {
        "creality_print" | "orca" | "prusaslicer" | "bambu_studio" => req.slicer.as_str(),
        other => {
            return Err(format!(
                "slicer must be creality_print|orca|prusaslicer|bambu_studio, got {other}"
            ))
        }
    };

    let file_name = sanitize_file_name(&req.file_name, slicer)?;
    let filament_dir = resolve_install_dir(slicer)?;
    let json_path = filament_dir.join(&file_name);

    if !is_path_allowlisted(&json_path, slicer)
        && std::env::var_os("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE").is_none()
    {
        return Err("Resolved path is outside allowlisted filament directories".into());
    }

    fs::create_dir_all(&filament_dir).map_err(|e| e.to_string())?;

    let backup_dir = backup_existing(&json_path, &filament_dir)?;

    if slicer == "prusaslicer" {
        let text = req
            .preset_text
            .filter(|s| !s.trim().is_empty())
            .or_else(|| {
                req.preset_json.as_ref().and_then(|v| {
                    v.get("iniText")
                        .and_then(|x| x.as_str())
                        .map(|s| s.to_string())
                })
            })
            .ok_or_else(|| "prusaslicer install requires presetText (INI)".to_string())?;
        if !text.contains("Open Filament user preset") {
            return Err("Prusa INI must contain Open Filament user preset marker".into());
        }
        fs::write(&json_path, text).map_err(|e| e.to_string())?;
    } else {
        let preset = req
            .preset_json
            .ok_or_else(|| "presetJson required for JSON slicers".to_string())?;
        let pretty = serde_json::to_string_pretty(&preset).map_err(|e| e.to_string())?;
        fs::write(&json_path, &pretty).map_err(|e| e.to_string())?;
        let written = fs::read_to_string(&json_path).map_err(|e| e.to_string())?;
        let _: Value = serde_json::from_str(&written)
            .map_err(|e| format!("Wrote file but failed to re-parse as JSON: {e}"))?;
    }

    let mut info_path = None;
    if let Some(info) = req.info_text {
        let ip = json_path.with_extension("info");
        fs::write(&ip, info).map_err(|e| e.to_string())?;
        info_path = Some(ip.display().to_string());
    } else if slicer == "creality_print" {
        if let Some(uid) = req.user_id {
            let setting_id = format!("{:x}", chrono::Utc::now().timestamp_millis());
            let text = format!(
                "sync_info = \nuser_id = {uid}\nsetting_id = {setting_id}\nbase_id = GFSA04\nupdated_time = {}\n",
                chrono::Utc::now().timestamp()
            );
            let ip = json_path.with_extension("info");
            fs::write(&ip, text).map_err(|e| e.to_string())?;
            info_path = Some(ip.display().to_string());
        }
    }

    Ok(InstallResponse {
        ok: true,
        json_path: json_path.display().to_string(),
        info_path,
        backup_dir: backup_dir.map(|p| p.display().to_string()),
        filament_dir: filament_dir.display().to_string(),
    })
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListRequest {
    pub slicer: String,
    /// If true, only names containing "Open Filament" / starting with OF patterns; else all .json
    pub of_only: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct ListedPreset {
    pub file_name: String,
    pub path: String,
    pub has_info: bool,
}

pub fn list_presets(req: ListRequest) -> Result<Vec<ListedPreset>, String> {
    let slicer = match req.slicer.as_str() {
        "creality_print" | "orca" => req.slicer.as_str(),
        other => return Err(format!("slicer must be creality_print|orca, got {other}")),
    };
    let dir = resolve_install_dir(slicer)?;
    let of_only = req.of_only.unwrap_or(false);
    let mut out = Vec::new();
    let entries = fs::read_dir(&dir).map_err(|e| e.to_string())?;
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("json") {
            continue;
        }
        let name = path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or_default()
            .to_string();
        if of_only {
            let content = fs::read_to_string(&path).unwrap_or_default();
            if !content.contains("Open Filament") && !name.contains("Open Filament") {
                continue;
            }
        }
        let has_info = path.with_extension("info").exists();
        out.push(ListedPreset {
            file_name: name,
            path: path.display().to_string(),
            has_info,
        });
    }
    out.sort_by(|a, b| a.file_name.cmp(&b.file_name));
    Ok(out)
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RollbackRequest {
    pub backup_dir: String,
    pub slicer: String,
}

pub fn rollback_preset(req: RollbackRequest) -> Result<InstallResponse, String> {
    let slicer = match req.slicer.as_str() {
        "creality_print" | "orca" => req.slicer.as_str(),
        other => return Err(format!("slicer must be creality_print|orca, got {other}")),
    };
    let backup = PathBuf::from(&req.backup_dir);
    if !backup.is_dir() {
        return Err("backup_dir does not exist".into());
    }
    let filament_dir = resolve_install_dir(slicer)?;
    // Only restore from backups under filament_dir/.open-filament-backups
    let allowed_root = filament_dir.join(".open-filament-backups");
    let canon_backup = backup
        .canonicalize()
        .map_err(|e| format!("invalid backup_dir: {e}"))?;
    let canon_allowed = allowed_root
        .canonicalize()
        .map_err(|e| format!("no backups root: {e}"))?;
    if !canon_backup.starts_with(&canon_allowed) {
        return Err("backup_dir outside allowlisted backups root".into());
    }
    let mut restored_json = None;
    let mut restored_info = None;
    for entry in fs::read_dir(&backup).map_err(|e| e.to_string())?.flatten() {
        let path = entry.path();
        let name = path
            .file_name()
            .and_then(|s| s.to_str())
            .ok_or_else(|| "bad backup entry".to_string())?;
        let dest = filament_dir.join(name);
        if !is_path_allowlisted(&dest, slicer)
            && std::env::var_os("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE").is_none()
        {
            return Err("restore path outside allowlist".into());
        }
        fs::copy(&path, &dest).map_err(|e| e.to_string())?;
        if name.ends_with(".json") {
            restored_json = Some(dest.display().to_string());
        }
        if name.ends_with(".info") {
            restored_info = Some(dest.display().to_string());
        }
    }
    let json_path = restored_json.ok_or_else(|| "No .json in backup".to_string())?;
    Ok(InstallResponse {
        ok: true,
        json_path,
        info_path: restored_info,
        backup_dir: Some(backup.display().to_string()),
        filament_dir: filament_dir.display().to_string(),
    })
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveRequest {
    pub slicer: String,
    pub file_name: String,
}

pub fn remove_preset(req: RemoveRequest) -> Result<InstallResponse, String> {
    let slicer = match req.slicer.as_str() {
        "creality_print" | "orca" | "prusaslicer" | "bambu_studio" => req.slicer.as_str(),
        other => {
            return Err(format!(
                "slicer must be creality_print|orca|prusaslicer|bambu_studio, got {other}"
            ))
        }
    };
    let file_name = sanitize_file_name(&req.file_name, slicer)?;
    let filament_dir = resolve_install_dir(slicer)?;
    let json_path = filament_dir.join(&file_name);
    if !json_path.exists() {
        return Err("preset not found".into());
    }
    let content = fs::read_to_string(&json_path).unwrap_or_default();
    if !content.contains("Open Filament") {
        return Err("Refusing to remove preset that is not an Open Filament install".into());
    }
    let backup_dir = backup_existing(&json_path, &filament_dir)?;
    fs::remove_file(&json_path).map_err(|e| e.to_string())?;
    let info = json_path.with_extension("info");
    let info_path = if info.exists() {
        fs::remove_file(&info).map_err(|e| e.to_string())?;
        Some(info.display().to_string())
    } else {
        None
    };
    Ok(InstallResponse {
        ok: true,
        json_path: json_path.display().to_string(),
        info_path,
        backup_dir: backup_dir.map(|p| p.display().to_string()),
        filament_dir: filament_dir.display().to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::sync::Mutex;

    static ENV_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn install_into_override_dir() {
        let _guard = ENV_LOCK.lock().unwrap();
        let dir = tempfile::tempdir().unwrap();
        std::env::set_var("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE", dir.path());
        let resp = install_preset(InstallRequest {
            slicer: "creality_print".into(),
            preset_json: Some(json!({
                "name": "Test ASA @Creality K2 Plus 0.6 nozzle",
                "from": "User",
                "inherits": "HP-ASA @Creality K2 Plus 0.6 nozzle",
                "filament_notes": ["Open Filament user preset"]
            })),
            preset_text: None,
            info_text: Some("sync_info = \nuser_id = 1\nsetting_id = abc\nbase_id = GFSA04\nupdated_time = 1\n".into()),
            file_name: "Test ASA @Creality K2 Plus 0.6 nozzle.json".into(),
            user_id: None,
        })
        .unwrap();
        assert!(resp.ok);
        assert!(Path::new(&resp.json_path).exists());
        let parsed: Value =
            serde_json::from_str(&fs::read_to_string(&resp.json_path).unwrap()).unwrap();
        assert_eq!(parsed["from"], "User");

        let resp2 = install_preset(InstallRequest {
            slicer: "creality_print".into(),
            preset_json: Some(json!({
                "name": "Test ASA @Creality K2 Plus 0.6 nozzle",
                "from": "User",
                "inherits": "HP-ASA @Creality K2 Plus 0.6 nozzle",
                "filament_notes": ["Open Filament user preset"],
                "filament_flow_ratio": ["0.99"]
            })),
            preset_text: None,
            info_text: Some("sync_info = \nuser_id = 1\nsetting_id = abc\nbase_id = GFSA04\nupdated_time = 2\n".into()),
            file_name: "Test ASA @Creality K2 Plus 0.6 nozzle.json".into(),
            user_id: None,
        })
        .unwrap();
        assert!(resp2.backup_dir.is_some());
        let rolled = rollback_preset(RollbackRequest {
            backup_dir: resp2.backup_dir.unwrap(),
            slicer: "creality_print".into(),
        })
        .unwrap();
        assert!(rolled.ok);
        let restored: Value =
            serde_json::from_str(&fs::read_to_string(&rolled.json_path).unwrap()).unwrap();
        assert!(restored.get("filament_flow_ratio").is_none());

        let removed = remove_preset(RemoveRequest {
            slicer: "creality_print".into(),
            file_name: "Test ASA @Creality K2 Plus 0.6 nozzle.json".into(),
        })
        .unwrap();
        assert!(removed.ok);
        assert!(!Path::new(&removed.json_path).exists());

        std::env::remove_var("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE");
    }

    #[test]
    fn install_prusa_ini() {
        let _guard = ENV_LOCK.lock().unwrap();
        let dir = tempfile::tempdir().unwrap();
        std::env::set_var("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE", dir.path());
        let ini =
            "[filament:Test ASA]\ninherits = *ABS*\nfilament_notes = \"Open Filament user preset\"\n";
        let resp = install_preset(InstallRequest {
            slicer: "prusaslicer".into(),
            preset_json: None,
            preset_text: Some(ini.into()),
            info_text: None,
            file_name: "Test ASA.ini".into(),
            user_id: None,
        })
        .unwrap();
        assert!(resp.ok);
        assert!(resp.json_path.ends_with(".ini"));
        let body = fs::read_to_string(&resp.json_path).unwrap();
        assert!(body.contains("inherits = *ABS*"));
        std::env::remove_var("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE");
    }
}
