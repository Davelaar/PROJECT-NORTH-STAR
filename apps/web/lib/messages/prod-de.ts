/** Shared German copy. Address: du. */
export const consentDe = {
  bannerAria: "Cookie-Einwilligung",
  bannerText:
    "Wir nutzen notwendige Speicherung, damit die Seite funktioniert. Optionale Analytics helfen, OpenFilament zu verbessern. Du kannst nicht essenzielle Cookies ablehnen und behältst Suche, My Spools, Downloads, QR und RFID.",
  acceptAll: "Alles akzeptieren",
  rejectNonEssential: "Nicht essenziell ablehnen",
  manage: "Einstellungen verwalten",
  cookiePolicy: "Cookie-Richtlinie",
  privacyPolicy: "Datenschutz",
  prefsTitle: "Cookie-Einstellungen",
  prefsLead:
    "Notwendige Speicherung bleibt an. Analytics und Marketing bleiben aus, bis du sie aktivierst.",
  necessary: "Notwendig",
  necessaryHelp: "Sitzung, Sicherheit, Cookie-Wahl, Sprache, lokales My Spools.",
  preferences: "Einstellungen",
  preferencesHelp: "Nicht essenzielle UI-Einstellungen merken.",
  analytics: "Analytics",
  analyticsHelp: "Datenschutzbewusste Google Analytics 4 nur nach Einwilligung.",
  marketing: "Marketing",
  marketingHelp: "Nicht verwendet. Bleibt deaktiviert.",
  savePrefs: "Einstellungen speichern",
  cancel: "Abbrechen",
};

export const footerDe = {
  navAria: "Site und Rechtliches",
  privacy: "Datenschutz",
  cookies: "Cookies",
  cookieSettings: "Cookie-Einstellungen",
  terms: "Nutzungsbedingungen",
  security: "Sicherheit",
  trust: "Trust center",
  mySpools: "My Spools",
  tagline: "OpenFilament — Filamentwissen, zuerst im Browser.",
  legalPlaceholderWarn:
    "Rechtliche Betreiberangaben sind noch Platzhalter — siehe docs/PRODUCTION_LAUNCH_CHECKLIST.md vor dem Launch.",
};

export const spoolsDe = {
  heading: "My Spools",
  lead:
    "Verwalte physische Spulen auf diesem Gerät. Cloud-Sync ist optional und startet nie nur weil du dich anmeldest.",
  localMode: "Nur lokal (dieser Browser)",
  localWarn:
    "Lokale Daten können verloren gehen, wenn du Website-Daten löschst oder das Gerät wechselst. Exportiere regelmäßig ein Backup.",
  cloudMode: "Cloud-Sync (Konto)",
  create: "Spule hinzufügen",
  export: "JSON exportieren",
  import: "JSON importieren",
  clearAll: "Alle lokalen Daten löschen",
  clearConfirm:
    "Alle lokalen Spulen auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.",
  syncPreview: "Sync Vorschau",
  syncConfirm: "Ausgewählte Spulen hochladen",
  syncKeepLocal: "Lokale Kopie nach Sync behalten",
  syncRemoveLocal: "Lokale Kopie nach Sync entfernen",
  empty: "Noch keine Spulen. Füge deine erste Rolle hinzu.",
  status: "Status",
  weight: "Aktuelles Gewicht (g)",
  tare: "Tara / leere Spule (g)",
  initial: "Anfangsnetto (g)",
  remaining: "Verbleibend %",
  location: "Lagerort",
  notes: "Notizen (privat)",
  batch: "Charge / Lot",
  purchase: "Kaufdatum",
  opened: "Geöffnet am",
  archive: "Archivieren",
  restore: "Wiederherstellen",
  delete: "Löschen",
  duplicate: "Für neue Rolle duplizieren",
  drying: "Trocknungsereignis hinzufügen",
  qr: "QR-Identität verknüpfen",
  rfid: "RFID-Identität verknüpfen",
  save: "Spule speichern",
  syncNeverAuto:
    "Anmeldung lädt lokale Spulen nicht hoch. Du musst Sync ausdrücklich bestätigen.",
  conflictPolicy:
    "Konflikte nutzen last-write-wins nach Sync-Version. Re-Import überspringt ältere Duplikate.",
  wizardLead:
    "Wähle Marke → Material → Produkt → Farbe aus dem Katalog. Zuerst suchen; „Sonstiges“ nur wenn der Eintrag wirklich fehlt.",
  catalogRequired:
    "Wähle Marke, Material, Produkt und Farbe aus dem Katalog, bevor du speicherst.",
  existingRollWarn:
    "Du hast bereits {count} Rolle(n) dieser Farbe in My Spools. Speichere nur, wenn dies eine weitere physische Spule ist.",
  editSpool: "Spule bearbeiten",
  cancel: "Abbrechen",
  showArchived: "Archivierte anzeigen",
  usageLabel: "Nach Druck verbraucht (g)",
  usagePlaceholder: "z. B. 42",
  usageSubmit: "Verbrauch abziehen",
  usageAddSubmit: "Gramm hinzufügen",
  usageSaved: "Verbrauch erfasst und Restmenge aktualisiert.",
  usageError: "Gib eine positive Menge verbrauchter Gramm ein.",
  usageNeedsWeights: "Trage Anfangs- und aktuelles Gewicht ein, um Druckverbrauch zu verfolgen.",
};

