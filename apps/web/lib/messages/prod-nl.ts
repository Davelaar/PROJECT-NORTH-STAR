/** Shared Dutch copy for production-readiness surfaces. Address form: je/jij. */
export const consentNl = {
  bannerAria: "Cookietoestemming",
  bannerText:
    "We gebruiken noodzakelijke opslag om de site te laten werken. Optionele analytics helpen OpenFilament te verbeteren. Je kunt niet-essentiële cookies weigeren zonder zoeken, My Spools, downloads, QR of RFID te verliezen.",
  acceptAll: "Alles accepteren",
  rejectNonEssential: "Niet-essentieel weigeren",
  manage: "Voorkeuren beheren",
  cookiePolicy: "Cookiebeleid",
  privacyPolicy: "Privacybeleid",
  prefsTitle: "Cookievoorkeuren",
  prefsLead:
    "Noodzakelijke opslag blijft aan. Analytics en marketing blijven uit tenzij je ze inschakelt.",
  necessary: "Noodzakelijk",
  necessaryHelp: "Sessie, beveiliging, cookiekeuze, taal, lokale My Spools.",
  preferences: "Voorkeuren",
  preferencesHelp: "Niet-essentiële UI-voorkeuren onthouden.",
  analytics: "Analytics",
  analyticsHelp: "Privacybewuste Google Analytics 4 alleen na toestemming.",
  marketing: "Marketing",
  marketingHelp: "Niet in gebruik. Blijft uitgeschakeld.",
  savePrefs: "Voorkeuren opslaan",
  cancel: "Annuleren",
};

export const footerNl = {
  navAria: "Site en juridisch",
  privacy: "Privacy",
  cookies: "Cookies",
  cookieSettings: "Cookie-instellingen",
  terms: "Voorwaarden",
  security: "Beveiliging",
  trust: "Trust center",
  mySpools: "My Spools",
  tagline: "OpenFilament — filamentinformatie, eerst in de browser.",
  legalPlaceholderWarn:
    "Juridische exploitantgegevens zijn nog placeholders — zie docs/PRODUCTION_LAUNCH_CHECKLIST.md vóór lancering.",
};

export const spoolsNl = {
  heading: "My Spools",
  lead:
    "Houd fysieke spoelen bij op dit apparaat. Cloud-sync is optioneel en start nooit alleen omdat je inlogt.",
  localMode: "Alleen lokaal (deze browser)",
  localWarn:
    "Lokale data kan weg zijn als je sitegegevens wist of van apparaat wisselt. Exporteer regelmatig een back-up.",
  cloudMode: "Cloud-sync (account)",
  create: "Spoel toevoegen",
  export: "Exporteer JSON",
  import: "Importeer JSON",
  clearAll: "Wis alle lokale data",
  clearConfirm:
    "Alle lokale spoelrecords op dit apparaat verwijderen? Dit kan niet ongedaan worden.",
  syncPreview: "Sync bekijken",
  syncConfirm: "Geselecteerde spoelen uploaden",
  syncKeepLocal: "Lokale kopie bewaren na sync",
  syncRemoveLocal: "Lokale kopie verwijderen na sync",
  empty: "Nog geen spoelen. Voeg je eerste rol toe.",
  status: "Status",
  weight: "Huidig gewicht (g)",
  tare: "Tare / lege spoel (g)",
  initial: "Initiële netto (g)",
  remaining: "Resterend %",
  location: "Opslaglocatie",
  notes: "Notities (privé)",
  batch: "Batch / lot",
  purchase: "Aankoopdatum",
  opened: "Openingsdatum",
  archive: "Archiveren",
  restore: "Herstellen",
  delete: "Verwijderen",
  duplicate: "Dupliceren voor nieuwe rol",
  drying: "Drooggebeurtenis toevoegen",
  qr: "QR-identiteit koppelen",
  rfid: "RFID-identiteit koppelen",
  save: "Spoel opslaan",
  syncNeverAuto:
    "Inloggen uploadt lokale spoelen niet. Je moet sync expliciet bevestigen.",
  conflictPolicy:
    "Conflicten gebruiken last-write-wins op sync-versie. Herimport slaat oudere duplicaten over.",
  wizardLead:
    "Kies merk → materiaal → product → kleur uit de catalogus. Zoek eerst; kies “Overig” alleen als het item echt ontbreekt.",
  catalogRequired:
    "Selecteer merk, materiaal, product en kleur uit de catalogus voordat je opslaat.",
  existingRollWarn:
    "Je hebt al {count} rol(len) van deze kleur in My Spools. Sla alleen op als dit een andere fysieke spoel is.",
  editSpool: "Spoel bewerken",
  cancel: "Annuleren",
  showArchived: "Toon gearchiveerd",
  usageLabel: "Verbruikt na print (g)",
  usagePlaceholder: "bijv. 42",
  usageSubmit: "Verbruik aftrekken",
  usageAddSubmit: "Grammen toevoegen",
  usageSaved: "Verbruik gelogd en resterende hoeveelheid bijgewerkt.",
  usageError: "Voer een positief aantal gebruikte grammen in.",
  usageNeedsWeights: "Vul begin- en huidig gewicht in om printverbruik te volgen.",
};

