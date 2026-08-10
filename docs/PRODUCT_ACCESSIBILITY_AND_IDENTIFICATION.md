# PRODUCT ACCESSIBILITY AND IDENTIFICATION

**Status:** Product / UX specification (companion to the Master Build Specification)  
**Source:** User product brief (`specsopenfilament.rtf`) + web-first / PWA architecture migration  
**Scope:** How users identify physical spools and how OpenFilament stays accessible across skill and hardware levels — **in the browser first**.

This document sits **beside** the master engineering specification. Architecture and domain rules remain in the master spec and `docs/ARCHITECTURE.md`. This file defines the **product principle** for identification and progressive UX.

---

## Product principle — identify your filament your way

OpenFilament must make physical filament identification accessible to every 3D-printing user.

RFID is one method.  
QR is another.

Neither is considered a second-class solution.

The platform must support both methods side-by-side wherever practical.

A user should be able to choose the method that best matches their printer, budget and technical interest.

---

## Two identification methods — one filament identity

Every filament variant in OpenFilament receives a stable OpenFilament identity.

That identity exists independently from the physical identification method.

A spool can therefore be associated with OpenFilament using:

**RFID**

or:

**QR**

or eventually both.

Conceptually:

```
OpenFilament Filament UUID
│
├── QR label
│
└── RFID mapping
    ├── Creality CFS
    └── future RFID systems
```

The database remains the source of truth.

QR and RFID are simply different ways of connecting a physical spool to that database entry.

---

## Option 1 — QR

QR must be a complete mainstream workflow.

It must **NOT** be presented as a fallback for users who cannot use RFID.

The intended workflow is:

**Find filament → Select variant → Add spool → Generate QR → Print label → Attach label to spool → Scan whenever required.**

A QR code should primarily contain a stable OpenFilament identifier or URL.

It should **NOT** contain the complete filament profile.

Example concept:

`openfilament://spool/{UUID}`

or a stable HTTPS URL.

The database resolves that identifier to:

- manufacturer;
- product;
- variant;
- color;
- spool;
- printer profiles;
- calibration data.

---

## Print QR label

The **web app** should provide:

**Print QR Label**

Users should have several options:

### Normal printer

Generate a printable PDF or image.  
No special hardware required.

### Label printer

Print directly to a supported inexpensive thermal label printer.

### Download

Download:

- PNG  
- SVG  
- PDF  

for use with any other label system.

No proprietary label printer must ever be mandatory.

---

## Label design

Generate attractive compact spool labels.

At minimum include:

- QR code  
- and human-readable: Manufacturer, Material, Variant / Color  

Optionally:

- OpenFilament logo  
- spool ID  
- date opened  
- remaining weight  
- drying information  

Example:

```
OPENFILAMENT
Flashforge
ASA
Burnt Titanium
[ QR ]
OF-8F42A1
```

The QR code must remain usable even if the user does not print the decorative portions.

---

## Option 2 — RFID

RFID provides additional convenience for compatible automatic material systems.

Target experience:

**Find filament → Select variant → Write RFID → Place tag on spool → Insert spool → Material system recognizes it.**

The normal user must never need to understand:

- MIFARE sectors;
- keys;
- hexadecimal values;
- checksums;
- authentication;
- memory blocks.

OpenFilament handles those details.

---

## Creality CFS

The initial RFID target is Creality CFS.

For compatible tags, OpenFilament should generate the appropriate Creality-compatible representation.

The target user experience is:

Flashforge ASA Burnt Titanium

Identification:

- ○ QR  
- ● Creality CFS RFID  

**[ Write RFID ]**

The application detects the reader and tag automatically.

---

## QR + RFID

Users may optionally use both.

For example:

A spool may have a CFS-compatible RFID sticker for automatic detection and an OpenFilament QR label for universal identification.

Both resolve to the same OpenFilament spool.

This provides an important separation:

- RFID may be vendor-specific.  
- QR remains universal.  

If the user later changes from Creality to another printer ecosystem, the QR label remains useful.

---

## No special hardware required

The lowest-cost OpenFilament experience requires:

**nothing.**

A user can:

