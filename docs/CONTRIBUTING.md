# Contributing

Open Filament is **public to use** — no account is required to browse, search, export profiles, or use QR/RFID tools on [openfilament.nl](https://openfilament.nl).

## How to contribute

Everyday contributions go through **GitHub**, not through a site login:

1. Fork [Davelaar/PROJECT-NORTH-STAR](https://github.com/Davelaar/PROJECT-NORTH-STAR)
2. Add or fix filament/printer catalog data, docs, or code
3. Open a pull request
4. Or [open an issue](https://github.com/Davelaar/PROJECT-NORTH-STAR/issues/new) for bugs and proposals

On the site: [/contribute](https://openfilament.nl/contribute)

## Guidelines

1. Keep the DB as source of truth; adapters stay pure and honest about unknowns.
2. Mark synthetic / unverified calibration and RFID data clearly.
3. Do not invent Creality CFS binary constants claiming hardware compatibility.
4. Prefer small PRs with tests for domain, codecs, and adapters.
5. Run `pnpm test` and `cargo check -p open-filament-bridge` before opening a PR.
6. Attribute redistributed public datasets (OFD MIT, Open 3D Printer Database CC-BY-4.0).

## For measured calibrations (on this site)

Anyone can publish a calibration on [openfilament.nl/submit](https://openfilament.nl/submit) **without an account**.

Required fields:

- Nozzle temperature range (min / max °C)
- Calibrated nozzle diameter
- Tested bed temperature
- If an **active chamber heater** was used: chamber set temperature

Catalog brand/colour data may be **seeded** from the [Open Filament Database](https://openfilamentdatabase.org) (MIT) into our **server-hosted SQLite** on OpenFilament. Serving the site does **not** depend on OFD being online. The live catalog, community additions, and calibrations all live on OpenFilament — add or correct brands, products and colours here (for example via Submit / community catalog APIs). There is no requirement to use the OFD editor for OpenFilament catalog changes.

## For brands

Filament and printer manufacturers are welcome to contribute samples and loan hardware so we can publish open, measured profiles.

### Printers we can test on today

We currently calibrate only on these three printers:

| Printer | Nozzle sizes |
|---|---|
| Creality K2 Plus | 0.2 / 0.4 / 0.6 / 0.8 mm |
| Creality Ender 3 | 0.4 mm |
| Flashforge AD5X | 0.4 mm |

**Compatibility:** filament or resin samples must be printable on one of these printers. If they are not (for example resin, or a material that needs another machine), ship a suitable printer together with the material.

- **Filament samples** — send samples for calibration on the printers above. We measure, publish open profiles on Open Filament, and may film parts of the process for YouTube — useful exposure for lesser-known brands, the channel, and this site.
- **Printer loans** — you may ship printers for testing and profile work, especially when your material needs a machine we do not have yet.
- **Return policy** — loan printers are returned **only** if you explicitly request return **and** include a prepaid return shipping label with the shipment. Without both a clear return request and a return label, the printer will not be sent back.
- **Contact** — email [contact@openfilament.nl](mailto:contact@openfilament.nl) before shipping anything. Do not send parcels until we confirm the shipping address and what to send.

License: Apache-2.0. See DEVELOPMENT.md for local setup.

Operator-only routes (`/login`, `/admin`) exist for maintainers and are not part of the public navigation.
