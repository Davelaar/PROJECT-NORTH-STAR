#!/usr/bin/env node
/**
 * Replaces `cloud: cloudEn,` in locale message files with full translated
 * cloud objects matching every key in apps/web/lib/messages/prod-en.ts cloudEn.
 *
 * Usage: node scripts/gen-cloud-locales.mjs
 *
 * Leaves apps/web/lib/messages/en.ts as `cloud: cloudEn` (English source of truth).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "../apps/web/lib/messages");

/** @type {Record<string, Record<string, string>>} */
const clouds = {
  de: {
    navLink: "Cloud",
    billingLink: "Zahlungsverlauf",
    pageTitle: "My Spools Cloud",
    pageLead:
      "Optionales Cloud-Backup und Sync für alle, die lokale Inventur nicht verlieren wollen. My Spools Local bleibt kostenlos und vollständig — Cloud schaltet keine zusätzlichen Inventarfunktionen frei.",
    optionalBadge: "Optionaler Luxus — nicht erforderlich",
    localTitle: "My Spools Local — kostenlos",
    localBody:
      "Vollständiges Inventar auf diesem Gerät (IndexedDB): Notizen, Trocknen, QR/RFID, Import/Export. Kein Konto nötig. Exportiere regelmäßig Backups — Browserdaten löschen kann lokales Inventar entfernen.",
    cloudTitle: "My Spools Cloud — €19,99 für 12 Monate",
    cloudWhyTitle: "Was Cloud hinzufügt",
    cloudWhyBody:
      "Nur Hosting auf unserem VPS, Sync über deine Geräte und serverseitiges Backup/Wiederherstellung. Dieselben Spulen-Tools gibt es schon in Local; Cloud ist für Sicherheit, nicht für Extra-Funktionen.",
    priceLine: "€19,99 für 12 Monate",
    oneTime: "Einmalzahlung",
    noAutoRenewal: "Keine automatische Verlängerung",
    neverCharge:
      "Wir belasten dich nie erneut, es sei denn, du kaufst selbst weitere 12 Monate.",
    includesTitle: "In Cloud enthalten",
    includeSync: "Synchronisation über Geräte",
    includeBackup: "Serverseitige Backups auf unserem VPS",
    includeRecovery: "Kontowiederherstellung für Cloud-Inventar",
    includeExport: "Cloud-JSON-Export während Zugang, Nachfrist und Aufbewahrung",
    notIncludedTitle: "Nicht enthalten",
    notIncludedBody:
      "Keine zusätzlichen Inventar-Tools über Local hinaus. Cloud fügt keine RFID/QR-Funktionen, smarten Profile oder Katalogrechte hinzu — nur Speicher und Sync.",
    statusLabel: "Cloud-Status",
    statusInactive: "Inaktiv",
    statusPending: "Ausstehend",
    statusActive: "Aktiv",
    statusGrace: "Nachfrist",
    statusReadOnly: "Nur lesen",
    statusExpired: "Abgelaufen",
    statusRefunded: "Erstattet",
    statusDisputed: "Angefochten",
    statusRevoked: "Widerrufen",
    validUntil: "Cloud-Zugang gültig bis",
    graceUntil: "Nachfrist bis",
    readOnlyFrom: "Nur lesen ab",
    deletionAt: "Löschung der Cloud-Daten geplant um",
    buyCta: "12 Monate Cloud kaufen — €19,99",
    extendCta: "Cloud um 12 Monate verlängern — €19,99",
    extendHint:
      "Ein weiterer Kauf von 12 Monaten verlängert den Zugang ab dem aktuellen Ablaufdatum.",
    loginRequired: "Melde dich an, um My Spools Cloud zu kaufen oder zu verwalten.",
    checkoutUnavailable: "Checkout ist noch nicht verfügbar (Konfiguration ausstehend).",
    termsLink: "AGB",
    privacyLink: "Datenschutz",
    retentionHint:
      "Nach Ablauf behältst du ein Nachfristfenster, dann ein Nur-Lesen-Exportfenster, danach Löschung des Cloud-Inventars. My Spools Local bleibt voll nutzbar.",
    vatUnspecified:
      "Die Steuerdarstellung ist vom Betreiber noch nicht konfiguriert (MwSt. inklusiv/exklusiv).",
    vatNotApplicable: "MwSt. nicht anwendbar — angezeigter Preis ist der zu zahlende Betrag.",
    successTitle: "Zahlungsstatus",
    verifying:
      "Wir prüfen deine Zahlung bei Stripe. Cloud-Zugang wird nach Zahlungsbestätigung aktiviert.",
    activatedTitle: "My Spools Cloud ist aktiv",
    paidOnce: "Einmalig bezahlt",
    autoRenewalOff: "Automatische Verlängerung: Aus",
    pendingPayment:
      "Deine Zahlung wird noch verarbeitet. Wir aktivieren Cloud, sobald Stripe sie bestätigt.",
    failedPayment:
      "Zahlung nicht abgeschlossen. Kein Cloud-Zugang hinzugefügt und keine weitere Zahlung wird versucht.",
    billingTitle: "Cloud-Zahlungsverlauf",
    billingLead:
      "Nur Einmalzahlungen. Keine wiederkehrenden Rechnungen. OpenFilament speichert keine Kartendaten.",
    receipt: "Beleg",
    accessPeriod: "Zugangszeitraum",
    exportCloud: "Cloud-Spulen exportieren (JSON)",
    backToSpools: "Zurück zu My Spools",
    syncRequiresCloud:
      "Cloud-Sync ist optional und braucht eine aktive vorausbezahlte Cloud-Periode (oder Nachfrist). Lokales Inventar bleibt ohne Cloud kostenlos und vollständig.",
    paymentStatusCreated: "Erstellt",
    paymentStatusPending: "Ausstehend",
    paymentStatusPaid: "Bezahlt",
    paymentStatusFailed: "Fehlgeschlagen",
    paymentStatusExpired: "Abgelaufen",
    paymentStatusRefunded: "Erstattet",
    paymentStatusPartialRefund: "Teilweise erstattet",
    paymentStatusDisputed: "Angefochten",
    paymentStatusCancelled: "Storniert",
  },

  fr: {
    navLink: "Cloud",
    billingLink: "Historique de paiement",
    pageTitle: "My Spools Cloud",
    pageLead:
      "Sauvegarde et sync cloud optionnelles pour ceux qui ne veulent pas risquer de perdre l’inventaire local. My Spools Local reste gratuit et complet — Cloud n’ajoute aucune fonction d’inventaire supplémentaire.",
    optionalBadge: "Luxe optionnel — pas obligatoire",
    localTitle: "My Spools Local — gratuit",
    localBody:
      "Inventaire complet sur cet appareil (IndexedDB) : notes, séchage, QR/RFID, import/export. Aucun compte requis. Exporte régulièrement des sauvegardes — vider les données du navigateur peut supprimer l’inventaire local.",
    cloudTitle: "My Spools Cloud — 19,99 € pour 12 mois",
    cloudWhyTitle: "Ce que Cloud ajoute",
    cloudWhyBody:
      "Uniquement l’hébergement sur notre VPS, la sync entre tes appareils, et la sauvegarde/récupération côté serveur. Les mêmes outils de bobines existent déjà en Local ; Cloud, c’est la tranquillité d’esprit, pas des capacités en plus.",
    priceLine: "19,99 € pour 12 mois",
    oneTime: "Paiement unique",
    noAutoRenewal: "Pas de renouvellement automatique",
    neverCharge:
      "Nous ne te facturerons jamais à nouveau, sauf si tu choisis d’acheter 12 mois de plus.",
    includesTitle: "Inclus avec Cloud",
    includeSync: "Synchronisation entre appareils",
    includeBackup: "Sauvegardes côté serveur sur notre VPS",
    includeRecovery: "Récupération de compte pour l’inventaire Cloud",
    includeExport: "Export JSON Cloud pendant l’accès, le délai de grâce et la rétention",
    notIncludedTitle: "Non inclus",
    notIncludedBody:
      "Aucun outil d’inventaire en plus du Local. Cloud n’ajoute pas de fonctions RFID/QR, de profils plus intelligents ni de privilèges catalogue — uniquement stockage et sync.",
    statusLabel: "Statut Cloud",
    statusInactive: "Inactif",
    statusPending: "En attente",
    statusActive: "Actif",
    statusGrace: "Période de grâce",
    statusReadOnly: "Lecture seule",
    statusExpired: "Expiré",
    statusRefunded: "Remboursé",
    statusDisputed: "Contesté",
    statusRevoked: "Révoqué",
    validUntil: "Accès Cloud valable jusqu’au",
    graceUntil: "Période de grâce jusqu’au",
    readOnlyFrom: "Lecture seule à partir du",
    deletionAt: "Suppression des données Cloud prévue vers",
    buyCta: "Acheter 12 mois de Cloud — 19,99 €",
    extendCta: "Prolonger Cloud de 12 mois — 19,99 €",
    extendHint:
      "Acheter 12 mois de plus prolonge l’accès à partir de la date d’expiration actuelle.",
    loginRequired: "Connecte-toi pour acheter ou gérer My Spools Cloud.",
    checkoutUnavailable: "Le paiement n’est pas encore disponible (configuration en attente).",
    termsLink: "Conditions",
    privacyLink: "Confidentialité",
    retentionHint:
      "Après expiration, tu gardes une fenêtre de grâce, puis une fenêtre d’export en lecture seule, puis suppression de l’inventaire Cloud. My Spools Local reste pleinement utilisable.",
    vatUnspecified:
      "La présentation fiscale n’est pas encore configurée par l’opérateur (TVA incluse/exclue).",
    vatNotApplicable: "TVA non applicable — le prix affiché est le montant facturé.",
    successTitle: "Statut du paiement",
    verifying:
      "Nous vérifions ton paiement avec Stripe. L’accès Cloud s’activera après confirmation du paiement.",
    activatedTitle: "My Spools Cloud est actif",
    paidOnce: "Payé une fois",
    autoRenewalOff: "Renouvellement automatique : Désactivé",
    pendingPayment:
      "Ton paiement est encore en cours. Nous activerons Cloud après confirmation Stripe.",
    failedPayment:
      "Le paiement n’a pas été effectué. Aucun accès Cloud n’a été ajouté et aucun paiement futur ne sera tenté.",
    billingTitle: "Historique de facturation Cloud",
    billingLead:
      "Paiements uniques uniquement. Ce ne sont pas des factures récurrentes. OpenFilament ne stocke pas les données de carte.",
    receipt: "Reçu",
    accessPeriod: "Période d’accès",
    exportCloud: "Exporter les bobines Cloud (JSON)",
    backToSpools: "Retour à My Spools",
    syncRequiresCloud:
      "La sync Cloud est optionnelle et nécessite une période Cloud prépayée active (ou de grâce). L’inventaire local reste gratuit et complet sans Cloud.",
    paymentStatusCreated: "Créé",
    paymentStatusPending: "En attente",
    paymentStatusPaid: "Payé",
    paymentStatusFailed: "Échoué",
    paymentStatusExpired: "Expiré",
    paymentStatusRefunded: "Remboursé",
    paymentStatusPartialRefund: "Partiellement remboursé",
    paymentStatusDisputed: "Contesté",
    paymentStatusCancelled: "Annulé",
  },

  es: {
    navLink: "Cloud",
    billingLink: "Historial de pagos",
    pageTitle: "My Spools Cloud",
    pageLead:
      "Copia de seguridad y sync en la nube opcionales para quien no quiere arriesgarse a perder el inventario local. My Spools Local sigue gratis y completo — Cloud no desbloquea funciones extra de inventario.",
    optionalBadge: "Lujo opcional — no obligatorio",
    localTitle: "My Spools Local — gratis",
    localBody:
      "Inventario completo en este dispositivo (IndexedDB): notas, secado, QR/RFID, importar/exportar. No hace falta cuenta. Exporta copias de seguridad con regularidad — borrar datos del navegador puede eliminar el inventario local.",
    cloudTitle: "My Spools Cloud — 19,99 € por 12 meses",
    cloudWhyTitle: "Qué añade Cloud",
    cloudWhyBody:
      "Solo alojamiento en nuestro VPS, sync entre tus dispositivos y copia de seguridad/recuperación en el servidor. Las mismas herramientas de bobinas ya están en Local; Cloud es tranquilidad, no capacidades extra.",
    priceLine: "19,99 € por 12 meses",
    oneTime: "Pago único",
    noAutoRenewal: "Sin renovación automática",
    neverCharge:
      "Nunca te cobraremos de nuevo a menos que elijas comprar otros 12 meses.",
    includesTitle: "Incluido con Cloud",
    includeSync: "Sincronización entre dispositivos",
    includeBackup: "Copias de seguridad en el servidor en nuestro VPS",
    includeRecovery: "Recuperación de cuenta para el inventario Cloud",
    includeExport: "Exportación JSON de Cloud durante el acceso, la gracia y la retención",
    notIncludedTitle: "No incluido",
    notIncludedBody:
      "Ninguna herramienta de inventario extra respecto a Local. Cloud no añade funciones RFID/QR, perfiles más inteligentes ni privilegios de catálogo — solo almacenamiento y sync.",
    statusLabel: "Estado de Cloud",
    statusInactive: "Inactivo",
    statusPending: "Pendiente",
    statusActive: "Activo",
    statusGrace: "Periodo de gracia",
    statusReadOnly: "Solo lectura",
    statusExpired: "Caducado",
    statusRefunded: "Reembolsado",
    statusDisputed: "Disputado",
    statusRevoked: "Revocado",
    validUntil: "Acceso Cloud válido hasta",
    graceUntil: "Periodo de gracia hasta",
    readOnlyFrom: "Solo lectura desde",
    deletionAt: "Eliminación de datos Cloud prevista alrededor de",
    buyCta: "Comprar 12 meses de Cloud — 19,99 €",
    extendCta: "Ampliar Cloud 12 meses — 19,99 €",
    extendHint:
      "Comprar otros 12 meses amplía el acceso desde la fecha de caducidad actual.",
    loginRequired: "Inicia sesión para comprar o gestionar My Spools Cloud.",
    checkoutUnavailable: "El pago aún no está disponible (configuración pendiente).",
    termsLink: "Términos",
    privacyLink: "Privacidad",
    retentionHint:
      "Tras caducar, conservas una ventana de gracia, luego una ventana de exportación solo lectura, y después se elimina el inventario Cloud. My Spools Local sigue siendo plenamente usable.",
    vatUnspecified:
      "La presentación fiscal aún no está configurada por el operador (IVA incluido/excluido).",
    vatNotApplicable: "IVA no aplicable — el precio mostrado es el importe cobrado.",
    successTitle: "Estado del pago",
    verifying:
      "Estamos verificando tu pago con Stripe. El acceso Cloud se activará tras la confirmación del pago.",
    activatedTitle: "My Spools Cloud está activo",
    paidOnce: "Pagado una vez",
    autoRenewalOff: "Renovación automática: Desactivada",
    pendingPayment:
      "Tu pago aún se está procesando. Activaremos Cloud cuando Stripe lo confirme.",
    failedPayment:
      "El pago no se completó. No se añadió acceso Cloud y no se intentará ningún pago futuro.",
    billingTitle: "Historial de facturación Cloud",
    billingLead:
      "Solo pagos únicos. No son facturas recurrentes. OpenFilament no almacena datos de tarjeta.",
    receipt: "Recibo",
    accessPeriod: "Periodo de acceso",
    exportCloud: "Exportar bobinas Cloud (JSON)",
    backToSpools: "Volver a My Spools",
    syncRequiresCloud:
      "La sync Cloud es opcional y requiere un periodo Cloud prepago activo (o de gracia). El inventario local sigue gratis y completo sin Cloud.",
    paymentStatusCreated: "Creado",
    paymentStatusPending: "Pendiente",
    paymentStatusPaid: "Pagado",
    paymentStatusFailed: "Fallido",
    paymentStatusExpired: "Caducado",
    paymentStatusRefunded: "Reembolsado",
    paymentStatusPartialRefund: "Reembolsado parcialmente",
    paymentStatusDisputed: "Disputado",
    paymentStatusCancelled: "Cancelado",
  },

  pt: {
    navLink: "Cloud",
    billingLink: "Histórico de pagamentos",
    pageTitle: "My Spools Cloud",
    pageLead:
      "Cópia de segurança e sync na cloud opcionais para quem não quer arriscar perder o inventário local. My Spools Local continua gratuito e completo — a Cloud não desbloqueia funcionalidades extra de inventário.",
    optionalBadge: "Luxo opcional — não obrigatório",
    localTitle: "My Spools Local — gratuito",
    localBody:
      "Inventário completo neste dispositivo (IndexedDB): notas, secagem, QR/RFID, importar/exportar. Sem conta necessária. Exporte cópias de segurança regularmente — limpar os dados do browser pode remover o inventário local.",
    cloudTitle: "My Spools Cloud — 19,99 € por 12 meses",
    cloudWhyTitle: "O que a Cloud acrescenta",
    cloudWhyBody:
      "Apenas alojamento no nosso VPS, sync entre os seus dispositivos e cópia de segurança/recuperação no servidor. As mesmas ferramentas de bobinas já existem no Local; a Cloud é para tranquilidade, não para capacidades extra.",
    priceLine: "19,99 € por 12 meses",
    oneTime: "Pagamento único",
    noAutoRenewal: "Sem renovação automática",
    neverCharge:
      "Nunca voltaremos a cobrar, a menos que escolha comprar outros 12 meses.",
    includesTitle: "Incluído com a Cloud",
    includeSync: "Sincronização entre dispositivos",
    includeBackup: "Cópias de segurança no servidor no nosso VPS",
    includeRecovery: "Recuperação de conta para o inventário Cloud",
    includeExport: "Exportação JSON da Cloud durante o acesso, a graça e a retenção",
    notIncludedTitle: "Não incluído",
    notIncludedBody:
      "Sem ferramentas de inventário além do Local. A Cloud não acrescenta funções RFID/QR, perfis mais inteligentes nem privilégios de catálogo — apenas armazenamento e sync.",
    statusLabel: "Estado da Cloud",
    statusInactive: "Inativo",
    statusPending: "Pendente",
    statusActive: "Ativo",
    statusGrace: "Período de graça",
    statusReadOnly: "Só leitura",
    statusExpired: "Expirado",
    statusRefunded: "Reembolsado",
    statusDisputed: "Contestado",
    statusRevoked: "Revogado",
    validUntil: "Acesso Cloud válido até",
    graceUntil: "Período de graça até",
    readOnlyFrom: "Só leitura a partir de",
    deletionAt: "Eliminação dos dados Cloud prevista por volta de",
    buyCta: "Comprar 12 meses de Cloud — 19,99 €",
    extendCta: "Prolongar Cloud por 12 meses — 19,99 €",
    extendHint:
      "Comprar outros 12 meses prolonga o acesso a partir da data de expiração atual.",
    loginRequired: "Inicie sessão para comprar ou gerir My Spools Cloud.",
    checkoutUnavailable: "O pagamento ainda não está disponível (configuração pendente).",
    termsLink: "Termos",
    privacyLink: "Privacidade",
    retentionHint:
      "Após a expiração, mantém uma janela de graça, depois uma janela de exportação só de leitura e, por fim, a eliminação do inventário Cloud. My Spools Local continua plenamente utilizável.",
    vatUnspecified:
      "A apresentação fiscal ainda não foi configurada pelo operador (IVA incluído/excluído).",
    vatNotApplicable: "IVA não aplicável — o preço apresentado é o montante cobrado.",
    successTitle: "Estado do pagamento",
    verifying:
      "Estamos a verificar o seu pagamento com o Stripe. O acesso Cloud ativar-se-á após a confirmação do pagamento.",
    activatedTitle: "My Spools Cloud está ativo",
    paidOnce: "Pago uma vez",
    autoRenewalOff: "Renovação automática: Desligada",
    pendingPayment:
      "O seu pagamento ainda está a ser processado. Ativaremos a Cloud após a confirmação do Stripe.",
    failedPayment:
      "O pagamento não foi concluído. Não foi adicionado acesso Cloud e não será tentado nenhum pagamento futuro.",
    billingTitle: "Histórico de faturação Cloud",
    billingLead:
      "Apenas pagamentos únicos. Não são faturas recorrentes. A OpenFilament não armazena dados de cartão.",
    receipt: "Recibo",
    accessPeriod: "Período de acesso",
    exportCloud: "Exportar bobinas Cloud (JSON)",
    backToSpools: "Voltar a My Spools",
    syncRequiresCloud:
      "A sync Cloud é opcional e requer um período Cloud pré-pago ativo (ou de graça). O inventário local continua gratuito e completo sem Cloud.",
    paymentStatusCreated: "Criado",
    paymentStatusPending: "Pendente",
    paymentStatusPaid: "Pago",
    paymentStatusFailed: "Falhado",
    paymentStatusExpired: "Expirado",
    paymentStatusRefunded: "Reembolsado",
    paymentStatusPartialRefund: "Parcialmente reembolsado",
    paymentStatusDisputed: "Contestado",
    paymentStatusCancelled: "Cancelado",
  },

  ru: {
    navLink: "Cloud",
    billingLink: "История платежей",
    pageTitle: "My Spools Cloud",
    pageLead:
      "Опциональный облачный бэкап и синхронизация для тех, кто не хочет рисковать потерей локального инвентаря. My Spools Local остаётся бесплатным и полным — Cloud не открывает дополнительных функций инвентаря.",
    optionalBadge: "Опциональная роскошь — не обязательно",
    localTitle: "My Spools Local — бесплатно",
    localBody:
      "Полный инвентарь на этом устройстве (IndexedDB): заметки, сушка, QR/RFID, импорт/экспорт. Аккаунт не нужен. Регулярно экспортируйте бэкапы — очистка данных браузера может удалить локальный инвентарь.",
    cloudTitle: "My Spools Cloud — €19,99 на 12 месяцев",
    cloudWhyTitle: "Что даёт Cloud",
    cloudWhyBody:
      "Только хостинг на нашем VPS, синхронизация между вашими устройствами и серверный бэкап/восстановление. Те же инструменты для катушек уже есть в Local; Cloud — для спокойствия, а не для дополнительных возможностей.",
    priceLine: "€19,99 на 12 месяцев",
    oneTime: "Разовый платёж",
    noAutoRenewal: "Без автоматического продления",
    neverCharge:
      "Мы больше никогда не спишем средства, если вы сами не купите ещё 12 месяцев.",
    includesTitle: "Входит в Cloud",
    includeSync: "Синхронизация между устройствами",
    includeBackup: "Серверные бэкапы на нашем VPS",
    includeRecovery: "Восстановление аккаунта для инвентаря Cloud",
    includeExport: "Экспорт Cloud в JSON в периоды доступа, льготного срока и хранения",
    notIncludedTitle: "Не входит",
    notIncludedBody:
      "Никаких дополнительных инструментов инвентаря сверх Local. Cloud не добавляет функции RFID/QR, умные профили или права каталога — только хранение и синхронизация.",
    statusLabel: "Статус Cloud",
    statusInactive: "Неактивен",
    statusPending: "Ожидает",
    statusActive: "Активен",
    statusGrace: "Льготный период",
    statusReadOnly: "Только чтение",
    statusExpired: "Истёк",
    statusRefunded: "Возвращён",
    statusDisputed: "Оспорен",
    statusRevoked: "Отозван",
    validUntil: "Доступ Cloud действителен до",
    graceUntil: "Льготный период до",
    readOnlyFrom: "Только чтение с",
    deletionAt: "Удаление данных Cloud запланировано около",
    buyCta: "Купить 12 месяцев Cloud — €19,99",
    extendCta: "Продлить Cloud на 12 месяцев — €19,99",
    extendHint:
      "Покупка ещё 12 месяцев продлевает доступ с текущей даты окончания.",
    loginRequired: "Войдите, чтобы купить или управлять My Spools Cloud.",
    checkoutUnavailable: "Оплата пока недоступна (ожидается настройка).",
    termsLink: "Условия",
    privacyLink: "Конфиденциальность",
    retentionHint:
      "После окончания срока у вас остаётся льготное окно, затем окно экспорта только для чтения, затем удаление инвентаря Cloud. My Spools Local остаётся полностью доступным.",
    vatUnspecified:
      "Отображение налогов ещё не настроено оператором (НДС включён/исключён).",
    vatNotApplicable: "НДС не применяется — указанная цена равна сумме к оплате.",
    successTitle: "Статус платежа",
    verifying:
      "Мы проверяем ваш платёж в Stripe. Доступ Cloud активируется после подтверждения оплаты.",
    activatedTitle: "My Spools Cloud активен",
    paidOnce: "Оплачено один раз",
    autoRenewalOff: "Автопродление: Выкл.",
    pendingPayment:
      "Ваш платёж ещё обрабатывается. Мы активируем Cloud после подтверждения Stripe.",
    failedPayment:
      "Платёж не завершён. Доступ Cloud не добавлен, повторных списаний не будет.",
    billingTitle: "История платежей Cloud",
    billingLead:
      "Только разовые платежи. Это не регулярные счета. OpenFilament не хранит данные карт.",
    receipt: "Квитанция",
    accessPeriod: "Период доступа",
    exportCloud: "Экспорт катушек Cloud (JSON)",
    backToSpools: "Назад к My Spools",
    syncRequiresCloud:
      "Синхронизация Cloud опциональна и требует активного предоплаченного периода Cloud (или льготного). Локальный инвентарь остаётся бесплатным и полным без Cloud.",
    paymentStatusCreated: "Создан",
    paymentStatusPending: "Ожидает",
    paymentStatusPaid: "Оплачен",
    paymentStatusFailed: "Неудачный",
    paymentStatusExpired: "Истёк",
    paymentStatusRefunded: "Возвращён",
    paymentStatusPartialRefund: "Частично возвращён",
    paymentStatusDisputed: "Оспорен",
    paymentStatusCancelled: "Отменён",
  },

  uk: {
    navLink: "Cloud",
    billingLink: "Історія платежів",
    pageTitle: "My Spools Cloud",
    pageLead:
      "Необов’язковий хмарний бекап і синхронізація для тих, хто не хоче ризикувати втратою локального інвентарю. My Spools Local лишається безкоштовним і повним — Cloud не відкриває додаткових функцій інвентарю.",
    optionalBadge: "Необов’язкова розкіш — не потрібно",
    localTitle: "My Spools Local — безкоштовно",
    localBody:
      "Повний інвентар на цьому пристрої (IndexedDB): нотатки, сушіння, QR/RFID, імпорт/експорт. Обліковий запис не потрібен. Регулярно експортуйте бекапи — очищення даних браузера може видалити локальний інвентар.",
    cloudTitle: "My Spools Cloud — €19,99 на 12 місяців",
    cloudWhyTitle: "Що додає Cloud",
    cloudWhyBody:
      "Лише хостинг на нашому VPS, синхронізація між вашими пристроями та серверний бекап/відновлення. Ті самі інструменти для котушок уже є в Local; Cloud — для спокою, а не для додаткових можливостей.",
    priceLine: "€19,99 на 12 місяців",
    oneTime: "Одноразовий платіж",
    noAutoRenewal: "Без автоматичного продовження",
    neverCharge:
      "Ми більше ніколи не спишемо кошти, якщо ви самі не купите ще 12 місяців.",
    includesTitle: "Входить у Cloud",
    includeSync: "Синхронізація між пристроями",
    includeBackup: "Серверні бекапи на нашому VPS",
    includeRecovery: "Відновлення облікового запису для інвентарю Cloud",
    includeExport: "Експорт Cloud у JSON під час доступу, пільгового строку та зберігання",
    notIncludedTitle: "Не входить",
    notIncludedBody:
      "Жодних додаткових інструментів інвентарю понад Local. Cloud не додає функції RFID/QR, розумніші профілі чи права каталогу — лише зберігання та синхронізація.",
    statusLabel: "Статус Cloud",
    statusInactive: "Неактивний",
    statusPending: "Очікує",
    statusActive: "Активний",
    statusGrace: "Пільговий період",
    statusReadOnly: "Лише читання",
    statusExpired: "Закінчився",
    statusRefunded: "Повернено",
    statusDisputed: "Оскаржено",
    statusRevoked: "Відкликано",
    validUntil: "Доступ Cloud дійсний до",
    graceUntil: "Пільговий період до",
    readOnlyFrom: "Лише читання з",
    deletionAt: "Видалення даних Cloud заплановано близько",
    buyCta: "Купити 12 місяців Cloud — €19,99",
    extendCta: "Продовжити Cloud на 12 місяців — €19,99",
    extendHint:
      "Купівля ще 12 місяців продовжує доступ від поточної дати закінчення.",
    loginRequired: "Увійдіть, щоб купити або керувати My Spools Cloud.",
    checkoutUnavailable: "Оплата ще недоступна (очікується налаштування).",
    termsLink: "Умови",
    privacyLink: "Конфіденційність",
    retentionHint:
      "Після закінчення строку у вас лишається пільгове вікно, потім вікно експорту лише для читання, далі — видалення інвентарю Cloud. My Spools Local лишається повністю доступним.",
    vatUnspecified:
      "Відображення податків ще не налаштоване оператором (ПДВ включено/виключено).",
    vatNotApplicable: "ПДВ не застосовується — зазначена ціна дорівнює сумі до сплати.",
    successTitle: "Статус платежу",
    verifying:
      "Ми перевіряємо ваш платіж у Stripe. Доступ Cloud активується після підтвердження оплати.",
    activatedTitle: "My Spools Cloud активний",
    paidOnce: "Сплачено один раз",
    autoRenewalOff: "Автопродовження: Вимк.",
    pendingPayment:
      "Ваш платіж ще обробляється. Ми активуємо Cloud після підтвердження Stripe.",
    failedPayment:
      "Платіж не завершено. Доступ Cloud не додано, повторних списань не буде.",
    billingTitle: "Історія платежів Cloud",
    billingLead:
      "Лише одноразові платежі. Це не регулярні рахунки. OpenFilament не зберігає дані карток.",
    receipt: "Квитанція",
    accessPeriod: "Період доступу",
    exportCloud: "Експорт котушок Cloud (JSON)",
    backToSpools: "Назад до My Spools",
    syncRequiresCloud:
      "Синхронізація Cloud необов’язкова й потребує активного передплаченого періоду Cloud (або пільгового). Локальний інвентар лишається безкоштовним і повним без Cloud.",
    paymentStatusCreated: "Створено",
    paymentStatusPending: "Очікує",
    paymentStatusPaid: "Сплачено",
    paymentStatusFailed: "Невдалий",
    paymentStatusExpired: "Закінчився",
    paymentStatusRefunded: "Повернено",
    paymentStatusPartialRefund: "Частково повернено",
    paymentStatusDisputed: "Оскаржено",
    paymentStatusCancelled: "Скасовано",
  },

  zh: {
    navLink: "Cloud",
    billingLink: "账单记录",
    pageTitle: "My Spools Cloud",
    pageLead:
      "可选的云端备份与同步，适合不想冒丢失本地库存风险的用户。My Spools Local 始终免费且功能完整 — Cloud 不会解锁额外的库存功能。",
    optionalBadge: "可选奢侈项 — 非必需",
    localTitle: "My Spools Local — 免费",
    localBody:
      "本设备上的完整库存（IndexedDB）：备注、烘干、QR/RFID、导入/导出。无需账户。请定期导出备份 — 清除浏览器数据可能会删除本地库存。",
    cloudTitle: "My Spools Cloud — €19.99 / 12 个月",
    cloudWhyTitle: "Cloud 增加了什么",
    cloudWhyBody:
      "仅包括我们 VPS 上的托管、跨设备同步，以及服务器端备份/恢复。相同的线轴工具已在 Local 中提供；Cloud 是为安心，而非额外能力。",
    priceLine: "€19.99 / 12 个月",
    oneTime: "一次性付款",
    noAutoRenewal: "无自动续费",
    neverCharge: "除非您自行再购买 12 个月，否则我们绝不会再次扣款。",
    includesTitle: "Cloud 包含",
    includeSync: "跨设备同步",
    includeBackup: "我们 VPS 上的服务器端备份",
    includeRecovery: "Cloud 库存的账户恢复",
    includeExport: "在访问期、宽限期与保留期内可导出 Cloud JSON",
    notIncludedTitle: "不包含",
    notIncludedBody:
      "相对 Local 无额外库存工具。Cloud 不增加 RFID/QR 功能、更智能的配置文件或目录权限 — 仅存储与同步。",
    statusLabel: "Cloud 状态",
    statusInactive: "未激活",
    statusPending: "待处理",
    statusActive: "已激活",
    statusGrace: "宽限期",
    statusReadOnly: "只读",
    statusExpired: "已过期",
    statusRefunded: "已退款",
    statusDisputed: "有争议",
    statusRevoked: "已撤销",
    validUntil: "Cloud 访问有效期至",
    graceUntil: "宽限期至",
    readOnlyFrom: "只读起始于",
    deletionAt: "Cloud 数据计划删除约在",
    buyCta: "购买 12 个月 Cloud — €19.99",
    extendCta: "将 Cloud 延长 12 个月 — €19.99",
    extendHint: "再购买 12 个月会从当前到期日起延长访问。",
    loginRequired: "请登录以购买或管理 My Spools Cloud。",
    checkoutUnavailable: "结账尚不可用（配置待完成）。",
    termsLink: "条款",
    privacyLink: "隐私",
    retentionHint:
      "到期后您仍有宽限期，然后是只读导出窗口，之后删除 Cloud 库存。My Spools Local 仍可完全使用。",
    vatUnspecified: "运营方尚未配置税费展示（含税/不含税）。",
    vatNotApplicable: "不适用增值税 — 所示价格即为实收金额。",
    successTitle: "付款状态",
    verifying: "我们正在通过 Stripe 核实您的付款。付款确认后将激活 Cloud 访问。",
    activatedTitle: "My Spools Cloud 已激活",
    paidOnce: "已一次性付款",
    autoRenewalOff: "自动续费：关闭",
    pendingPayment: "您的付款仍在处理中。Stripe 确认后我们将激活 Cloud。",
    failedPayment: "付款未完成。未添加 Cloud 访问，也不会尝试后续扣款。",
    billingTitle: "Cloud 账单记录",
    billingLead:
      "仅一次性付款。这些不是循环账单。OpenFilament 不存储银行卡信息。",
    receipt: "收据",
    accessPeriod: "访问期限",
    exportCloud: "导出 Cloud 线轴（JSON）",
    backToSpools: "返回 My Spools",
    syncRequiresCloud:
      "Cloud 同步为可选，需要有效的预付 Cloud 期限（或宽限期）。本地库存无需 Cloud 仍免费且完整。",
    paymentStatusCreated: "已创建",
    paymentStatusPending: "待处理",
    paymentStatusPaid: "已付款",
    paymentStatusFailed: "失败",
    paymentStatusExpired: "已过期",
    paymentStatusRefunded: "已退款",
    paymentStatusPartialRefund: "部分退款",
    paymentStatusDisputed: "有争议",
    paymentStatusCancelled: "已取消",
  },
};

