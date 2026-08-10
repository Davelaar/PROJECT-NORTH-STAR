# Contributing

1. Keep the DB as source of truth; adapters stay pure and honest about unknowns.
2. Mark synthetic / unverified calibration and RFID data clearly.
3. Do not invent Creality CFS binary constants claiming hardware compatibility.
4. Prefer small PRs with tests for domain, codecs, and adapters.
5. Run `pnpm test` and `cargo check -p open-filament-bridge` before opening a PR.

License: Apache-2.0. See DEVELOPMENT.md for local setup.
