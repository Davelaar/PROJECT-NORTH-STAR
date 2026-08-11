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
  support: "Hilfe",
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
    "Wähle Marke und Material aus dem Katalog, danach Produkt und Farbe. Zuerst suchen; „Sonstiges“ nur wenn der Eintrag wirklich fehlt.",
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
  privacyMetaDescription: "Wie OpenFilament Konto-E-Mail, Stripe-Zahlungen, My Spools und Cookies verarbeitet.",
  cookiesTitle: "Cookie-Richtlinie",
  termsTitle: "Nutzungsbedingungen",
  termsMetaDescription:
    "OpenFilament-Bedingungen: Dienst wie besehen, keine Rückerstattung für Cloud, keine automatische Verlängerung, 30-Tage-Cloud-Exportfenster nach Ablauf.",
  securityTitle: "Sicherheit",
  trustTitle: "Trust center",
  placeholderNotice: "Diese Seite enthält klar markierte Platzhalter des Betreibers. Sie blockieren den Release, bis sie ersetzt sind.",
  effective: "Gültig ab",
  operator: "Betreiber",
  privacyContact: "Datenschutzkontakt",
  hosting: "Hosting",
  contact: "Kontakt",
  openSourceRepository: "Open-Source-Repository",
  cookieSettingsHint: "Du kannst Analyse- und Präferenz-Cookies jederzeit über Cookie-Einstellungen ändern. Einwilligungsversion:",
  sections: {
    privacy: [
      {
        heading: "Konten — was wir speichern",
        paragraphs: [
          "Für ein Konto genügen E-Mail-Adresse und Passwort. Wir speichern diese E-Mail, damit du dich anmelden, Zahlungsbelege erhalten und dein Passwort zurücksetzen kannst. Wir fragen nicht nach deinem Klarnamen; ein interner Benutzername wird automatisch erzeugt. Passwörter werden als scrypt-Hashes gespeichert — nie im Klartext.",
          "Wir nutzen deine E-Mail nicht für Marketing. Kontowiederherstellung und wesentliche Service-Nachrichten (z. B. zu Zahlung oder Sicherheit) sind die vorgesehenen Zwecke.",
        ],
      },
      {
        heading: "Zahlungen (Stripe)",
        paragraphs: [
          "Optionale Käufe von My Spools Cloud laufen über Stripe Checkout. Kartendaten oder Wallet-Angaben gibst du auf den gehosteten Zahlungsseiten von Stripe ein. Stripe ist der Zahlungsdienstleister: OpenFilament erhält oder speichert nie deine vollständige Kartennummer, CVC oder vergleichbare Wallet-Geheimnisse.",
          "Bei uns behalten wir nur, was für Cloud-Zugang und Buchhaltung nötig ist: Betrag, Währung, Zahlungsstatus, Stripe-Sitzungs-/Zahlungs-IDs, Zeitstempel und deinen Cloud-Berechtigungszeitraum. Stripe verarbeitet Zahlungsdaten unter den eigenen Bedingungen und der Datenschutzrichtlinie von Stripe.",
          "Cloud-Zugang ist eine einmalige vorausbezahlte Periode (derzeit 12 Monate). Es gibt keine automatische Verlängerung und keine Off-Session-Belastung, es sei denn, du startest selbst einen neuen Checkout.",
        ],
      },
      {
        heading: "Was wir sonst verarbeiten",
        items: [
          "Authentifizierungssitzungen (httpOnly-Cookies) und Sicherheitsprotokolle.",
          "My Spools Cloud-Inventar, private Notizen und QR/RFID-Identitäten nur, wenn du ausdrücklich in die Cloud synchronisierst.",
          "Lokale My Spools bleiben im Browser, bis du synchronisierst oder exportierst — die Anmeldung lädt lokale Spulen nicht von allein hoch.",
          "Öffentliche Community-Beiträge, die du veröffentlichst (Kalibrierungen, Katalogtipps).",
          "Einwilligungspräferenzen und optionales Google Analytics 4 nur nach Opt-in.",
        ],
      },
      {
        heading: "Rechtsgrundlagen",
        items: [
          "Vertrag / angeforderte Leistung für Konten, Cloud, Exporte und Downloads.",
          "Berechtigtes Interesse für Sicherheit, Missbrauchsprävention und Dienstintegrität.",
          "Einwilligung für Analyse-Cookies/Speicher — widerrufbar über Cookie-Einstellungen auf dieser Site.",
          "Rechtliche Verpflichtung, wo Sicherheits- oder Buchhaltungsunterlagen aufbewahrt werden müssen.",
        ],
      },
      {
        heading: "My Spools",
        paragraphs: [
          "Lokale My Spools sind kostenlos und bleiben auf deinem Gerät. Website-Daten löschen, Geräteverlust oder Browserwechsel können sie entfernen.",
          "My Spools Cloud ist optionales kostenpflichtiges Hosting für Inventar-Sync und Backup. Öffentliche QR-Auflösung zeigt keine privaten Notizen, Orte oder Konto-IDs.",
        ],
      },
      {
        heading: "Deine Rechte und Aufbewahrung",
        paragraphs: [
          "Du kannst Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit und Widerspruch verlangen sowie die Einwilligung widerrufen. Nutze Konto-Export/Löschung, Cookie-Einstellungen oder schreibe dem Datenschutzkontakt. Du kannst dich bei der für diese Site genannten Aufsichtsbehörde beschweren.",
          "Weich gelöschte Cloud-Spulen werden planmäßig bereinigt. Zahlungs- und Sicherheitsunterlagen können länger aufbewahrt werden, wenn Buchhaltung oder Betrugsprävention es erfordern. Backups können gelöschte Daten bis zum Backup-Ablauf behalten.",
        ],
      },
      {
        heading: "Internationale Übermittlungen und Änderungen",
        paragraphs: [
          "Hosting von Anwendung und Datenbank liegt auf unserem EU-VPS wie oben angegeben. Wenn du Analytics aktivierst, kann Google Analysedaten außerhalb des EWR unter seinen Schutzmaßnahmen verarbeiten. Stripe kann Zahlungsdaten in Regionen verarbeiten, in denen Stripe tätig ist. Wesentliche Richtlinienänderungen aktualisieren die Einwilligungsversion und können erneut um Einwilligung bitten.",
        ],
      },
    ],
    terms: [
      {
        heading: "Community-Dienst wie besehen",
        paragraphs: [
          "OpenFilament wird wie besehen und wie verfügbar bereitgestellt. Katalogdaten, Starterprofile und Community-Kalibrierungen sind keine Drucksicherheitsgarantie. Du bleibst verantwortlich, Einstellungen an deinem Drucker zu validieren und für Druckergebnisse.",
          "Wir gewährleisten keine ununterbrochene Verfügbarkeit, fehlerfreien Betrieb oder Eignung für einen bestimmten Zweck, soweit gesetzlich zulässig. My Spools Cloud wird in der Beta angeboten.",
        ],
      },
      {
        heading: "Konten und kostenlose Nutzung",
        paragraphs: [
          "Browsen, Suche, Profil-Downloads und My Spools Local sind kostenlos. Ein Konto (E-Mail und Passwort) ist für die kostenlose Nutzung optional und nur erforderlich, wenn du My Spools Cloud kaufst, damit wir Inventar zuordnen und Zugang wiederherstellen können.",
        ],
      },
      {
        heading: "My Spools Cloud — Zahlung, keine Verlängerung, keine Rückerstattung",
        paragraphs: [
          "Cloud ist ein optionaler vorausbezahlter digitaler Dienst: derzeit 19,99 € für 12 Monate, einmalig über Stripe Checkout. Es gibt keine automatische Verlängerung und keine Off-Session-Belastung. Der Zugang endet mit Ablauf der bezahlten Periode, es sei denn, du startest selbst einen neuen Checkout.",
          "Alle Cloud-Käufe sind endgültig: keine Rückerstattungen, keine Chargebacks aus Käuferreue und keine Teilrückerstattungen für ungenutzte Monate. Stripe verarbeitet die Zahlung; OpenFilament speichert keine Kartennummern.",
          "Cloud fügt nur die Synchronisation von Spulen über Geräte hinweg und serverseitiges Bestands-/Backup hinzu. Es schaltet keine zusätzlichen Katalog-, Profil- oder RFID/QR-Funktionen über Local hinaus frei.",
        ],
      },
      {
        heading: "Nach Ablauf von Cloud — 30 Tage zum Export",
        paragraphs: [
          "Wenn deine Cloud-Periode endet, behalten wir dein Cloud-Inventar weitere 30 Tage. In diesen 30 Tagen kannst du deine Cloud-Daten weiterhin exportieren (JSON). Sync und Schreibzugriff nach Ablauf folgen den Produktregeln (Nur-Lesen / Exportfenster).",
          "Nach diesen 30 Tagen kann Cloud-Inventar dauerhaft von unseren Servern gelöscht werden. Lokale My Spools in deinem Browser bleiben unberührt und kostenlos nutzbar. Zahlungs- und Sicherheitsunterlagen können länger aufbewahrt werden, wenn Buchhaltung oder Betrugsprävention es erfordern.",
        ],
      },
      {
        heading: "Beiträge",
        paragraphs: [
          "Mit dem Einreichen von Kalibrierungen akzeptierst du die zum Submit angezeigten Beitragsbedingungen und lizenzierst den Beitrag zur öffentlichen Anzeige unter den offenen Projektbedingungen. Contributor-E-Mails bleiben privat.",
        ],
      },
      {
        heading: "Haftung",
        paragraphs: [
          "Soweit anwendbares Recht es zulässt, haften OpenFilament und der Betreiber nicht für indirekte, zufällige oder Folgeschäden aus der Nutzung der kostenlosen Tools oder des Beta-Cloud-Dienstes. Zwingende Verbraucherrechte, die nach niederländischem oder EU-Recht nicht abbedungen werden können, bleiben unberührt.",
        ],
      },
    ],
    cookies: [
      {
        heading: "Notwendiger Speicher",
        paragraphs: [
          "Erforderlich für den Betrieb der Site: Sprache (of_locale), Einwilligungswahl (of_consent), angemeldete Sitzung (of_session, httpOnly), CSRF-Schutz (of_csrf) und lokale My Spools-Daten in IndexedDB. Ein Service Worker / Cache Storage kann die PWA-Shell offlinefähig halten. Das dient nicht der Werbung.",
        ],
      },
      {
        heading: "Optionale Analytics",
        paragraphs: [
          "Nur wenn du Analytics akzeptierst, laden wir datenschutzbewusstes Google Analytics 4, das First-Party-Cookies wie _ga setzen kann. Ablehnen von Analytics lässt Suche, My Spools, Konten, QR, RFID und Downloads vollständig nutzbar. Marketing-Cookies werden nicht verwendet.",
        ],
      },
      {
        heading: "Auswahl ändern",
        paragraphs: [
          "Öffne Cookie-Einstellungen jederzeit über den Footer oder die Datenschutzseite. Eine geänderte Wahl aktualisiert den Speicher sofort und schaltet Analytics aus, wenn du die Einwilligung widerrufst.",
        ],
      },
    ],
    security: [
      {
        heading: "Was wir schützen",
        items: [
          "Kontodaten mit scrypt-Passworthashes.",
          "Sitzungstokens gehasht at rest und als httpOnly-Cookies an den Browser.",
          "Private My Spools mit serverseitigen Ownership-Checks.",
          "Öffentliche QR-Projektionen ohne Notizen, Orte und Konto-IDs.",
          "Zahlungskartendaten über Stripe — nicht auf OpenFilament-Servern gespeichert.",
        ],
      },
      {
        heading: "Responsible Disclosure",
        paragraphs: [
          "Melde Schwachstellen vertraulich an den konfigurierten Sicherheitskontakt. Veröffentliche keine Secrets, Exploits gegen Live-Nutzer oder Produktionszugänge. Gib angemessene Zeit zur Behebung vor öffentlicher Diskussion.",
        ],
      },
    ],
  },
};

