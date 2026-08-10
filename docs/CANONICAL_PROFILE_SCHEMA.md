# OpenFilamentProfile schema

Package: `@open-filament/canonical-profile`

- Zod: `openFilamentProfileV1Schema`
- JSON Schema: `packages/canonical-profile/schemas/openfilamentprofile-v1.json` (copy under `/schemas`)
- Helper: `toCanonicalFromRevision(source)`

## Version

`schemaVersion: "openfilamentprofile-v1"`

## Sections

`provenance`, `filament`, `context`, `thermal`, `extrusion`, `cooling`, `retraction`, `preparation`, optional `extensions`.

Unknown numerics are JSON `null`. `provenance.isSyntheticFixture` must be set for demo/seed data.

Slicer-specific leftovers belong under `extensions.creality` / `extensions.orca` / `extensions.unknown` — not in core fields.
