export const messages = {
  brand: "Open Filament",
  tagline: "Community filament intelligence — calibration first, adapters second.",
  nav: {
    home: "Home",
    search: "Search",
    export: "Export",
    rfid: "RFID",
    docsApi: "API docs",
    login: "Log in",
  },
  home: {
    heading: "Canonical filament data for the community",
    body: "Browse manufacturers, variants, and calibration profiles. Manufacturer claims and community recommendations stay clearly separated.",
    searchPlaceholder: "Search filaments, manufacturers, printers…",
    searchButton: "Search",
    fixtureNote:
      "Catalog may include seed catalog data (e.g. Flashforge ASA Burnt Titanium) for development — treat those rows as examples until community measurements replace them.",
  },
  search: {
    heading: "Search",
    empty: "Enter a query to search the catalog.",
    noResults: "No results.",
  },
  variant: {
    manufacturerSpecs: "Manufacturer / catalog specs",
    communityRecommendation: "Community recommendation",
    profiles: "Calibration profiles",
    syntheticBanner:
      "Seed catalog data — placeholder values for development until measured profiles land.",
  },
  export: {
    heading: "Export profile",
    body: "Export an OpenFilamentProfile or installable slicer user preset. Creality Print / Orca exports include a local bridge install payload.",
    profileUuid: "Profile UUID",
    format: "Format",
    submit: "Export",
    installBridge: "Install via local bridge",
    installOk: "Installed via bridge",
    installFail: "Bridge install failed — is open-filament-bridge running on :8788?",
    formats: {
      openfilamentprofile: "OpenFilamentProfile JSON",
      creality: "Creality Print user preset",
      orca: "OrcaSlicer filament preset",
    },
  },
  rfid: {
    heading: "CFS RFID encode",
    warning:
      "Encodes Creality CFS-compatible payloads (community reverse engineering). Simulate write verifies encrypt→decrypt in memory. Real NFC/PC/SC hardware write is a separate next step.",
    materialCode: "Material (e.g. ASA, PLA, PETG)",
    colorToken: "Color (#RRGGBB)",
    weight: "Weight / length code",
    serial: "Serial (6 chars)",
    uid: "Tag UID (hex, optional)",
    submit: "Encode CFS payload",
    simulate: "Simulate write+verify",
  },
  login: {
    heading: "Log in",
    username: "Username",
    password: "Password",
    submit: "Log in",
  },
  docsApi: {
    heading: "API documentation",
    body: "OpenAPI document is served by the API at /openapi.json.",
    openLink: "Open OpenAPI JSON",
  },
  compare: {
    heading: "Compare profiles",
    needIds: "Provide two profile UUIDs via ?ids=uuid,uuid",
  },
  common: {
    loading: "Loading…",
    error: "Something went wrong.",
    backHome: "Back home",
  },
} as const;

export type Messages = typeof messages;
