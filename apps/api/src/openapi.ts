export function buildOpenApiDocument(baseUrl: string) {
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
      "/api/v1/health": {
        get: {
          summary: "Health check",
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/manufacturers": {
        get: { summary: "List manufacturers", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/manufacturers/{uuid}": {
        get: { summary: "Get manufacturer", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/materials": {
        get: { summary: "List material families", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/filaments": {
        get: { summary: "List filament products", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/filaments/{uuid}": {
        get: { summary: "Get filament product", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/filaments/{uuid}/variants": {
        get: { summary: "List variants for product", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/variants/{uuid}": {
        get: { summary: "Get variant", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/variants/{uuid}/profiles": {
        get: { summary: "Profiles for variant", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/variants/{uuid}/recommendation": {
        get: {
          summary: "Community recommendation aggregation",
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/v1/profiles/{uuid}": {
        get: { summary: "Get calibration profile", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/profiles/{uuid}/revisions": {
        get: { summary: "List revisions", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/profiles": {
        post: {
          summary: "Create draft profile revision (auth)",
          security: [{ bearerAuth: [] }],
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/profiles/{uuid}/confirm": {
        post: {
          summary: "Confirm a profile revision (auth)",
          security: [{ bearerAuth: [] }],
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/profiles/{uuid}/failure": {
        post: {
          summary: "Report failure (auth)",
          security: [{ bearerAuth: [] }],
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/v1/printers": {
        get: { summary: "List printers", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/printers/{uuid}": {
        get: { summary: "Get printer", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/search": {
        get: { summary: "Search catalog", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/rfid/schemes": {
        get: { summary: "List RFID schemes", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/rfid/encode": {
        post: {
          summary: "Encode research stub RFID payload",
          responses: { "200": { description: "Stub payload + warnings" } },
        },
      },
      "/api/v1/exports/creality": {
        post: { summary: "Export Creality user preset", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/exports/orca": {
        post: { summary: "Export Orca filament preset", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/exports/openfilamentprofile": {
        post: { summary: "Export OpenFilamentProfile", responses: { "200": { description: "OK" } } },
      },
      "/api/v1/auth/login": {
        post: { summary: "Login", responses: { "200": { description: "Token" } } },
      },
      "/api/v1/auth/register": {
        post: { summary: "Register", responses: { "201": { description: "Created" } } },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
      },
    },
  };
}
