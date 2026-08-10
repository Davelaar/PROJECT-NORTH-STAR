//! Detect local Creality Print / OrcaSlicer / PrusaSlicer / Bambu Studio dirs.

use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize)]
pub struct DetectedSlicer {
    pub id: &'static str,
    pub name: &'static str,
    pub found: bool,
    pub filament_dirs: Vec<String>,
    pub platform_hints: Vec<String>,
}

fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
}

fn creality_candidates(home: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    out.push(home.join("Library/Application Support/Creality/Creality Print"));
    if let Some(appdata) = std::env::var_os("APPDATA") {
        out.push(PathBuf::from(appdata).join("Creality/Creality Print"));
    }
    out.push(home.join(".config/Creality/Creality Print"));
    out.push(home.join(".local/share/Creality/Creality Print"));
    out
}

fn orca_candidates(home: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    out.push(home.join("Library/Application Support/OrcaSlicer"));
    if let Some(appdata) = std::env::var_os("APPDATA") {
        out.push(PathBuf::from(appdata).join("OrcaSlicer"));
    }
    out.push(home.join(".config/OrcaSlicer"));
    out
}

fn bambu_candidates(home: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    out.push(home.join("Library/Application Support/BambuStudio"));
    out.push(home.join("Library/Application Support/BambuStudioBeta"));
    if let Some(appdata) = std::env::var_os("APPDATA") {
        out.push(PathBuf::from(&appdata).join("BambuStudio"));
        out.push(PathBuf::from(&appdata).join("BambuStudioBeta"));
    }
    out.push(home.join(".config/BambuStudio"));
    out
}

fn prusa_candidates(home: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    // PrusaSlicer stores user filaments under <root>/filament (INI files)
    out.push(home.join("Library/Application Support/PrusaSlicer"));
    out.push(home.join("Library/Application Support/PrusaSlicer-alpha"));
    out.push(home.join("Library/Application Support/PrusaSlicer-beta"));
    if let Some(appdata) = std::env::var_os("APPDATA") {
        out.push(PathBuf::from(&appdata).join("PrusaSlicer"));
    }
    out.push(home.join(".config/PrusaSlicer"));
    out
}

/// Walk `root/*/user/*/filament` and `root/user/*/filament`.
fn find_filament_dirs(root: &Path) -> Vec<PathBuf> {
    let mut found = Vec::new();
    if !root.exists() {
        return found;
    }

    if let Ok(entries) = std::fs::read_dir(root) {
        for entry in entries.flatten() {
            let ver = entry.path();
            let user_root = ver.join("user");
            collect_user_filament(&user_root, &mut found);
        }
    }

    collect_user_filament(&root.join("user"), &mut found);

    found.sort();
    found.dedup();
    found
}

fn collect_user_filament(user_root: &Path, found: &mut Vec<PathBuf>) {
    if !user_root.is_dir() {
        return;
    }
    if let Ok(users) = std::fs::read_dir(user_root) {
        for user in users.flatten() {
            let filament = user.path().join("filament");
            if filament.is_dir() {
                found.push(filament);
            }
        }
    }
}

/// Prusa: `<config>/filament` directory of .ini presets.
fn find_prusa_filament_dirs(root: &Path) -> Vec<PathBuf> {
    let mut found = Vec::new();
    if !root.exists() {
        return found;
    }
    let filament = root.join("filament");
    if filament.is_dir() {
        found.push(filament);
    } else if root.exists() {
        // Directory may not exist yet — still report parent for create-on-install
        found.push(filament);
    }
    found
}

/// When set, all install/list operations use this directory (tests / dry-run).
pub fn filament_root_override() -> Option<PathBuf> {
    std::env::var_os("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE").map(PathBuf::from)
}

fn with_override(mut dirs: Vec<PathBuf>) -> Vec<PathBuf> {
    if let Some(over) = filament_root_override() {
        if over.is_dir() || over.parent().is_some() {
            dirs.insert(0, over);
        }
    }
    dirs
}