export const accountDe = {
  heading: "Konto",
  sessions: "Aktive Sitzungen",
  revokeSession: "Widerrufen",
  revokeOthers: "Andere Sitzungen widerrufen",
  exportData: "Meine Daten exportieren",
  deleteAccount: "Mein Konto löschen",
  deleteWarn:
    "Das löscht private Spulen und Sitzungen dauerhaft. Öffentliche Beiträge können anonymisiert statt entfernt werden.",
  deleteConfirmLabel: "Tippe DELETE zur Bestätigung",
  privacyPrefs: "Datenschutz-Einstellungen",
  register: "Konto erstellen",
  logout: "Abmelden",
};

export const legalPagesDe = {
  privacyTitle: "Datenschutzrichtlinie",
  cookiesTitle: "Cookie-Richtlinie",
  termsTitle: "Nutzungsbedingungen",
  securityTitle: "Sicherheit",
  trustTitle: "Trust center",
  placeholderNotice:
    "Diese Seite enthält klar markierte Platzhalter des Betreibers. Sie blockieren den Release, bis sie ersetzt sind.",
  effective: "Gültig ab",
  operator: "Betreiber",
  privacyContact: "Datenschutzkontakt",
  hosting: "Hosting",
  contact: "Kontakt",
  openSourceRepository: "Open-Source-Repository",
  cookieSettingsHint: "Cookie-Einstellungen im Footer verwenden",
  sections: {
    privacy: [
      { heading: "Verarbeitete Daten", items: ["Konto-, Sitzungs- und Sicherheitsdaten.", "Cloud My Spools mit privaten Notizen und QR/RFID-Identitäten nur nach ausdrücklicher Synchronisierung.", "Lokale My Spools bleiben im Browser.", "Öffentliche Community-Beiträge und Einwilligungspräferenzen.", "Google Analytics 4 nur nach Zustimmung."] },
      { heading: "Rechtsgrundlagen und Rechte", paragraphs: ["Verarbeitung erfolgt für Vertrag/angefragte Dienste, berechtigte Sicherheitsinteressen, Einwilligung für Analytics und gesetzliche Pflichten. Du kannst Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit, Widerspruch und Widerruf verlangen."] },
      { heading: "My Spools, Aufbewahrung und Übermittlungen", paragraphs: ["Local bleibt auf deinem Gerät und wird durch Anmeldung nicht hochgeladen. Cloud ist optionales Prepaid-Hosting für 12 Monate ohne automatische Verlängerung. Öffentliche QR-Auflösung zeigt keine privaten Notizen, Orte oder Konto-IDs.", "Aufbewahrung folgt docs/DATA_RETENTION.md. Bei Analytics kann Google Daten außerhalb des EWR verarbeiten. Wesentliche Änderungen können eine neue Einwilligung auslösen."] },
    ],
    terms: [
      { heading: "Community-Plattform", paragraphs: ["OpenFilament bietet Katalog, Identifikation und Community-Kalibrierungen ohne Drucksicherheitsgarantie; du validierst Einstellungen selbst."] },
      { heading: "Konten, Cloud und Beiträge", paragraphs: ["Konten sind optional. My Spools Local ist kostenlos. Cloud kostet 19,99 € für 12 Monate per einmaliger Stripe-Zahlung ohne automatische Verlängerung. Stripe verarbeitet Zahlungsdaten; OpenFilament speichert keine Kartennummern.", "Mit Kalibrierungsbeiträgen akzeptierst du die angezeigten Bedingungen; E-Mails bleiben privat."] },
      { heading: "Verfügbarkeit und Haftung", paragraphs: ["Der Dienst wird ohne Garantie unterbrechungsfreier Verfügbarkeit bereitgestellt; Haftung für kostenlose Community-Werkzeuge ist soweit zulässig begrenzt."] },
    ],
    cookies: [
      { heading: "Browser-Speicher", paragraphs: ["Notwendige Cookies/Speicher dienen Sprache, Einwilligung, Sitzungen, CSRF, lokalen My Spools und PWA-Shell. Analytics nur nach Zustimmung."] },
      { heading: "Wahl", paragraphs: ["Ablehnung von Analytics deaktiviert Suche, My Spools, Konten, QR, RFID oder Downloads nicht. Marketing-Speicher wird nicht genutzt."] },
    ],
    security: [
      { heading: "Schutz", items: ["scrypt-Passworthashes.", "Sitzungstokens gehasht und als httpOnly-Cookies.", "Private My Spools mit Ownership-Checks.", "Öffentliche QR-Projektionen ohne private Felder."] },
      { heading: "Responsible Disclosure", paragraphs: ["Melde Schwachstellen vertraulich an den Sicherheitskontakt und veröffentliche keine Secrets, Live-Exploits oder Produktionszugänge vor angemessener Behebungszeit."] },
    ],
  },
};
