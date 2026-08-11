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
  support: "Ondersteuning",
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
    "Kies merk en materiaal uit de catalogus, daarna product en kleur. Zoek eerst; kies “Overig” alleen als het item echt ontbreekt.",
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
  privacyMetaDescription: "Hoe OpenFilament account-e-mail, Stripe-betalingen, My Spools en cookies verwerkt.",
  cookiesTitle: "Cookiebeleid",
  termsTitle: "Servicevoorwaarden",
  termsMetaDescription:
    "OpenFilament-voorwaarden: dienst as-is, geen restitutie op Cloud, geen automatische verlenging, 30 dagen Cloud-exportvenster na afloop.",
  securityTitle: "Beveiliging",
  trustTitle: "Trust center",
  placeholderNotice: "Deze pagina bevat duidelijk gemarkeerde placeholders van de exploitant. Ze blokkeren de release tot ze zijn vervangen.",
  effective: "Ingangsdatum",
  operator: "Operator",
  privacyContact: "Privacycontact",
  hosting: "Hosting",
  contact: "Contact",
  openSourceRepository: "Open-source repository",
  cookieSettingsHint: "Je kunt analytics- en voorkeurscookies altijd wijzigen via Cookie-instellingen. Toestemmingsversie:",
  sections: {
    privacy: [
      {
        heading: "Accounts — wat we bewaren",
        paragraphs: [
          "Voor een account volstaan een e-mailadres en een wachtwoord. We bewaren dat e-mailadres zodat je kunt inloggen, betalingsbewijzen ontvangen en je wachtwoord kunt resetten. We vragen niet om je echte naam; een interne gebruikersnaam wordt automatisch gegenereerd. Wachtwoorden worden als scrypt-hashes opgeslagen — nooit in platte tekst.",
          "We gebruiken je e-mail niet voor marketing. Accountrecuperatie en essentiële serviceberichten (bijvoorbeeld over betaling of beveiliging) zijn de beoogde toepassingen.",
        ],
      },
      {
        heading: "Betalingen (Stripe)",
        paragraphs: [
          "Optionele aankopen van My Spools Cloud lopen via Stripe Checkout. Je voert kaart- of walletgegevens in op de gehoste betaalpagina’s van Stripe. Stripe is de payment processor: OpenFilament ontvangt of bewaart nooit je volledige kaartnummer, CVC of vergelijkbare walletgeheimen.",
          "Aan onze kant bewaren we alleen wat nodig is voor Cloud-toegang en administratie: bedrag, valuta, betalingsstatus, Stripe-sessie-/betalings-ID’s, tijdstempels en je Cloud-rechtenperiode. Stripe verwerkt betaalgegevens onder de eigen voorwaarden en het privacybeleid van Stripe.",
          "Cloud-toegang is een eenmalige vooruitbetaalde periode (momenteel 12 maanden). Er is geen automatische verlenging en geen off-session-afschrijving tenzij je zelf een nieuwe Checkout start.",
        ],
      },
      {
        heading: "Wat we verder verwerken",
        items: [
          "Authenticatiesessies (httpOnly-cookies) en beveiligingslogs.",
          "My Spools Cloud-inventaris, privénotities en QR/RFID-identiteiten alleen wanneer je expliciet naar Cloud synchroniseert.",
          "Lokale My Spools blijft in je browser tot je synchroniseert of exporteert — inloggen uploadt lokale spoelen niet vanzelf.",
          "Openbare communitybijdragen die je zelf publiceert (kalibraties, catalogustips).",
          "Toestemmingsvoorkeuren en optionele Google Analytics 4 alleen na opt-in.",
        ],
      },
      {
        heading: "Grondslagen",
        items: [
          "Overeenkomst / gevraagde dienst voor accounts, Cloud, export en downloads.",
          "Gerechtvaardigd belang voor beveiliging, misbruikpreventie en dienstintegriteit.",
          "Toestemming voor analytics-cookies/opslag — intrekbaar via Cookie-instellingen op deze site.",
          "Wettelijke verplichting waar beveiligings- of boekhoudrecords bewaard moeten blijven.",
        ],
      },
      {
        heading: "My Spools",
        paragraphs: [
          "Lokale My Spools is gratis en blijft op je apparaat. Sitegegevens wissen, apparaatverlies of van browser wisselen kan dit verwijderen.",
          "My Spools Cloud is optionele betaalde hosting voor inventarissync en back-up. Publieke QR-resolutie toont geen privénotities, locaties of account-ID’s.",
        ],
      },
      {
        heading: "Je rechten en bewaartermijnen",
        paragraphs: [
          "Je kunt inzage, correctie, verwijdering, beperking, overdraagbaarheid en bezwaar vragen en toestemming intrekken. Gebruik account-export/verwijderen, Cookie-instellingen of mail het privacycontact. Je mag klagen bij de voor deze site vermelde toezichthouder.",
          "Zacht verwijderde Cloud-spoelen worden volgens planning opgeschoond. Betalings- en beveiligingsrecords kunnen langer bewaard blijven waar dat nodig is voor administratie of fraudepreventie. Back-ups kunnen verwijderde data bewaren tot de back-up verloopt.",
        ],
      },
      {
        heading: "Internationale doorgifte en wijzigingen",
        paragraphs: [
          "Hosting van de applicatie en database staat op onze EU-VPS zoals hierboven. Als je analytics inschakelt, kan Google analyticsgegevens buiten de EER verwerken onder eigen waarborgen. Stripe kan betaalgegevens verwerken in regio’s waar Stripe actief is. Materiële beleidswijzigingen verhogen de toestemmingsversie en kunnen opnieuw om toestemming vragen.",
        ],
      },
    ],
    terms: [
      {
        heading: "Communitydienst as-is",
        paragraphs: [
          "OpenFilament wordt geleverd as-is en zoals beschikbaar. Catalogusdata, starterprofielen en communitykalibraties zijn geen garantie voor printveiligheid. Je blijft zelf verantwoordelijk voor het valideren van instellingen op je printer en voor printresultaten.",
          "We garanderen geen ononderbroken beschikbaarheid, foutloze werking of geschiktheid voor een bepaald doel, voor zover de wet dat toelaat. My Spools Cloud wordt in bèta aangeboden.",
        ],
      },
      {
        heading: "Accounts en gratis gebruik",
        paragraphs: [
          "Browsen, zoeken, profiel-downloads en My Spools Local zijn gratis. Een account (e-mail en wachtwoord) is optioneel voor gratis gebruik en alleen vereist als je My Spools Cloud koopt, zodat we inventaris kunnen koppelen en toegang kunnen herstellen.",
        ],
      },
      {
        heading: "My Spools Cloud — betaling, geen verlenging, geen restitutie",
        paragraphs: [
          "Cloud is een optionele prepaid digitale dienst: momenteel €19,99 voor 12 maanden, eenmalig betaald via Stripe Checkout. Er is geen automatische verlenging en geen off-session-afschrijving. Toegang eindigt wanneer de betaalde periode afloopt, tenzij je zelf een nieuwe Checkout start.",
          "Alle Cloud-aankopen zijn definitief: geen restitutie, geen chargebacks uit spijt van de koper, en geen gedeeltelijke restitutie voor ongebruikte maanden. Stripe verwerkt de betaling; OpenFilament bewaart geen kaartnummers.",
          "Cloud voegt alleen synchronisatie van spoelen tussen apparaten en server-side voorraad/back-up toe. Het ontgrendelt geen extra catalogus-, profiel- of RFID/QR-functies bovenop Local.",
        ],
      },
      {
        heading: "Na afloop van Cloud — 30 dagen om te exporteren",
        paragraphs: [
          "Wanneer je Cloud-periode eindigt, bewaren we je Cloud-inventaris nog 30 dagen. In die 30 dagen kun je je Cloud-data nog exporteren (JSON). Sync en schrijftoegang na afloop volgen de productregels (alleen-lezen / exportvenster).",
          "Na die 30 dagen kan Cloud-inventaris permanent van onze servers worden verwijderd. Lokale My Spools in je browser blijft onaangetast en gratis te gebruiken. Betalings- en beveiligingsrecords kunnen langer bewaard blijven waar dat nodig is voor administratie of fraudepreventie.",
        ],
      },
      {
        heading: "Bijdragen",
        paragraphs: [
          "Door kalibraties in te dienen accepteer je de bijdragevoorwaarden die bij submit worden getoond en licentieer je de bijdrage voor publieke weergave onder de open voorwaarden van het project. E-mails van bijdragers blijven privé.",
        ],
      },
      {
        heading: "Aansprakelijkheid",
        paragraphs: [
          "Voor zover toepasselijk recht dat toelaat, zijn OpenFilament en de exploitant niet aansprakelijk voor indirecte, incidentele of gevolgschade door gebruik van de gratis tools of de Cloud-bètadienst. Dwingende consumentenrechten die onder Nederlands of EU-recht niet kunnen worden uitgesloten, blijven onaangetast.",
        ],
      },
    ],
    cookies: [
      {
        heading: "Noodzakelijke opslag",
        paragraphs: [
          "Vereist om de site te laten werken: taal (of_locale), toestemmingskeuze (of_consent), ingelogde sessie (of_session, httpOnly), CSRF-bescherming (of_csrf) en lokale My Spools-data in IndexedDB. Een service worker / Cache Storage kan de PWA-shell offline houden. Dit wordt niet voor reclame gebruikt.",
        ],
      },
      {
        heading: "Optionele analytics",
        paragraphs: [
          "Alleen als je analytics accepteert laden we privacybewuste Google Analytics 4, die first-party cookies zoals _ga kan zetten. Analytics weigeren laat zoeken, My Spools, accounts, QR, RFID en downloads volledig bruikbaar. Marketingcookies worden niet gebruikt.",
        ],
      },
      {
        heading: "Je keuze wijzigen",
        paragraphs: [
          "Open Cookie-instellingen vanuit de footer of de privacybeleidpagina wanneer je wilt. Een andere keuze werkt de opslag meteen bij en zet analytics uit wanneer je toestemming intrekt.",
        ],
      },
    ],
    security: [
      {
        heading: "Wat we beschermen",
        items: [
          "Accountgegevens met scrypt-wachtwoordhashes.",
          "Sessietokens gehasht at rest en als httpOnly-cookies naar de browser.",
          "Privé My Spools met server-side eigendomschecks.",
          "Publieke QR-projecties zonder notities, locaties en account-ID’s.",
          "Betaalkaartgegevens via Stripe — niet opgeslagen op OpenFilament-servers.",
        ],
      },
      {
        heading: "Responsible disclosure",
        paragraphs: [
          "Meld kwetsbaarheden privé aan het ingestelde securitycontact. Publiceer geen secrets, exploits tegen live gebruikers of productiecredentials. Geef redelijke tijd voor herstel vóór publieke discussie.",
        ],
      },
    ],
  },
};