pub fn detect_slicers() -> Vec<DetectedSlicer> {
    let home = match home_dir() {
        Some(h) => h,
        None => {
            return vec![
                DetectedSlicer {
                    id: "creality_print",
                    name: "Creality Print",
                    found: false,
                    filament_dirs: vec![],
                    platform_hints: vec!["HOME/USERPROFILE not set".into()],
                },
                DetectedSlicer {
                    id: "orca",
                    name: "OrcaSlicer",
                    found: false,
                    filament_dirs: vec![],
                    platform_hints: vec![],
                },
                DetectedSlicer {
                    id: "prusaslicer",
                    name: "PrusaSlicer",
                    found: false,
                    filament_dirs: vec![],
                    platform_hints: vec![],
                },
                DetectedSlicer {
                    id: "bambu_studio",
                    name: "Bambu Studio",
                    found: false,
                    filament_dirs: vec![],
                    platform_hints: vec![],
                },
            ];
        }
    };

    let mut creality_dirs = Vec::new();
    let mut creality_hints = Vec::new();
    for cand in creality_candidates(&home) {
        creality_hints.push(cand.display().to_string());
        creality_dirs.extend(find_filament_dirs(&cand));
    }

    let mut orca_dirs = Vec::new();
    let mut orca_hints = Vec::new();
    for cand in orca_candidates(&home) {
        orca_hints.push(cand.display().to_string());
        orca_dirs.extend(find_filament_dirs(&cand));
    }

    let mut prusa_dirs = Vec::new();
    let mut prusa_hints = Vec::new();
    for cand in prusa_candidates(&home) {
        prusa_hints.push(cand.display().to_string());
        prusa_dirs.extend(find_prusa_filament_dirs(&cand));
    }
    // Only mark found when the config root exists (not merely projected filament path)
    let prusa_found = prusa_candidates(&home).iter().any(|p| p.exists());

    let mut bambu_dirs = Vec::new();
    let mut bambu_hints = Vec::new();
    for cand in bambu_candidates(&home) {
        bambu_hints.push(cand.display().to_string());
        bambu_dirs.extend(find_filament_dirs(&cand));
    }

    let creality_dirs = with_override(creality_dirs);
    let orca_dirs = with_override(orca_dirs);
    let prusa_dirs = with_override(prusa_dirs);
    let bambu_dirs = with_override(bambu_dirs);

    vec![
        DetectedSlicer {
            id: "creality_print",
            name: "Creality Print",
            found: !creality_dirs.is_empty(),
            filament_dirs: creality_dirs
                .iter()
                .map(|p| p.display().to_string())
                .collect(),
            platform_hints: creality_hints,
        },
        DetectedSlicer {
            id: "orca",
            name: "OrcaSlicer",
            found: !orca_dirs.is_empty(),
            filament_dirs: orca_dirs
                .iter()
                .map(|p| p.display().to_string())
                .collect(),
            platform_hints: orca_hints,
        },
        DetectedSlicer {
            id: "prusaslicer",
            name: "PrusaSlicer",
            found: prusa_found || filament_root_override().is_some(),
            filament_dirs: prusa_dirs
                .iter()
                .map(|p| p.display().to_string())
                .collect(),
            platform_hints: prusa_hints,
        },
        DetectedSlicer {
            id: "bambu_studio",
            name: "Bambu Studio",
            found: !bambu_dirs.is_empty(),
            filament_dirs: bambu_dirs
                .iter()
                .map(|p| p.display().to_string())
                .collect(),
            platform_hints: bambu_hints,
        },
    ]
}

pub fn resolve_install_dir(slicer: &str) -> Result<PathBuf, String> {
    if let Some(over) = filament_root_override() {
        std::fs::create_dir_all(&over).map_err(|e| e.to_string())?;
        return Ok(over);
    }

    let slicers = detect_slicers();
    let target = slicers
        .into_iter()
        .find(|s| s.id == slicer)
        .ok_or_else(|| format!("Unknown slicer \"{slicer}\""))?;

    target
        .filament_dirs
        .first()
        .map(PathBuf::from)
        .ok_or_else(|| {
            format!(
                "No filament directory found for {slicer}. Install the slicer or set OF_BRIDGE_FILAMENT_ROOT_OVERRIDE."
            )
        })
}

pub fn is_path_allowlisted(path: &Path, slicer: &str) -> bool {
    if let Some(over) = filament_root_override() {
        return path.starts_with(&over) || path == over;
    }
    detect_slicers()
        .into_iter()
        .filter(|s| s.id == slicer)
        .flat_map(|s| s.filament_dirs)
        .any(|d| path.starts_with(Path::new(&d)))
}
