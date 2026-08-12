export function buildOpenApiDocument(baseUrl: string) {
  const bearer = { bearerAuth: [] as [] };
  const ok = { "200": { description: "OK" } };
  const created = { "201": { description: "Created" } };
  return {
    openapi: "3.0.3",
    info: {
      title: "Open Filament API",
      version: "0.1.0",
      description:
        "Community filament intelligence API. Calibration DB is source of truth; slicer/RFID are adapters.",
    },
    servers: [{ url: baseUrl }],
    paths: {
      "/api/v1/health": { get: { summary: "Health check", responses: ok } },
      "/api/v1/features": { get: { summary: "Feature flags", responses: ok } },
      "/api/v1/manufacturers": { get: { summary: "List manufacturers", responses: ok } },
      "/api/v1/manufacturers/{uuid}": { get: { summary: "Get manufacturer", responses: ok } },
      "/api/v1/materials": { get: { summary: "List material families", responses: ok } },
      "/api/v1/materials/{uuid}": { get: { summary: "Get material", responses: ok } },
      "/api/v1/filaments": { get: { summary: "List filament products", responses: ok } },
      "/api/v1/filaments/{uuid}": { get: { summary: "Get filament product", responses: ok } },
      "/api/v1/filaments/{uuid}/variants": {
        get: { summary: "List variants for product", responses: ok },
      },
      "/api/v1/variants": {
        get: { summary: "List variant UUIDs (sitemap)", responses: ok },
      },
      "/api/v1/variants/{uuid}": { get: { summary: "Get variant", responses: ok } },
      "/api/v1/variants/{uuid}/profiles": {
        get: { summary: "Profiles for variant", responses: ok },
      },
      "/api/v1/variants/{uuid}/recommendation": {
        get: { summary: "Community recommendation aggregation", responses: ok },
      },
      "/api/v1/variants/{uuid}/qr": {
        get: {
          summary:
            "Label metadata + path/identityUri for client-side QR (no fixed domain)",
          responses: ok,
        },
      },
      "/api/v1/profiles/{uuid}": { get: { summary: "Get calibration profile", responses: ok } },
      "/api/v1/profiles/{uuid}/revisions": { get: { summary: "List revisions", responses: ok } },
      "/api/v1/profiles": {
        post: {
          summary: "Create draft profile revision (auth)",
          security: [bearer],
          responses: created,
        },
      },
      "/api/v1/profiles/{uuid}/publish": {
        post: { summary: "Publish draft revision", security: [bearer], responses: ok },
      },
      "/api/v1/profiles/{uuid}/revise": {
        post: { summary: "Create new draft from current", security: [bearer], responses: created },
      },
      "/api/v1/profiles/{uuid}/fork": {
        post: { summary: "Fork profile", security: [bearer], responses: created },
      },
      "/api/v1/profiles/{uuid}/confirm": {
        post: {
          summary: "Confirm published revision (auth)",
          security: [bearer],
          responses: created,
        },
      },
      "/api/v1/profiles/{uuid}/failure": {
        post: { summary: "Report failure (auth)", security: [bearer], responses: created },
      },
      "/api/v1/revisions/{uuid}/observations": {
        get: { summary: "List observations", responses: ok },
        post: { summary: "Add observation", security: [bearer], responses: created },
      },
      "/api/v1/revisions/{uuid}/evidence": {
        post: {
          summary: "Upload evidence image (base64; re-encoded JPEG, EXIF stripped)",
          security: [bearer],
          responses: created,
        },
      },
      "/api/v1/printers": { get: { summary: "List printers", responses: ok } },
      "/api/v1/printer-brands": {
        get: { summary: "List printer brands and models", responses: ok },
      },
      "/api/v1/printers/resolve": {
        post: {
          summary: "Resolve or create printer + toolhead (auth)",
          responses: ok,
        },
      },
      "/api/v1/printers/{uuid}": { get: { summary: "Get printer", responses: ok } },
      "/api/v1/toolheads": { get: { summary: "List toolheads", responses: ok } },
      "/api/v1/build-plates": { get: { summary: "List build plates", responses: ok } },
      "/api/v1/search": { get: { summary: "Search catalog", responses: ok } },
      "/api/v1/rfid/schemes": { get: { summary: "List RFID schemes", responses: ok } },
      "/api/v1/rfid/encode": {
        post: {
          summary: "Encode Creality CFS-compatible RFID payload",
          responses: ok,
        },
      },
      "/api/v1/rfid/verify": {
        post: { summary: "Decrypt and verify CFS ciphertext", responses: ok },
      },
      "/api/v1/rfid/resolve": {
        get: {
          summary: "Map CFS material/color identifiers to filament + profiles",
          responses: ok,
        },
      },
      "/api/v1/rfid/resolve-and-export": {
        post: {
          summary: "Resolve RFID identity and export Creality install payload",
          responses: ok,
        },
      },
      "/api/v1/variants/{uuid}/openprinttag": {
        get: {
          summary:
            "Map variant catalog fields to OpenPrintTag main payload",
          responses: ok,
        },
      },
      "/api/v1/variants/{uuid}/openprinttag/encode": {
        post: {
          summary:
            "Encode OpenPrintTag NDEF/CBOR payload for a variant",
          responses: ok,
        },
      },
      "/api/v1/variants/{uuid}/swatch.svg": {
        get: {
          summary: "SVG color swatch preview for a filament variant",
          responses: ok,
        },
      },
      "/api/v1/exports/creality": {
        post: {
          summary: "Export Creality Print user preset + bridge install payload",
          responses: ok,
        },
      },
      "/api/v1/exports/orca": {
        post: {
          summary: "Export OrcaSlicer filament preset + bridge install payload",
          responses: ok,
        },
      },
      "/api/v1/exports/prusaslicer": {
        post: {
          summary: "Export PrusaSlicer filament INI / config bundle",
          responses: ok,
        },
      },
      "/api/v1/exports/bambu": {
        post: {
          summary: "Export Bambu Studio filament preset + bridge install payload",
          responses: ok,
        },
      },
      "/api/v1/exports/openfilamentprofile": {
        post: { summary: "Export OpenFilamentProfile", responses: ok },
      },
      "/api/v1/imports/creality": {
        post: {
          summary: "Import Creality user preset → draft profile",
          security: [bearer],
          responses: created,
        },
      },
      "/api/v1/imports/openfilamentprofile": {
        post: {
          summary: "Import OpenFilamentProfile JSON → draft",
          security: [bearer],
          responses: created,
        },
      },
      "/api/v1/auth/login": { post: { summary: "Login", responses: ok } },
      "/api/v1/auth/register": { post: { summary: "Register", responses: created } },
      "/api/v1/me/contributions": {
        get: { summary: "Current user contributions", security: [bearer], responses: ok },
      },
      "/api/v1/admin/summary": {
        get: { summary: "Admin summary", security: [bearer], responses: ok },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "of_session",
          description:
            "Browser session cookie set by login/register. Mutating browser requests also send X-CSRF-Token matching the of_csrf cookie.",
        },
      },
    },
  };
}
