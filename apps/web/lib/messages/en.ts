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
      "Seed data includes SYNTHETIC fixtures (e.g. Flashforge ASA Burnt Titanium). Treat those values as demos, not measured facts.",
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
      "SYNTHETIC FIXTURE — values are placeholders for development and demos.",
  },
  export: {
    heading: "Export profile",
    body: "Export an OpenFilamentProfile or slicer user preset. Creality CFS RFID fields remain UNKNOWN.",
    profileUuid: "Profile UUID",
    format: "Format",
    submit: "Export",
    formats: {
      openfilamentprofile: "OpenFilamentProfile JSON",
      creality: "Creality Print user preset",
      orca: "OrcaSlicer filament preset",
    },
  },
  rfid: {
    heading: "RFID encode (research stub)",
    warning:
      "Creality CFS protocol is not verified. This UI encodes the Open Filament research stub format only. Do not write stub payloads to hardware expecting printer recognition. Real CFS requires Phase 10 research.",
    materialCode: "Material code (ASCII, max 8)",
    colorToken: "Color token (ASCII, max 7)",
    submit: "Encode stub",
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