const EN_KEYS = Object.keys(
  /** @type {Record<string, string>} */ (
    // Mirror prod-en cloudEn key order for stable diffs
    {
      navLink: 1,
      billingLink: 1,
      pageTitle: 1,
      pageLead: 1,
      optionalBadge: 1,
      localTitle: 1,
      localBody: 1,
      cloudTitle: 1,
      cloudWhyTitle: 1,
      cloudWhyBody: 1,
      priceLine: 1,
      oneTime: 1,
      noAutoRenewal: 1,
      neverCharge: 1,
      includesTitle: 1,
      includeSync: 1,
      includeBackup: 1,
      includeRecovery: 1,
      includeExport: 1,
      notIncludedTitle: 1,
      notIncludedBody: 1,
      statusLabel: 1,
      statusInactive: 1,
      statusPending: 1,
      statusActive: 1,
      statusGrace: 1,
      statusReadOnly: 1,
      statusExpired: 1,
      statusRefunded: 1,
      statusDisputed: 1,
      statusRevoked: 1,
      validUntil: 1,
      graceUntil: 1,
      readOnlyFrom: 1,
      deletionAt: 1,
      buyCta: 1,
      extendCta: 1,
      extendHint: 1,
      loginRequired: 1,
      checkoutUnavailable: 1,
      termsLink: 1,
      privacyLink: 1,
      retentionHint: 1,
      vatUnspecified: 1,
      vatNotApplicable: 1,
      successTitle: 1,
      verifying: 1,
      activatedTitle: 1,
      paidOnce: 1,
      autoRenewalOff: 1,
      pendingPayment: 1,
      failedPayment: 1,
      billingTitle: 1,
      billingLead: 1,
      receipt: 1,
      accessPeriod: 1,
      exportCloud: 1,
      backToSpools: 1,
      syncRequiresCloud: 1,
      paymentStatusCreated: 1,
      paymentStatusPending: 1,
      paymentStatusPaid: 1,
      paymentStatusFailed: 1,
      paymentStatusExpired: 1,
      paymentStatusRefunded: 1,
      paymentStatusPartialRefund: 1,
      paymentStatusDisputed: 1,
      paymentStatusCancelled: 1,
    }
  ),
);

