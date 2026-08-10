import type { Locale } from "@/lib/messages";

export type UsageTrackingCopy = {
  title: string;
  lead: string;
  centralRule: string;
  beforePrint: string;
  afterSuccess: string;
  afterFailure: string;
  manualWorkflow: string;
  cloudDisclosureTitle: string;
  cloudDisclosures: string[];
  checkSetup: string;
  compareTitle: string;
  product: string;
  estimate: string;
  completion: string;
  failure: string;
  multiMaterial: string;
  method: string;
  status: string;
  hardware: string;
  limitations: string;
  evidence: string;
  docsTitle: string;
  exportProfileTitle: string;
  trackConsumptionTitle: string;
  statusLabels: Record<string, string>;
  yes: string;
  no: string;
  notVerified: string;
  checker: {
    title: string;
    lead: string;
    slicer: string;
    printer: string;
    connection: string;
    material: string;
    goal: string;
    resultTitle: string;
    worksNow: string;
    needsConfirmation: string;
    experimental: string;
    unavailable: string;
    cloudAdds: string;
    localSame: string;
  };
};

const en: UsageTrackingCopy = {
  title: "Filament usage tracking",
  lead:
    "OpenFilament separates slicer estimates, completed-print estimates, printer-reported usage, manual corrections and scale-measured actual usage.",
  centralRule:
    "A slicer estimate is never presented as automatically measured actual usage. Physical actual usage requires scale measurement.",
  beforePrint:
    "Before printing, import or enter the slicer estimate, review length, volume and weight where available, and map each tool, AMS/CFS slot or material to a physical spool.",
  afterSuccess:
    "After a successful print without printer integration, confirm completion and edit the full estimate before deducting it as completed-print estimate.",
  afterFailure:
    "After a failed, cancelled or interrupted print, OpenFilament does not deduct the full slicer estimate automatically. Use reliable printer-reported extrusion or enter a manual correction in grams.",
  manualWorkflow:
    "Manual workflows always remain available: record used grams, add grams back as a compensating transaction, correct the spool assignment and export the complete history.",
  cloudDisclosureTitle: "Before buying My Spools Cloud",
  cloudDisclosures: [
    "Cloud synchronizes inventory and history, but payment does not make an unsupported printer compatible.",
    "Slicer estimates work without a direct printer connection.",
    "Accurate failed-print tracking needs a compatible print host or manual input.",
    "Moonraker/Klipper is currently the strongest software-only method; it is still not physical measurement.",
    "Bambu, closed Creality and standard Prusa workflows may require manual confirmation.",
    "My Spools Local stays available without Cloud. Cloud is prepaid access with no automatic renewal.",
  ],
  checkSetup: "Check my setup",
  compareTitle: "Compatibility comparison",
  product: "Product",
  estimate: "Slicer estimate",
  completion: "Completion status",
  failure: "Failed-print tracking",
  multiMaterial: "Multi-material",
  method: "Integration method",
  status: "Status",
  hardware: "Hardware tested",
  limitations: "Limitations",
  evidence: "Evidence",
  docsTitle: "Instructions",
  exportProfileTitle: "Export a filament profile",
  trackConsumptionTitle: "Track filament consumption",
  statusLabels: {
    verified: "Verified",
    beta: "Beta",
    experimental: "Experimental",
    "manual-only": "Manual only",
    unavailable: "Unavailable",
    unverified: "Not yet verified",
  },
  yes: "Yes",
  no: "No",
  notVerified: "Not yet verified",
  checker: {
    title: "Compatibility checker",
    lead: "Answer conservatively. Unknown combinations are shown as not yet verified.",
    slicer: "Which slicer do you use?",
    printer: "Which printer or printer family?",
    connection: "How is it connected?",
    material: "Material system",
    goal: "Tracking goal",
    resultTitle: "Conservative result",
    worksNow: "What works now",
    needsConfirmation: "What requires confirmation",
    experimental: "What is experimental",
    unavailable: "What is unavailable",
    cloudAdds: "Cloud adds synchronization and backup, not automatic printer compatibility.",
    localSame: "Local provides the same tracking capability for manual and slicer-estimate workflows.",
  },
};

