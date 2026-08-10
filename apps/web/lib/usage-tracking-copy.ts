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
  de: {
    ...en,
    title: "Filamentverbrauch verfolgen",
    lead:
      "OpenFilament trennt Slicer-Schätzungen, bestätigte Druck-Schätzungen, vom Drucker gemeldeten Verbrauch, manuelle Korrekturen und per Waage gemessenen tatsächlichen Verbrauch.",
    centralRule:
      "Eine Slicer-Schätzung wird nie als automatisch gemessener tatsächlicher Verbrauch dargestellt. Physischer tatsächlicher Verbrauch erfordert eine Waage.",
    beforePrint:
      "Importiere oder erfasse vor dem Druck die Slicer-Schätzung, prüfe Länge, Volumen und Gewicht, soweit verfügbar, und ordne jedes Tool, jeden AMS/CFS-Slot oder jedes Material einer physischen Spule zu.",
    afterSuccess:
      "Nach einem erfolgreichen Druck ohne Druckerintegration bestätigst du den Abschluss und kannst die vollständige Schätzung bearbeiten, bevor sie als bestätigte Druck-Schätzung abgezogen wird.",
    afterFailure:
      "Nach einem fehlgeschlagenen, abgebrochenen oder unterbrochenen Druck zieht OpenFilament nie automatisch die vollständige Slicer-Schätzung ab. Nutze zuverlässig gemeldete Druckerextrusion oder erfasse eine manuelle Korrektur in Gramm.",
    manualWorkflow:
      "Manuelle Workflows bleiben immer verfügbar: verbrauchte Gramm erfassen, Gramm als Ausgleichsbuchung zurückbuchen, Spulenzuordnung korrigieren und die vollständige Historie exportieren.",
    cloudDisclosureTitle: "Vor dem Kauf von My Spools Cloud",
    cloudDisclosures: [
      "Cloud synchronisiert Inventar und Historie, macht aber keinen nicht unterstützten Drucker kompatibel.",
      "Slicer-Schätzungen funktionieren ohne direkte Druckerverbindung.",
      "Genaues Tracking fehlgeschlagener Drucke braucht einen kompatiblen Print-Host oder manuelle Eingabe.",
      "Moonraker/Klipper ist derzeit die stärkste reine Softwaremethode; es ist trotzdem keine physische Messung.",
      "Bambu, geschlossene Creality- und Standard-Prusa-Workflows können manuelle Bestätigung erfordern.",
      "My Spools Local bleibt ohne Cloud verfügbar. Cloud ist vorausbezahlter Zugang ohne automatische Verlängerung.",
    ],
    checkSetup: "Setup prüfen",
    compareTitle: "Kompatibilitätsvergleich",
    product: "Produkt",
    estimate: "Slicer-Schätzung",
    completion: "Abschlussstatus",
    failure: "Tracking fehlgeschlagener Drucke",
    multiMaterial: "Mehrmaterial",
    method: "Integrationsmethode",
    status: "Status",
    hardware: "Hardware getestet",
    limitations: "Einschränkungen",
    evidence: "Nachweis",
    docsTitle: "Anleitung",
    exportProfileTitle: "Filamentprofil exportieren",
    trackConsumptionTitle: "Filamentverbrauch verfolgen",
    statusLabels: {
      verified: "Verifiziert",
      beta: "Beta",
      experimental: "Experimentell",
      "manual-only": "Nur manuell",
      unavailable: "Nicht verfügbar",
      unverified: "Noch nicht verifiziert",
    },
    yes: "Ja",
    no: "Nein",
    notVerified: "Noch nicht verifiziert",
    checker: {
      title: "Kompatibilitätschecker",
      lead: "Das Ergebnis ist konservativ. Unbekannte Kombinationen werden als noch nicht verifiziert angezeigt.",
      slicer: "Welchen Slicer nutzt du?",
      printer: "Welchen Drucker oder welche Druckerfamilie?",
      connection: "Wie ist er verbunden?",
      material: "Materialsystem",
      goal: "Tracking-Ziel",
      resultTitle: "Konservatives Ergebnis",
      worksNow: "Was jetzt funktioniert",
      needsConfirmation: "Was Bestätigung erfordert",
      experimental: "Was experimentell ist",
      unavailable: "Was nicht verfügbar ist",
      cloudAdds: "Cloud ergänzt Synchronisierung und Backup, keine automatische Druckerkompatibilität.",
      localSame: "Local bietet dieselbe Tracking-Fähigkeit für manuelle und Slicer-Schätzungs-Workflows.",
    },
  },
  fr: {
    ...en,
    title: "Suivi de la consommation de filament",
    lead:
      "OpenFilament distingue les estimations du slicer, les estimations après impression confirmée, l’usage rapporté par l’imprimante, les corrections manuelles et l’usage réel mesuré par balance.",
    centralRule:
      "Une estimation du slicer n’est jamais présentée comme une mesure réelle automatique. L’usage réel physique exige une pesée.",
    beforePrint:
      "Avant d’imprimer, importez ou saisissez l’estimation du slicer, vérifiez longueur, volume et poids si disponibles, puis associez chaque outil, slot AMS/CFS ou matière à une bobine physique.",
    afterSuccess:
      "Après une impression réussie sans intégration d’imprimante, confirmez la fin et modifiez l’estimation complète avant de la déduire comme estimation après impression confirmée.",
    afterFailure:
      "Après une impression échouée, annulée ou interrompue, OpenFilament ne déduit jamais automatiquement l’estimation complète du slicer. Utilisez une extrusion fiable rapportée par l’imprimante ou saisissez une correction manuelle en grammes.",
    manualWorkflow:
      "Les workflows manuels restent toujours disponibles : enregistrer les grammes utilisés, rajouter des grammes via une transaction compensatrice, corriger l’affectation de bobine et exporter tout l’historique.",
    cloudDisclosureTitle: "Avant d’acheter My Spools Cloud",
    cloudDisclosures: [
      "Cloud synchronise l’inventaire et l’historique, mais le paiement ne rend pas compatible une imprimante non prise en charge.",
      "Les estimations du slicer fonctionnent sans connexion directe à l’imprimante.",
      "Le suivi précis des impressions échouées exige un print host compatible ou une saisie manuelle.",
      "Moonraker/Klipper est actuellement la méthode logicielle la plus forte ; ce n’est toujours pas une mesure physique.",
      "Bambu, les systèmes Creality fermés et les workflows Prusa standards peuvent exiger une confirmation manuelle.",
      "My Spools Local reste disponible sans Cloud. Cloud est un accès prépayé sans renouvellement automatique.",
    ],
    checkSetup: "Vérifier ma configuration",
    compareTitle: "Comparaison de compatibilité",
    product: "Produit",
    estimate: "Estimation du slicer",
    completion: "Statut de fin",
    failure: "Suivi d’impression échouée",
    multiMaterial: "Multi-matériau",
    method: "Méthode d’intégration",
    status: "Statut",
    hardware: "Matériel testé",
    limitations: "Limites",
    evidence: "Preuve",
    docsTitle: "Instructions",
    exportProfileTitle: "Exporter un profil filament",
    trackConsumptionTitle: "Suivre la consommation de filament",
    statusLabels: {
      verified: "Vérifié",
      beta: "Bêta",
      experimental: "Expérimental",
      "manual-only": "Manuel uniquement",
      unavailable: "Indisponible",
      unverified: "Pas encore vérifié",
    },
    yes: "Oui",
    no: "Non",
    notVerified: "Pas encore vérifié",
    checker: {
      title: "Vérificateur de compatibilité",
      lead: "Le résultat est conservateur. Les combinaisons inconnues sont indiquées comme non encore vérifiées.",
      slicer: "Quel slicer utilisez-vous ?",
      printer: "Quelle imprimante ou famille d’imprimantes ?",
      connection: "Comment est-elle connectée ?",
      material: "Système de matériaux",
      goal: "Objectif de suivi",
      resultTitle: "Résultat conservateur",
      worksNow: "Ce qui fonctionne maintenant",
      needsConfirmation: "Ce qui exige une confirmation",
      experimental: "Ce qui est expérimental",
      unavailable: "Ce qui est indisponible",
      cloudAdds: "Cloud ajoute synchronisation et sauvegarde, pas de compatibilité imprimante automatique.",
      localSame: "Local fournit la même capacité de suivi pour les workflows manuels et d’estimation du slicer.",
    },
  },
  es: {
    ...en,
    title: "Seguimiento del uso de filamento",
    lead:
      "OpenFilament separa estimaciones del slicer, estimaciones tras impresión confirmada, uso informado por la impresora, correcciones manuales y uso real medido con báscula.",
    centralRule:
      "Una estimación del laminador nunca se presenta como uso real medido automáticamente. El uso físico real requiere una báscula.",
    beforePrint:
      "Antes de imprimir, importa o introduce la estimación del slicer, revisa longitud, volumen y peso cuando estén disponibles, y asigna cada herramienta, ranura AMS/CFS o material a una bobina física.",
    afterSuccess:
      "Tras una impresión correcta sin integración de impresora, confirma la finalización y edita la estimación completa antes de descontarla como estimación de impresión completada.",
    afterFailure:
      "Tras una impresión fallida, cancelada o interrumpida, OpenFilament no descuenta automáticamente la estimación completa del slicer. Usa extrusión fiable informada por la impresora o introduce una corrección manual en gramos.",
    manualWorkflow:
      "Los flujos manuales siempre siguen disponibles: registrar gramos usados, añadir gramos de vuelta como transacción compensatoria, corregir la bobina asignada y exportar todo el historial.",
    cloudDisclosureTitle: "Antes de comprar My Spools Cloud",
    cloudDisclosures: [
      "Cloud sincroniza inventario e historial, pero el pago no hace compatible una impresora no soportada.",
      "Las estimaciones del slicer funcionan sin conexión directa con la impresora.",
      "El seguimiento preciso de impresiones fallidas necesita un print host compatible o entrada manual.",
      "Moonraker/Klipper es actualmente el método solo software más sólido; sigue sin ser medición física.",
      "Bambu, Creality cerrado y flujos Prusa estándar pueden requerir confirmación manual.",
      "My Spools Local sigue disponible sin Cloud. Cloud es acceso prepagado sin renovación automática.",
    ],
    checkSetup: "Comprobar mi configuración",
    compareTitle: "Comparación de compatibilidad",
    product: "Producto",
    estimate: "Estimación del slicer",
    completion: "Estado de finalización",
    failure: "Seguimiento de impresión fallida",
    multiMaterial: "Multimaterial",
    method: "Método de integración",
    status: "Estado",
    hardware: "Hardware probado",
    limitations: "Limitaciones",
    evidence: "Evidencia",
    docsTitle: "Instrucciones",
    exportProfileTitle: "Exportar un perfil de filamento",
    trackConsumptionTitle: "Seguir consumo de filamento",
    statusLabels: {
      verified: "Verificado",
      beta: "Beta",
      experimental: "Experimental",
      "manual-only": "Solo manual",
      unavailable: "No disponible",
      unverified: "Aún no verificado",
    },
    yes: "Sí",
    no: "No",
    notVerified: "Aún no verificado",
    checker: {
      title: "Comprobador de compatibilidad",
      lead: "El resultado es conservador. Las combinaciones desconocidas se muestran como aún no verificadas.",
      slicer: "¿Qué slicer usas?",
      printer: "¿Qué impresora o familia de impresoras?",
      connection: "¿Cómo está conectada?",
      material: "Sistema de materiales",
      goal: "Objetivo de seguimiento",
      resultTitle: "Resultado conservador",
      worksNow: "Qué funciona ahora",
      needsConfirmation: "Qué requiere confirmación",
      experimental: "Qué es experimental",
      unavailable: "Qué no está disponible",
      cloudAdds: "Cloud añade sincronización y copia de seguridad, no compatibilidad automática de impresora.",
      localSame: "Local ofrece la misma capacidad de seguimiento para flujos manuales y de estimación del slicer.",
    },
  },
  pt: {
    ...en,
    title: "Acompanhamento do uso de filamento",
    lead:
      "O OpenFilament separa estimativas do slicer, estimativas após impressão confirmada, uso reportado pela impressora, correções manuais e uso real medido com balança.",
    centralRule:
      "Uma estimativa do slicer nunca é apresentada como uso real medido automaticamente. O uso físico real exige balança.",
    beforePrint:
      "Antes de imprimir, importe ou introduza a estimativa do slicer, reveja comprimento, volume e peso quando disponíveis, e associe cada ferramenta, slot AMS/CFS ou material a um carretel físico.",
    afterSuccess:
      "Após uma impressão bem-sucedida sem integração de impressora, confirme a conclusão e edite a estimativa completa antes de a descontar como estimativa de impressão concluída.",
    afterFailure:
      "Após uma impressão falhada, cancelada ou interrompida, o OpenFilament não desconta automaticamente a estimativa completa do slicer. Use extrusão fiável reportada pela impressora ou introduza uma correção manual em gramas.",
    manualWorkflow:
      "Os fluxos manuais continuam sempre disponíveis: registar gramas usados, adicionar gramas de volta como transação compensatória, corrigir a atribuição do carretel e exportar todo o histórico.",
    cloudDisclosureTitle: "Antes de comprar My Spools Cloud",
    cloudDisclosures: [
      "Cloud sincroniza inventário e histórico, mas o pagamento não torna compatível uma impressora não suportada.",
      "Estimativas do slicer funcionam sem ligação direta à impressora.",
      "O acompanhamento preciso de impressões falhadas precisa de um print host compatível ou entrada manual.",
      "Moonraker/Klipper é atualmente o método só de software mais forte; continua a não ser medição física.",
      "Bambu, Creality fechado e fluxos Prusa padrão podem exigir confirmação manual.",
      "My Spools Local continua disponível sem Cloud. Cloud é acesso pré-pago sem renovação automática.",
    ],
    checkSetup: "Verificar a minha configuração",
    compareTitle: "Comparação de compatibilidade",
    product: "Produto",
    estimate: "Estimativa do slicer",
    completion: "Estado de conclusão",
    failure: "Acompanhamento de impressão falhada",
    multiMaterial: "Multimaterial",
    method: "Método de integração",
    status: "Estado",
    hardware: "Hardware testado",
    limitations: "Limitações",
    evidence: "Evidência",
    docsTitle: "Instruções",
    exportProfileTitle: "Exportar um perfil de filamento",
    trackConsumptionTitle: "Acompanhar consumo de filamento",
    statusLabels: {
      verified: "Verificado",
      beta: "Beta",
      experimental: "Experimental",
      "manual-only": "Só manual",
      unavailable: "Indisponível",
      unverified: "Ainda não verificado",
    },
    yes: "Sim",
    no: "Não",
    notVerified: "Ainda não verificado",
    checker: {
      title: "Verificador de compatibilidade",
      lead: "O resultado é conservador. Combinações desconhecidas aparecem como ainda não verificadas.",
      slicer: "Que slicer usa?",
      printer: "Que impressora ou família de impressoras?",
      connection: "Como está ligada?",
      material: "Sistema de materiais",
      goal: "Objetivo de acompanhamento",
      resultTitle: "Resultado conservador",
      worksNow: "O que funciona agora",
      needsConfirmation: "O que requer confirmação",
      experimental: "O que é experimental",
      unavailable: "O que está indisponível",
      cloudAdds: "Cloud adiciona sincronização e cópia de segurança, não compatibilidade automática da impressora.",
      localSame: "Local oferece a mesma capacidade de acompanhamento para fluxos manuais e estimativas do slicer.",
    },
  },
  ru: {
    ...en,
    title: "Учёт расхода филамента",
    lead:
      "OpenFilament разделяет оценки слайсера, оценки после подтверждённой печати, расход, сообщённый принтером, ручные корректировки и фактический расход, измеренный весами.",
    centralRule:
      "Оценка слайсера никогда не показывается как автоматически измеренный фактический расход. Физический фактический расход требует взвешивания.",
    beforePrint:
      "Перед печатью импортируйте или введите оценку слайсера, проверьте длину, объём и вес, если они доступны, и сопоставьте каждый инструмент, слот AMS/CFS или материал с физической катушкой.",
    afterSuccess:
      "После успешной печати без интеграции с принтером подтвердите завершение и при необходимости измените полную оценку перед списанием как оценку завершённой печати.",
    afterFailure:
      "После неудачной, отменённой или прерванной печати OpenFilament не списывает полную оценку слайсера автоматически. Используйте надёжно сообщённую принтером экструзию или введите ручную корректировку в граммах.",
    manualWorkflow:
      "Ручные сценарии всегда доступны: записать использованные граммы, добавить граммы обратно компенсирующей транзакцией, исправить назначенную катушку и экспортировать всю историю.",
    cloudDisclosureTitle: "Перед покупкой My Spools Cloud",
    cloudDisclosures: [
      "Cloud синхронизирует инвентарь и историю, но оплата не делает неподдерживаемый принтер совместимым.",
      "Оценки слайсера работают без прямого подключения к принтеру.",
      "Точный учёт неудачных печатей требует совместимого print host или ручного ввода.",
      "Moonraker/Klipper сейчас самый сильный программный метод; это всё равно не физическое измерение.",
      "Bambu, закрытые Creality и стандартные Prusa-сценарии могут требовать ручного подтверждения.",
      "My Spools Local остаётся доступным без Cloud. Cloud — предоплаченный доступ без автоматического продления.",
    ],
    checkSetup: "Проверить мою конфигурацию",
    compareTitle: "Сравнение совместимости",
    product: "Продукт",
    estimate: "Оценка слайсера",
    completion: "Статус завершения",
    failure: "Учёт неудачной печати",
    multiMaterial: "Мультиматериал",
    method: "Метод интеграции",
    status: "Статус",
    hardware: "Оборудование проверено",
    limitations: "Ограничения",
    evidence: "Доказательства",
    docsTitle: "Инструкции",
    exportProfileTitle: "Экспорт профиля филамента",
    trackConsumptionTitle: "Учёт расхода филамента",
    statusLabels: {
      verified: "Проверено",
      beta: "Бета",
      experimental: "Экспериментально",
      "manual-only": "Только вручную",
      unavailable: "Недоступно",
      unverified: "Пока не проверено",
    },
    yes: "Да",
    no: "Нет",
    notVerified: "Пока не проверено",
    checker: {
      title: "Проверка совместимости",
      lead: "Результат консервативный. Неизвестные сочетания показываются как ещё не проверенные.",
      slicer: "Какой слайсер вы используете?",
      printer: "Какой принтер или семейство принтеров?",
      connection: "Как он подключён?",
      material: "Система материалов",
      goal: "Цель учёта",
      resultTitle: "Консервативный результат",
      worksNow: "Что работает сейчас",
      needsConfirmation: "Что требует подтверждения",
      experimental: "Что экспериментально",
      unavailable: "Что недоступно",
      cloudAdds: "Cloud добавляет синхронизацию и резервную копию, но не автоматическую совместимость с принтером.",
      localSame: "Local даёт ту же возможность учёта для ручных сценариев и оценок слайсера.",
    },
  },
  uk: {
    ...en,
    title: "Облік витрати філаменту",
    lead:
      "OpenFilament розділяє оцінки слайсера, оцінки після підтвердженого друку, витрату, повідомлену принтером, ручні корекції та фактичну витрату, виміряну вагами.",
    centralRule:
      "Оцінка слайсера ніколи не подається як автоматично виміряна фактична витрата. Фізична фактична витрата потребує зважування.",
    beforePrint:
      "Перед друком імпортуйте або введіть оцінку слайсера, перевірте довжину, об’єм і вагу, якщо вони доступні, та зіставте кожен інструмент, слот AMS/CFS або матеріал із фізичною котушкою.",
    afterSuccess:
      "Після успішного друку без інтеграції з принтером підтвердьте завершення й за потреби змініть повну оцінку перед списанням як оцінку завершеного друку.",
    afterFailure:
      "Після невдалого, скасованого або перерваного друку OpenFilament не списує повну оцінку слайсера автоматично. Використовуйте надійно повідомлену принтером екструзію або введіть ручну корекцію в грамах.",
    manualWorkflow:
      "Ручні сценарії завжди доступні: записати використані грами, додати грами назад компенсувальною транзакцією, виправити призначену котушку та експортувати всю історію.",
    cloudDisclosureTitle: "Перед купівлею My Spools Cloud",
    cloudDisclosures: [
      "Cloud синхронізує інвентар та історію, але оплата не робить непідтримуваний принтер сумісним.",
      "Оцінки слайсера працюють без прямого підключення до принтера.",
      "Точний облік невдалих друків потребує сумісного print host або ручного вводу.",
      "Moonraker/Klipper зараз найсильніший програмний метод; це все одно не фізичне вимірювання.",
      "Bambu, закриті Creality та стандартні Prusa-сценарії можуть вимагати ручного підтвердження.",
      "My Spools Local залишається доступним без Cloud. Cloud — передплачений доступ без автоматичного поновлення.",
    ],
    checkSetup: "Перевірити мою конфігурацію",
    compareTitle: "Порівняння сумісності",
    product: "Продукт",
    estimate: "Оцінка слайсера",
    completion: "Статус завершення",
    failure: "Облік невдалого друку",
    multiMaterial: "Мультиматеріал",
    method: "Метод інтеграції",
    status: "Статус",
    hardware: "Обладнання перевірено",
    limitations: "Обмеження",
    evidence: "Докази",
    docsTitle: "Інструкції",
    exportProfileTitle: "Експорт профілю філаменту",
    trackConsumptionTitle: "Облік витрати філаменту",
    statusLabels: {
      verified: "Перевірено",
      beta: "Бета",
      experimental: "Експериментально",
      "manual-only": "Лише вручну",
      unavailable: "Недоступно",
      unverified: "Ще не перевірено",
    },
    yes: "Так",
    no: "Ні",
    notVerified: "Ще не перевірено",
    checker: {
      title: "Перевірка сумісності",
      lead: "Результат консервативний. Невідомі поєднання показуються як ще не перевірені.",
      slicer: "Який слайсер ви використовуєте?",
      printer: "Який принтер або сімейство принтерів?",
      connection: "Як він підключений?",
      material: "Система матеріалів",
      goal: "Ціль обліку",
      resultTitle: "Консервативний результат",
      worksNow: "Що працює зараз",
      needsConfirmation: "Що потребує підтвердження",
      experimental: "Що експериментальне",
      unavailable: "Що недоступне",
      cloudAdds: "Cloud додає синхронізацію та резервну копію, але не автоматичну сумісність із принтером.",
      localSame: "Local дає ту саму можливість обліку для ручних сценаріїв і оцінок слайсера.",
    },
  },
  zh: {
    ...en,
    title: "耗材用量追踪",
    lead:
      "OpenFilament 区分切片估算、完成打印估算、打印机报告用量、手动修正，以及通过秤测得的实际用量。",
    centralRule:
      "切片软件估算绝不会被描述为自动测得的实际用量。物理实际用量需要称重。",
    beforePrint:
      "打印前，导入或输入切片估算；在可用时检查长度、体积和重量；并将每个工具、AMS/CFS 槽位或材料映射到实体料盘。",
    afterSuccess:
      "成功打印后，如果没有打印机集成，请确认打印完成，并在按完成打印估算扣减前编辑完整估算。",
    afterFailure:
      "打印失败、取消或中断后，OpenFilament 不会自动扣减完整切片估算。请使用可靠的打印机报告挤出量，或以克为单位输入手动修正。",
    manualWorkflow:
      "手动流程始终可用：记录已用克数、通过补偿交易加回克数、修正料盘分配，并导出完整历史。",
    cloudDisclosureTitle: "购买 My Spools Cloud 之前",
    cloudDisclosures: [
      "Cloud 会同步库存和历史，但付款不会让不受支持的打印机自动兼容。",
      "切片估算不需要直接连接打印机即可使用。",
      "准确追踪失败打印需要兼容的 print host 或手动输入。",
      "Moonraker/Klipper 目前是最强的软件方式；但仍不是物理测量。",
      "Bambu、封闭 Creality 和标准 Prusa 流程可能需要手动确认。",
      "没有 Cloud 也可以使用 My Spools Local。Cloud 是预付访问，不会自动续费。",
    ],
    checkSetup: "检查我的配置",
    compareTitle: "兼容性比较",
    product: "产品",
    estimate: "切片估算",
    completion: "完成状态",
    failure: "失败打印追踪",
    multiMaterial: "多材料",
    method: "集成方式",
    status: "状态",
    hardware: "硬件已测试",
    limitations: "限制",
    evidence: "证据",
    docsTitle: "说明",
    exportProfileTitle: "导出耗材配置",
    trackConsumptionTitle: "追踪耗材消耗",
    statusLabels: {
      verified: "已验证",
      beta: "Beta",
      experimental: "实验性",
      "manual-only": "仅手动",
      unavailable: "不可用",
      unverified: "尚未验证",
    },
    yes: "是",
    no: "否",
    notVerified: "尚未验证",
    checker: {
      title: "兼容性检查器",
      lead: "结果保持保守。未知组合会显示为尚未验证。",
      slicer: "你使用哪款切片软件？",
      printer: "你的打印机或打印机系列是什么？",
      connection: "它如何连接？",
      material: "材料系统",
      goal: "追踪目标",
      resultTitle: "保守结果",
      worksNow: "当前可用",
      needsConfirmation: "需要确认",
      experimental: "实验性内容",
      unavailable: "不可用内容",
      cloudAdds: "Cloud 增加同步和备份，不会自动增加打印机兼容性。",
      localSame: "Local 对手动流程和切片估算流程提供相同的追踪能力。",
    },
  },
};

export function getUsageTrackingCopy(locale: Locale): UsageTrackingCopy {
  if (translated[locale]) return translated[locale]!;
  return en;
}