- search the database;
- view profiles;
- download profiles;
- generate QR labels;
- print QR labels with a normal printer.

The next level requires only:

an inexpensive thermal label printer.

The RFID level additionally requires:

- a compatible NFC/RFID writer;
- compatible tags.

The user chooses how far to go.

---

## Hardware should be optional and commodity-based

OpenFilament should prefer inexpensive, readily available hardware.

Do not require proprietary OpenFilament hardware where commodity hardware can perform the same task.

Maintain a compatibility catalogue:

### QR printers

Recommended · Compatible · Experimental

### RFID readers/writers

Recommended · Compatible · Experimental

### RFID tags

Recommended · Compatible · Experimental

For each device show:

- Windows support  
- macOS support  
- Linux support  
- connection type  
- tested functions  
- approximate price  
- purchase links  

---

## Consumer-grade access (web-first)

OpenFilament is open source **and** web-first.

Using it must not feel like installing a development project — and must **not** require an OS-specific desktop installer for core use.

**Normal access:**

1. Open the OpenFilament website (or optional PWA install from the browser).
2. Search filaments, download profiles, generate/resolve QR, encode RFID payloads.

**Not required for core use:**

- `OpenFilament-Setup.exe` / `.dmg` / AppImage as the primary product
- Git, Python, Node, Docker, terminal, or compilation (those are for contributors)
- A local bridge or localhost service
- Administrator rights
- Manual updates of a desktop binary

Optional PWA install is never mandatory. Optional native helpers exist only for documented browser gaps (see [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`LOCAL_BRIDGE.md`](./LOCAL_BRIDGE.md)).

---

## One OpenFilament product (the web app)

Do not present a separate “desktop app + local bridge” as what ordinary users must install.

The user opens:

**OpenFilament** (browser / optional PWA)

That experience handles:

- search and profiles;
- profile download / optional File System Access save;
- QR identification;
- RFID encode and (when implemented) browser hardware write;
- progressive enhancement via capability detection.

Any local helper is an advanced compatibility detail, not the product name users are sold.

---

## Progressive user experience

OpenFilament should work for three broad user levels.

### Standard user

Search filament.  
Select printer.  
**Download** recommended profile and import in the slicer.  

Optionally:

Print QR  

or:

Write RFID (when browser/hardware support allows).  

Done.

### Advanced 3D-printing user

Inspect:

- temperature;
- flow ratio;
- pressure advance;
- maximum volumetric flow;
- cooling;
- retraction;
- raw calibration measurements.

Modify or submit profiles.

### Developer / enthusiast

Access:

- API;
- canonical profile format;
- RFID codec;
- raw tag contents;
- custom hardware transports;
- logs;
- source code.

Level 3 must never be required to use Level 1.

---

## The target experience

A user buys:

Flashforge ASA Burnt Titanium.

They open OpenFilament.

Search:

Flashforge ASA Burnt Titanium

OpenFilament finds the exact product.

The user selects:

Creality K2 Plus  
0.4 mm nozzle.

A community profile already exists.

The user clicks:

**Install Profile**

The profile is installed into the supported slicer.

OpenFilament then asks:

**Identify this spool**

- [ Print QR ]  
- [ Write RFID ]  

The QR user prints a label and attaches it.  
The RFID user places a MIFARE tag on the supported writer and clicks Write.  
A user may do both.

From that point onward, the physical spool has a persistent relationship with the OpenFilament database.

The complexity remains inside OpenFilament.

The user gets:

**Find → Install → Identify → Print.**

---

## Related docs

| Doc | Role |
|-----|------|
| Master Build Specification (user brief) | Full engineering / domain / phase plan |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Technical layering |
| [`RFID_ARCHITECTURE.md`](./RFID_ARCHITECTURE.md) | RFID adapter model |
| [`CREALITY_CFS_RFID.md`](./CREALITY_CFS_RFID.md) | CFS codec notes |
| [`LOCAL_BRIDGE.md`](./LOCAL_BRIDGE.md) | Optional compatibility helper (not default UX) |
| [`ROADMAP.md`](./ROADMAP.md) | Delivery status |