const translated: Partial<Record<Locale, UsageTrackingCopy>> = {
  nl: {
    ...en,
    title: "Filamentverbruik bijhouden",
    lead:
      "OpenFilament scheidt slicer-schattingen, bevestigd-print-schattingen, printer-gerapporteerd verbruik, handmatige correcties en met een weegschaal gemeten werkelijk verbruik.",
    centralRule:
      "Een slicer-schatting wordt nooit gepresenteerd als automatisch gemeten werkelijk verbruik. Werkelijk fysiek verbruik vereist weging.",
    beforePrint:
      "Importeer of voer vóór het printen de slicer-schatting in, controleer lengte, volume en gewicht waar beschikbaar en koppel elke tool, AMS/CFS-slot of materiaal aan een fysieke spool.",
    afterSuccess:
      "Na een geslaagde print zonder printerintegratie bevestig je de voltooiing en kun je de volledige schatting bewerken voordat die als bevestigd-print-schatting wordt afgetrokken.",
    afterFailure:
      "Na een mislukte, geannuleerde of onderbroken print trekt OpenFilament nooit automatisch de volledige slicer-schatting af. Gebruik betrouwbare printer-gerapporteerde extrusie of voer handmatig grammen in.",
    manualWorkflow:
      "Handmatige workflows blijven altijd beschikbaar: gebruikte grammen registreren, grammen terug toevoegen als compenserende transactie, spooltoewijzing corrigeren en de volledige geschiedenis exporteren.",
    cloudDisclosureTitle: "Vóór aankoop van My Spools Cloud",
    cloudDisclosures: [
      "Cloud synchroniseert voorraad en geschiedenis, maar betaling maakt een niet-ondersteunde printer niet compatibel.",
      "Slicer-schattingen werken zonder directe printerkoppeling.",
      "Nauwkeurige tracking van mislukte prints vereist een compatibele print-host of handmatige invoer.",
      "Moonraker/Klipper is nu de sterkste softwarematige methode; het is nog steeds geen fysieke meting.",
      "Bambu, gesloten Creality en standaard Prusa-workflows kunnen handmatige bevestiging vereisen.",
      "My Spools Local blijft beschikbaar zonder Cloud. Cloud is voorafbetaalde toegang zonder automatische verlenging.",
    ],
    checkSetup: "Controleer mijn setup",
    compareTitle: "Compatibiliteitsvergelijking",
    product: "Product",
    estimate: "Slicer-schatting",
    completion: "Voltooiingsstatus",
    failure: "Tracking bij mislukte print",
    multiMaterial: "Multi-materiaal",
    method: "Integratiemethode",
    status: "Status",
    hardware: "Hardware getest",
    limitations: "Beperkingen",
    evidence: "Bewijs",
    docsTitle: "Instructies",
    exportProfileTitle: "Filamentprofiel exporteren",
    trackConsumptionTitle: "Filamentverbruik bijhouden",
    statusLabels: {
      verified: "Geverifieerd",
      beta: "Bèta",
      experimental: "Experimenteel",
      "manual-only": "Alleen handmatig",
      unavailable: "Niet beschikbaar",
      unverified: "Nog niet geverifieerd",
    },
    yes: "Ja",
    no: "Nee",
    notVerified: "Nog niet geverifieerd",
    checker: {
      ...en.checker,
      title: "Compatibiliteitschecker",
      lead: "Het resultaat is conservatief. Onbekende combinaties worden als nog niet geverifieerd getoond.",
      slicer: "Welke slicer gebruik je?",
      printer: "Welke printer of printerfamilie?",
      connection: "Hoe is die verbonden?",
      material: "Materiaalsysteem",
      goal: "Trackingdoel",
      resultTitle: "Conservatief resultaat",
      worksNow: "Wat nu werkt",
      needsConfirmation: "Wat bevestiging vereist",
      experimental: "Wat experimenteel is",
      unavailable: "Wat niet beschikbaar is",
      cloudAdds: "Cloud voegt synchronisatie en back-up toe, geen automatische printercompatibiliteit.",
      localSame: "Local biedt dezelfde trackingmogelijkheden voor handmatige en slicer-schatting-workflows.",
    },
  },
};

const simpleLocales: Locale[] = ["de", "fr", "es", "pt", "ru", "uk", "zh"];

export function getUsageTrackingCopy(locale: Locale): UsageTrackingCopy {
  if (translated[locale]) return translated[locale]!;
  if (simpleLocales.includes(locale)) {
    return {
      ...en,
      centralRule:
        locale === "zh"
          ? "切片软件估算绝不会被描述为自动测得的实际用量。物理实际用量需要称重。"
          : locale === "de"
            ? "Eine Slicer-Schätzung wird nie als automatisch gemessener tatsächlicher Verbrauch dargestellt. Physischer tatsächlicher Verbrauch erfordert eine Waage."
            : locale === "fr"
              ? "Une estimation du slicer n’est jamais présentée comme une mesure réelle automatique. L’usage réel physique exige une pesée."
              : locale === "es"
                ? "Una estimación del laminador nunca se presenta como uso real medido automáticamente. El uso físico real requiere una báscula."
                : locale === "pt"
                  ? "Uma estimativa do slicer nunca é apresentada como uso real medido automaticamente. O uso físico real exige balança."
                  : locale === "ru"
                    ? "Оценка слайсера никогда не показывается как автоматически измеренный фактический расход. Физический фактический расход требует взвешивания."
                    : "Оцінка слайсера ніколи не подається як автоматично виміряна фактична витрата. Фізична фактична витрата потребує зважування.",
      statusLabels: translated.nl!.statusLabels,
      yes: locale === "zh" ? "是" : locale === "de" ? "Ja" : locale === "fr" ? "Oui" : locale === "es" ? "Sí" : locale === "pt" ? "Sim" : locale === "ru" ? "Да" : "Так",
      no: locale === "zh" ? "否" : locale === "de" ? "Nein" : locale === "fr" ? "Non" : locale === "es" ? "No" : locale === "pt" ? "Não" : locale === "ru" ? "Нет" : "Ні",
      notVerified:
        locale === "zh"
          ? "尚未验证"
          : locale === "de"
            ? "Noch nicht verifiziert"
            : locale === "fr"
              ? "Pas encore vérifié"
              : locale === "es"
                ? "Aún no verificado"
                : locale === "pt"
                  ? "Ainda não verificado"
                  : locale === "ru"
                    ? "Пока не проверено"
                    : "Ще не перевірено",
    };
  }
  return en;
}