export const supportNl = {
  title: "Ondersteuning",
  metaDescription: "Wat OpenFilament is, wat je kunt doen, en hoe gratis My Spools verschilt van betaalde Cloud-sync (bèta).",
  lead: "Korte hulp van operator naar klant: waarvoor deze site is, en hoe My Spools Local vs Cloud werkt — inclusief dat betaalde Cloud nog bèta is.",
  productHeading: "Wat OpenFilament is",
  productBody: "OpenFilament is een browser-first filamentcatalogus en kalibratiehub. Vind filamentdata, download starter- of gemeten profielen voor je slicer, identificeer spoelen met QR of RFID, en houd optioneel inventaris bij met My Spools — zonder desktop-app voor het kernproduct.",
  productItems: [
    "Zoek merken, materialen en kleuren; gebruik fabrikantbereiken als sterke eerste instelling.",
    "Download slicervoorkeuren (gemeten communityprofielen indien beschikbaar, anders starters op basis van de fabrikant).",
    "Print QR-labels en gebruik RFID-flows als je compatibele hardware hebt.",
    "Draag kalibraties bij zodat anderen beter printen.",
    "Optioneel account voor Cloud-inventarissync — browsen en Local My Spools werken zonder te betalen.",
  ],
  mySpoolsHeading: "My Spools — gratis vs betaald",
  mySpoolsLocalTitle: "My Spools Local (gratis)",
  mySpoolsLocalBody: "Volledige inventaris op dit apparaat: notities, drogen, QR/RFID-koppelingen, import/export. Geen account nodig. Data blijft in je browser — exporteer back-ups als je sitegegevens wist of van apparaat wisselt.",
  mySpoolsCloudTitle: "My Spools Cloud (betaald, bèta)",
  mySpoolsCloudBody: "Optionele prepaid hosting (€19,99 voor 12 maanden, eenmalig via Stripe, geen auto-verlenging). Een account (e-mail + wachtwoord) is vereist zodat we Cloud-inventaris kunnen koppelen en toegang kunnen herstellen.",
  mySpoolsDiffItems: [
    "Gratis Local: volledige inventaristools op één browser/apparaat.",
    "Betaalde Cloud: de enige extras zijn spoelen synchroniseren tussen apparaten en server-side voorraad/back-up op onze VPS.",
    "Cloud ontgrendelt geen betere profielen, catalogusrechten, RFID/QR-functies of andere inventaristools die Local al heeft.",
    "Na de betaalde periode bewaren we Cloud-data 30 dagen zodat je nog kunt exporteren; daarna kan deze worden verwijderd. Local My Spools blijft volledig bruikbaar zonder Cloud.",
  ],
  betaNote:
    "My Spools Cloud is in bèta. Verwacht scherpe randen terwijl we sync en billing versterken. Het betaalde product blijft smal van doel: spoelsync en voorraad-back-up — niets meer. Aankopen zijn definitief (geen restitutie) en verlengen niet automatisch.",
  contactHeading: "Contact",
  contactBody: "Vragen over privacy, facturatie of Cloud-bèta: mail ons. Voor cookiekeuzes gebruik je Cookie-instellingen op de privacybeleidpagina.",
};