/**
 * @param {string} value
 * @returns {string}
 */
function quoteTs(value) {
  if (!value.includes('"') && !value.includes("\\") && !value.includes("\n")) {
    return `"${value}"`;
  }
  return JSON.stringify(value);
}

/**
 * @param {Record<string, string>} cloud
 * @returns {string}
 */
function formatCloudObject(cloud) {
  const missing = EN_KEYS.filter((k) => !(k in cloud));
  const extra = Object.keys(cloud).filter((k) => !EN_KEYS.includes(k));
  if (missing.length || extra.length) {
    throw new Error(
      `Key mismatch: missing=${missing.join(",") || "—"} extra=${extra.join(",") || "—"}`,
    );
  }

  const lines = ["  cloud: {"];
  for (const key of EN_KEYS) {
    const value = cloud[key];
    const quoted = quoteTs(value);
    if (value.length > 72 || value.includes("\n")) {
      lines.push(`    ${key}:`);
      lines.push(`      ${quoted},`);
    } else {
      lines.push(`    ${key}: ${quoted},`);
    }
  }
  lines.push("  },");
  return lines.join("\n");
}

/**
 * Remove cloudEn from the prod-en import when it is no longer referenced.
 * @param {string} source
 * @returns {string}
 */
function stripUnusedCloudEnImport(source) {
  const withoutImport = source.replace(
    /import\s*\{[\s\S]*?\}\s*from\s*["']\.\/prod-en["']\s*;?/,
    "",
  );
  if (/\bcloudEn\b/.test(withoutImport)) {
    return source;
  }
  return source.replace(
    /import\s*\{([\s\S]*?)\}\s*from\s*(["']\.\/prod-en["'])\s*;?/,
    (_m, body, from) => {
      const names = body
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && s !== "cloudEn");
      return `import {\n  ${names.join(",\n  ")},\n} from ${from};`;
    },
  );
}

function main() {
  const locales = Object.keys(clouds);
  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.ts`);
    let source = fs.readFileSync(filePath, "utf8");
    const block = formatCloudObject(clouds[locale]);
    if (source.includes("cloud: cloudEn,")) {
      source = source.replace(/ {2}cloud: cloudEn,/, block);
    } else if (/ {2}cloud: \{[\s\S]*?\n {2}\},/.test(source)) {
      source = source.replace(/ {2}cloud: \{[\s\S]*?\n {2}\},/, block);
    } else {
      throw new Error(`${locale}.ts: no cloud block to replace`);
    }
    source = stripUnusedCloudEnImport(source);
    fs.writeFileSync(filePath, source, "utf8");
    console.log(`updated ${locale}.ts`);
  }

  const enPath = path.join(messagesDir, "en.ts");
  const enSource = fs.readFileSync(enPath, "utf8");
  if (!enSource.includes("cloud: cloudEn,")) {
    throw new Error("en.ts must keep `cloud: cloudEn,`");
  }
  console.log("en.ts still uses cloud: cloudEn (ok)");
}

main();