export const accountNl = {
  heading: "Account",
  sessions: "Actieve sessies",
  revokeSession: "Intrekken",
  revokeOthers: "Andere sessies intrekken",
  exportData: "Mijn data exporteren",
  deleteAccount: "Mijn account verwijderen",
  deleteWarn:
    "Dit verwijdert privé-spoelen en sessies permanent. Openbare bijdragen kunnen worden geanonimiseerd in plaats van verwijderd.",
  deleteConfirmLabel: "Typ DELETE om te bevestigen",
  privacyPrefs: "Privacyvoorkeuren",
  register: "Account aanmaken",
  logout: "Uitloggen",
};

export const legalPagesNl = {
  privacyTitle: "Privacybeleid",
  cookiesTitle: "Cookiebeleid",
  termsTitle: "Gebruiksvoorwaarden",
  securityTitle: "Beveiliging",
  trustTitle: "Trust center",
  placeholderNotice:
    "Deze pagina bevat duidelijk gemarkeerde placeholders van de exploitant. Ze blokkeren de release tot ze zijn vervangen.",
  effective: "Ingangsdatum",
  operator: "Operator",
  privacyContact: "Privacycontact",
  hosting: "Hosting",
  contact: "Contact",
  openSourceRepository: "Open-source repository",
  cookieSettingsHint: "Gebruik Cookie-instellingen in de footer",
  sections: {
    privacy: [
      { heading: "Wat we verwerken", items: ["Accountgegevens, authenticatiesessies en beveiligingslogs.", "Cloud My Spools, privénotities en QR/RFID-identiteiten wanneer je expliciet synchroniseert.", "Lokale My Spools blijft in je browser tot je synchroniseert of exporteert.", "Openbare communitybijdragen die je publiceert.", "Toestemmingsvoorkeuren en optionele Google Analytics 4 alleen na toestemming."] },
      { heading: "Grondslagen", items: ["Overeenkomst of gevraagde dienst voor accounts, Cloud, export en downloads.", "Gerechtvaardigd belang voor beveiliging, misbruikpreventie en integriteit.", "Toestemming voor analytics-cookies/opslag, intrekbaar via Cookie-instellingen.", "Wettelijke verplichting waar beveiligings- of boekhoudrecords bewaard moeten worden."] },
      { heading: "My Spools", paragraphs: ["Lokale My Spools blijft op je apparaat. Sitegegevens wissen, apparaatverlies of een andere browser kan dit verwijderen. Inloggen uploadt lokale spoelen nooit vanzelf.", "My Spools Cloud is optionele prepaid hosting voor 12 maanden via eenmalige Stripe Checkout. Er is geen automatische verlenging. Sync vereist een account, actief recht en expliciete bevestiging. Publieke QR-resolutie toont geen privénotities, locaties of account-ID’s."] },
      { heading: "Je rechten en bewaartermijnen", paragraphs: ["Je kunt inzage, correctie, verwijdering, beperking, overdraagbaarheid en bezwaar vragen en toestemming intrekken. Gebruik account-export/verwijderen, Cookie-instellingen of mail het privacycontact. Je kunt klagen bij de ingestelde toezichthouder.", "Bewaren volgt docs/DATA_RETENTION.md. Zacht verwijderde spoelen worden gepland opgeschoond. Back-ups kunnen verwijderde data bewaren tot de back-up verloopt."] },
      { heading: "Internationale doorgifte en wijzigingen", paragraphs: ["Als analytics is ingeschakeld, kan Google data buiten de EER verwerken onder eigen waarborgen. De hostingregio staat hierboven. Materiële beleidswijzigingen verhogen de toestemmingsversie en kunnen opnieuw om toestemming vragen."] },
    ],
    terms: [
      { heading: "Communityplatform", paragraphs: ["OpenFilament biedt een open catalogus, identificatietools en communitykalibraties. Profielen zijn community- of catalogusafgeleid en geen garantie voor printveiligheid. Je blijft zelf verantwoordelijk voor validatie op je printer."] },
      { heading: "Accounts en My Spools", paragraphs: ["Accounts zijn optioneel voor browsen en downloads. My Spools Local is gratis en staat in je browser. My Spools Cloud is optioneel prepaid: €19,99 voor 12 maanden als eenmalige Stripe-betaling, zonder automatische verlenging of toekomstige afschrijving tenzij je zelf een nieuwe Checkout start.", "Na afloop gelden een respijtperiode en read-only exportvenster vóór Cloud-inventaris wordt verwijderd. Restituties en disputes volgen het Cloud-refundbeleid. Stripe verwerkt betaaldata; OpenFilament bewaart geen kaartnummers."] },
      { heading: "Bijdragen", paragraphs: ["Door kalibraties in te dienen accepteer je de bijdragevoorwaarden die bij submit worden getoond en licentieer je de bijdrage voor publieke weergave onder de open voorwaarden van het project. E-mails van bijdragers blijven privé."] },
      { heading: "Beschikbaarheid en aansprakelijkheid", paragraphs: ["De dienst wordt as-is geleverd zonder garantie op ononderbroken beschikbaarheid. Voor zover wettelijk toegestaan is aansprakelijkheid beperkt voor gratis communitytools."] },
    ],
    cookies: [
      { heading: "Browseropslag", paragraphs: ["OpenFilament gebruikt noodzakelijke cookies en browseropslag voor taal, toestemming, sessies, CSRF-bescherming, lokale My Spools en de PWA-shell. Analytics-opslag wordt alleen na toestemming gebruikt."] },
      { heading: "Keuze", paragraphs: ["Analytics weigeren schakelt zoeken, My Spools, accounts, QR, RFID of downloads niet uit. Marketingopslag wordt niet gebruikt."] },
    ],
    security: [
      { heading: "Wat we beschermen", items: ["Accountgegevens met scrypt-wachtwoordhashes.", "Sessietokens gehasht at rest en als httpOnly-cookie naar de browser.", "Privé My Spools met server-side eigendomschecks.", "Publieke QR-projecties zonder notities, locaties en account-ID’s."] },
      { heading: "Responsible disclosure", paragraphs: ["Meld kwetsbaarheden privé aan het ingestelde securitycontact. Publiceer geen secrets, exploits tegen live gebruikers of productiecredentials. Geef redelijke tijd voor herstel vóór publieke discussie."] },
    ],
  },
};
