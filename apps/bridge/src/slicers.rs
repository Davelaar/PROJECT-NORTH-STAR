//! Detect local Creality Print / OrcaSlicer filament directories.

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
    // macOS
    out.push(
        home.join("Library/Application Support/Creality/Creality Print"),
    );
    // Windows
    if let Some(appdata) = std::env::var_os("APPDATA") {
        out.push(PathBuf::from(appdata).join("Creality/Creality Print"));
    }
    // Linux
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

/// Walk `root/*/user/*/filament` and `root/user/*/filament`.
fn find_filament_dirs(root: &Path) -> Vec<PathBuf> {
    let mut found = Vec::new();
    if !root.exists() {
        return found;
    }

    // Versioned Creality: <root>/<ver>/user/<id>/filament
    if let Ok(entries) = std::fs::read_dir(root) {
        for entry in entries.flatten() {
            let ver = entry.path();
            let user_root = ver.join("user");
            collect_user_filament(&user_root, &mut found);
        }
    }

    // Orca: <root>/user/default/filament
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

/// When set, all install/list operations use this directory (tests / dry-run).
pub fn filament_root_override() -> Option<PathBuf> {
    std::env::var_os("OF_BRIDGE_FILAMENT_ROOT_OVERRIDE").map(PathBuf::from)
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

    if let Some(over) = filament_root_override() {
        // Override is treated as a single allowlisted filament dir for installs.
        if over.is_dir() || over.parent().is_some() {
            creality_dirs.insert(0, over.clone());
            orca_dirs.insert(0, over);
        }
    }

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
