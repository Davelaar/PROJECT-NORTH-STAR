# CURRENT STATE — Phase 0 Repository Audit

**Audit date:** 2026-08-09  
**Auditor role:** Phase 0 (inspect only; no feature implementation)

---

## 1. Critical finding

The Cursor workspace originally opened for this session was **`/Users/raymonddavelaar/Projects/kraken-scalper`**.

That repository is a **Kraken cryptocurrency scalping / research trading bot** (Rust). It contains **zero** filament, slicer, RFID, or 3D-printing domain code.

Under `/Users/raymonddavelaar/Projects/` the only existing project at audit time was `kraken-scalper`.

**Conclusion:** Open Filament is a **greenfield** project. No existing architecture should be reused from `kraken-scalper`.

### Workspace correction performed

| Action | Path |
|--------|------|
| Created empty git repo | `/Users/raymonddavelaar/Projects/open-filament` |
| Moved agent workspace root | to `open-filament` |
| Commits | none yet (`main`, empty tree) |

This document and `PROJECT_IMPLEMENTATION_PLAN.md` live in the new repo. Nothing from this initiative was written into `kraken-scalper`.

---

## 2. Audited repository: `kraken-scalper` (context only)

Audited because it was the initial workspace. Results are recorded for completeness of §76 of the master specification. They are **not** foundations for Open Filament.

### 2.1 Identity

| Item | Value |
|------|--------|
| Language | Rust 2021 |
| Package | `kraken-scalper` 0.1.0 |
| Package manager | Cargo |
| Primary binary | `src/main.rs` (no `lib` target) |
| Domain | Exchange trading, decision engines, AME/AOS research, VPS deploy |

### 2.2 Structure (top level)

```
kraken-scalper/
  Cargo.toml / Cargo.lock
  src/           # analyser, config, decision, entry, executor, kraken, …
  scripts/       # Python research / ops scripts
  deploy/        # systemd units, logrotate
  deploy.sh
  data/, logs/, reports/, target/
  .cursor/rules/ # VPS deploy hygiene rules (trading-specific)
```

Approximate scale: **~301** `.rs` files under `src/`; **~195** files containing `#[test]` / `#[cfg(test)]`.

### 2.3 Dependencies (representative)

Tokio, tokio-tungstenite, serde, reqwest, rusqlite, rust_decimal, tracing, dotenvy, uuid, hmac/sha2 — all exchange/trading oriented. **No** web framework for a public community site, **no** PostgreSQL ORM for multi-tenant filament data, **no** NFC/RFID stacks.

### 2.4 Database

Local **SQLite** (`rusqlite`) for research/warehouse-style usage in the trading bot. Not a candidate for the Open Filament canonical store.

### 2.5 Auth / frontend / API

- No public REST API product surface for community filaments.
- No web frontend application.
- No OpenAPI.
- Auth is exchange API keys via `.env` (trading secrets) — orthogonal and must not be confused with Open Filament auth design.

### 2.6 Tests (executed 2026-08-09)

```
cargo test
→ FAILED
→ 1069 passed; 14 failed; finished in ~235s
```

Failures were concentrated in trading modules (`position_monitor`, `slot_registry`, `aos_planner`, mover tracking, etc.). **Irrelevant** to Open Filament except as evidence that the audited tree is an active, unfinished trading codebase with dirty local changes.

### 2.7 Linting / static analysis

- `clippy` and `rustfmt` available (clippy 0.1.94 / rustc toolchain dated 2026-03-02).
- Full `cargo clippy` was started after tests; not required for Open Filament decisions.
- No ESLint/TypeScript toolchain in that repo.

### 2.8 CI/CD / deployment

- **No** `.github/workflows` CI configuration observed.
- Deployment is **custom VPS** (`deploy.sh`, systemd units under `deploy/`) for the trading binary.
- Cursor rule `deploy-vps-cleanup.mdc` applies to that trading deploy path only.

### 2.9 Git status (snapshot at session start)

- Branch: `master`
- Many modified tracked files + large untracked `reports/` tree
- Unrelated dirty tree; **do not** mix Open Filament work into it

### 2.10 Existing architecture relevant to the Open Filament specification

**None.** No domain overlap.

---

## 3. Open Filament repository state (post Phase 0 bootstrap)

| Item | Value |
|------|--------|
| Path | `/Users/raymonddavelaar/Projects/open-filament` |
| Git | initialized, **no commits** |
| Code | empty (docs only after this phase) |
| Stack | **not yet scaffolded** — decisions in `PROJECT_IMPLEMENTATION_PLAN.md` |
| Tests / lint / CI | N/A until scaffolding |

---

## 4. Implications for implementation

1. Phase 0 is complete for the accidental workspace and for confirming greenfield status.
2. Do **not** rewrite or “adapt” `kraken-scalper`.
3. Next step after plan review: scaffold monorepo, choose confirmed stack options, then Phase 1 domain foundation.
4. All documentation listed in the master spec (§48) should be created in `open-filament/docs/` as phases land — starting with the implementation plan.

---

## 5. Explicit non-actions taken

- No speculative rewrite of the trading bot.
- No hundreds of application source files generated.
- No invented Creality RFID constants or calibration “facts.”
- No credentials committed.