export const supportDe = {
  title: "Hilfe",
  metaDescription: "Was OpenFilament ist, was du tun kannst, und wie kostenloses My Spools sich von bezahltem Cloud-Sync (Beta) unterscheidet.",
  lead: "Kurze Hilfe vom Betreiber an dich: wofür diese Site da ist und wie My Spools Local vs Cloud funktioniert — inklusive, dass bezahltes Cloud noch Beta ist.",
  productHeading: "Was OpenFilament ist",
  productBody: "OpenFilament ist ein browser-first Filamentkatalog und Kalibrierungs-Hub. Finde Filamentdaten, lade Starter- oder gemessene Profile für deinen Slicer herunter, identifiziere Spulen mit QR oder RFID und führe optional Inventar mit My Spools — ohne Desktop-App für das Kernprodukt.",
  productItems: [
    "Suche Marken, Materialien und Farben; nutze Herstellerbereiche als starke erste Einstellung.",
    "Lade Slicer-Presets herunter (gemessene Community-Profile wenn verfügbar, sonst herstellerbasierte Starter).",
    "Drucke QR-Etiketten und nutze RFID-Abläufe, wenn du kompatible Hardware hast.",
    "Trage Kalibrierungen bei, damit andere besser drucken.",
    "Optionales Konto für Cloud-Inventar-Sync — Surfen und Local My Spools funktionieren ohne Bezahlung.",
  ],
  mySpoolsHeading: "My Spools — kostenlos vs bezahlt",
  mySpoolsLocalTitle: "My Spools Local (kostenlos)",
  mySpoolsLocalBody: "Vollständiges Inventar auf diesem Gerät: Notizen, Trocknung, QR/RFID-Verknüpfungen, Import/Export. Kein Konto nötig. Daten bleiben im Browser — exportiere Backups, wenn du Website-Daten löschst oder das Gerät wechselst.",
  mySpoolsCloudTitle: "My Spools Cloud (bezahlt, Beta)",
  mySpoolsCloudBody: "Optionales Prepaid-Hosting (19,99 € für 12 Monate, einmalig über Stripe, keine Auto-Verlängerung). Ein Konto (E-Mail + Passwort) ist nötig, damit wir Cloud-Inventar zuordnen und Zugang wiederherstellen können.",
  mySpoolsDiffItems: [
    "Kostenloses Local: vollständige Inventarwerkzeuge auf einem Browser/Gerät.",
    "Bezahltes Cloud: die einzigen Extras sind Spulen-Sync über Geräte und serverseitiger Bestand/Backup auf unserem VPS.",
    "Cloud schaltet keine besseren Profile, Katalogprivilegien, RFID/QR-Funktionen oder andere Inventarwerkzeuge frei, die Local bereits hat.",
    "Nach Ende der bezahlten Periode behalten wir Cloud-Daten 30 Tage, damit du sie noch exportieren kannst; danach können sie gelöscht werden. Local My Spools bleibt ohne Cloud voll nutzbar.",
  ],
  betaNote:
    "My Spools Cloud ist in der Beta. Erwarte Kanten, während wir Sync und Billing härten. Der Zweck des bezahlten Produkts bleibt schmal: Spulen-Sync und Bestands-Backup — nichts weiter. Käufe sind endgültig (keine Rückerstattung) und verlängern sich nicht automatisch.",
  contactHeading: "Kontakt",
  contactBody: "Fragen zu Datenschutz, Abrechnung oder Cloud-Beta: schreib uns. Für Cookie-Auswahl nutze Cookie-Einstellungen auf der Datenschutzseite.",
};
