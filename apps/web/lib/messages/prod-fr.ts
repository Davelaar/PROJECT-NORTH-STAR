/** Shared French copy. Address: tu. */
export const consentFr = {
  bannerAria: "Consentement cookies",
  bannerText:
    "Nous utilisons un stockage nécessaire au fonctionnement du site. Les analytics optionnels aident à améliorer OpenFilament. Tu peux refuser les cookies non essentiels sans perdre la recherche, My Spools, les téléchargements, QR ou RFID.",
  acceptAll: "Tout accepter",
  rejectNonEssential: "Refuser le non essentiel",
  manage: "Gérer les préférences",
  cookiePolicy: "Politique cookies",
  privacyPolicy: "Politique de confidentialité",
  prefsTitle: "Préférences cookies",
  prefsLead:
    "Le stockage nécessaire reste activé. Analytics et marketing restent désactivés sauf si tu les actives.",
  necessary: "Nécessaire",
  necessaryHelp: "Session, sécurité, choix de consentement, langue, My Spools local.",
  preferences: "Préférences",
  preferencesHelp: "Mémoriser les préférences d’interface non essentielles.",
  analytics: "Analytics",
  analyticsHelp: "Google Analytics 4 respectueux de la vie privée, seulement après consentement.",
  marketing: "Marketing",
  marketingHelp: "Non utilisé. Reste désactivé.",
  savePrefs: "Enregistrer les préférences",
  cancel: "Annuler",
};

export const footerFr = {
  navAria: "Site et mentions légales",
  privacy: "Confidentialité",
  cookies: "Cookies",
  cookieSettings: "Paramètres cookies",
  terms: "Conditions",
  security: "Sécurité",
  trust: "Trust center",
  mySpools: "My Spools",
  support: "Assistance",
  tagline: "OpenFilament — intelligence filament, d’abord dans le navigateur.",
  legalPlaceholderWarn:
    "Les informations légales de l’exploitant sont encore des placeholders — voir docs/PRODUCTION_LAUNCH_CHECKLIST.md avant le lancement.",
};

export const spoolsFr = {
  heading: "My Spools",
  lead:
    "Suis tes bobines physiques sur cet appareil. La sync Cloud est optionnelle et ne démarre jamais juste parce que tu te connectes.",
  localMode: "Local uniquement (ce navigateur)",
  localWarn:
    "Les données locales peuvent être perdues si tu effaces les données du site ou changes d’appareil. Exporte régulièrement une sauvegarde.",
  cloudMode: "Sync Cloud (compte)",
  create: "Ajouter une bobine",
  export: "Exporter JSON",
  import: "Importer JSON",
  clearAll: "Effacer toutes les données locales",
  clearConfirm:
    "Supprimer tous les enregistrements locaux de bobines sur cet appareil ? Irréversible.",
  syncPreview: "Aperçu de la sync",
  syncConfirm: "Envoyer les bobines sélectionnées",
  syncKeepLocal: "Garder la copie locale après sync",
  syncRemoveLocal: "Supprimer la copie locale après sync",
  empty: "Aucune bobine pour l’instant. Ajoute ton premier rouleau.",
  status: "Statut",
  weight: "Poids actuel (g)",
  tare: "Tare / bobine vide (g)",
  initial: "Net initial (g)",
  remaining: "Restant %",
  location: "Lieu de stockage",
  notes: "Notes (privées)",
  batch: "Lot / batch",
  purchase: "Date d’achat",
  opened: "Date d’ouverture",
  archive: "Archiver",
  restore: "Restaurer",
  delete: "Supprimer",
  duplicate: "Dupliquer pour un nouveau rouleau",
  drying: "Ajouter un séchage",
  qr: "Associer une identité QR",
  rfid: "Associer une identité RFID",
  save: "Enregistrer la bobine",
  syncNeverAuto:
    "La connexion n’envoie pas les bobines locales. Tu dois confirmer la sync explicitement.",
  conflictPolicy:
    "Les conflits utilisent last-write-wins par version de sync. La réimportation ignore les anciens doublons.",
  wizardLead:
    "Choisis la marque et le matériau dans le catalogue, puis le produit et la couleur. Cherche d’abord ; « Autre » seulement si l’élément manque vraiment.",
  catalogRequired:
    "Sélectionne marque, matériau, produit et couleur dans le catalogue avant d’enregistrer.",
  existingRollWarn:
    "Tu as déjà {count} rouleau(x) de cette couleur dans My Spools. Enregistre seulement s’il s’agit d’une autre bobine physique.",
  editSpool: "Modifier la bobine",
  cancel: "Annuler",
  showArchived: "Afficher les archives",
  usageLabel: "Utilisé après impression (g)",
  usagePlaceholder: "ex. 42",
  usageSubmit: "Déduire l’usage",
  usageAddSubmit: "Ajouter des grammes",
  usageSaved: "Utilisation enregistrée et quantité restante mise à jour.",
  usageError: "Saisis une quantité positive de grammes utilisés.",
  usageNeedsWeights: "Ajoute le poids initial et actuel pour suivre l’usage d’impression.",
};

export const accountFr = {
  heading: "Compte",
  sessions: "Sessions actives",
  revokeSession: "Révoquer",
  revokeOthers: "Révoquer les autres sessions",
  exportData: "Exporter mes données",
  deleteAccount: "Supprimer mon compte",
  deleteWarn:
    "Cela supprime définitivement les bobines privées et les sessions. Les contributions publiques peuvent être anonymisées plutôt que retirées.",
  deleteConfirmLabel: "Tape DELETE pour confirmer",
  privacyPrefs: "Préférences de confidentialité",
  register: "Créer un compte",
  logout: "Se déconnecter",
};

export const legalPagesFr = {
  privacyTitle: "Politique de confidentialité",
  privacyMetaDescription: "Comment OpenFilament traite l’e-mail de compte, les paiements Stripe, My Spools et les cookies.",
  cookiesTitle: "Politique cookies",
  termsTitle: "Conditions d’utilisation",
  termsMetaDescription:
    "Conditions OpenFilament : service tel quel, pas de remboursement Cloud, pas de renouvellement automatique, fenêtre d’export Cloud de 30 jours après expiration.",
  securityTitle: "Sécurité",
  trustTitle: "Trust center",
  placeholderNotice: "Cette page contient des placeholders clairement marqués. Ils bloquent la mise en production jusqu’à remplacement.",
  effective: "Date d’entrée en vigueur",
  operator: "Opérateur",
  privacyContact: "Contact confidentialité",
  hosting: "Hébergement",
  contact: "Contact",
  openSourceRepository: "Dépôt open source",
  cookieSettingsHint: "Tu peux modifier les cookies d’analytics et de préférences à tout moment via Paramètres cookies. Version du consentement :",
  sections: {
    privacy: [
      {
        heading: "Comptes — ce que nous stockons",
        paragraphs: [
          "Créer un compte ne demande qu’une adresse e-mail et un mot de passe. Nous conservons cet e-mail pour te connecter, envoyer des reçus de paiement et réinitialiser ton mot de passe. Nous ne demandons pas ton vrai nom ; un nom d’utilisateur interne est généré automatiquement. Les mots de passe sont stockés en hachages scrypt — jamais en clair.",
          "Nous n’utilisons pas ton e-mail pour le marketing. La récupération de compte et les messages de service essentiels (par ex. paiement ou sécurité) sont les usages prévus.",
        ],
      },
      {
        heading: "Paiements (Stripe)",
        paragraphs: [
          "Les achats optionnels de My Spools Cloud passent par Stripe Checkout. Tu saisis carte ou portefeuille sur les pages de paiement hébergées par Stripe. Stripe est le processeur de paiement : OpenFilament ne reçoit ni ne stocke jamais ton numéro de carte complet, CVC ou secrets de portefeuille équivalents.",
          "De notre côté, nous ne gardons que ce qui est nécessaire pour l’accès Cloud et la comptabilité : montant, devise, statut de paiement, identifiants de session/paiement Stripe, horodatages et ta période d’entitlement Cloud. Stripe traite les données de paiement selon ses propres conditions et politique de confidentialité.",
          "L’accès Cloud est une période prépayée unique (actuellement 12 mois). Pas de renouvellement automatique ni de débit hors session, sauf si tu lances toi-même un nouveau Checkout.",
        ],
      },
      {
        heading: "Ce que nous traitons aussi",
        items: [
          "Sessions d’authentification (cookies httpOnly) et journaux de sécurité.",
          "Inventaire My Spools Cloud, notes privées et identités QR/RFID uniquement lorsque tu synchronises explicitement vers le Cloud.",
          "My Spools local reste dans ton navigateur jusqu’à sync ou export — la connexion n’envoie pas les bobines locales toute seule.",
          "Contributions communautaires publiques que tu choisis de publier (calibrations, tips catalogue).",
          "Préférences de consentement et Google Analytics 4 optionnel uniquement après opt-in.",
        ],
      },
      {
        heading: "Bases légales",
        items: [
          "Contrat / service demandé pour comptes, Cloud, exports et téléchargements.",
          "Intérêt légitime pour la sécurité, la prévention des abus et l’intégrité du service.",
          "Consentement pour cookies/stockage analytics — révocable via Paramètres cookies sur ce site.",
          "Obligation légale lorsque des enregistrements de sécurité ou comptables doivent être conservés.",
        ],
      },
      {
        heading: "My Spools",
        paragraphs: [
          "My Spools local est gratuit et reste sur ton appareil. Effacer les données du site, perdre l’appareil ou changer de navigateur peut le supprimer.",
          "My Spools Cloud est un hébergement payant optionnel pour la sync d’inventaire et la sauvegarde. La résolution QR publique n’expose pas notes, lieux ni identifiants de compte.",
        ],
      },
      {
        heading: "Tes droits et conservation",
        paragraphs: [
          "Tu peux demander accès, rectification, suppression, limitation, portabilité et opposition, et retirer ton consentement. Utilise l’export/suppression de compte, Paramètres cookies ou e-mail le contact confidentialité. Tu peux déposer plainte auprès de l’autorité de contrôle indiquée pour ce site.",
          "Les bobines Cloud soft-deleted sont purgées selon un calendrier. Les enregistrements de paiement et de sécurité peuvent être conservés plus longtemps si la comptabilité ou la prévention de la fraude l’exigent. Les sauvegardes peuvent retenir des données supprimées jusqu’à expiration de la sauvegarde.",
        ],
      },
      {
        heading: "Transferts internationaux et modifications",
        paragraphs: [
          "L’hébergement de l’application et de la base est sur notre VPS UE comme indiqué ci-dessus. Si tu actives l’analytics, Google peut traiter des données hors EEE sous ses garanties. Stripe peut traiter des données de paiement dans les régions où Stripe opère. Les changements matériels de politique mettent à jour la version de consentement et peuvent redemander le consentement.",
        ],
      },
    ],
    terms: [
      {
        heading: "Service communautaire tel quel",
        paragraphs: [
          "OpenFilament est fourni tel quel et selon disponibilité. Les données du catalogue, les profils de démarrage et les calibrations communautaires ne garantissent pas la sécurité d’impression. Tu restes responsable de valider les réglages sur ton imprimante et des résultats d’impression.",
          "Nous ne garantissons pas une disponibilité ininterrompue, un fonctionnement sans erreur ni une aptitude à un usage particulier, dans la mesure permise par la loi. My Spools Cloud est proposé en bêta.",
        ],
      },
      {
        heading: "Comptes et usage gratuit",
        paragraphs: [
          "La navigation, la recherche, les téléchargements de profils et My Spools Local sont gratuits. Un compte (e-mail et mot de passe) est optionnel pour l’usage gratuit et requis uniquement si tu achètes My Spools Cloud, afin que nous puissions rattacher l’inventaire et récupérer l’accès.",
        ],
      },
      {
        heading: "My Spools Cloud — paiement, pas de renouvellement, pas de remboursement",
        paragraphs: [
          "Cloud est un service numérique prépayé optionnel : actuellement 19,99 € pour 12 mois, payé une fois via Stripe Checkout. Pas de renouvellement automatique ni de débit hors session. L’accès se termine à la fin de la période payée, sauf si tu lances toi-même un nouveau Checkout.",
          "Tous les achats Cloud sont définitifs : pas de remboursement, pas de rétrofacturation pour simple changement d’avis, ni de remboursement partiel pour des mois non utilisés. Stripe traite le paiement ; OpenFilament ne stocke pas les numéros de carte.",
          "Cloud n’ajoute que la synchronisation des bobines entre appareils et le stock/sauvegarde côté serveur. Il ne débloque pas de fonctions catalogue, profil ou RFID/QR supplémentaires au-delà de Local.",
        ],
      },
      {
        heading: "Après expiration de Cloud — 30 jours pour exporter",
        paragraphs: [
          "Lorsque ta période Cloud se termine, nous conservons ton inventaire Cloud 30 jours de plus. Pendant ces 30 jours, tu peux encore exporter tes données Cloud (JSON). La sync et l’accès en écriture après expiration suivent les règles du produit (lecture seule / fenêtre d’export).",
          "Après ces 30 jours, l’inventaire Cloud peut être définitivement supprimé de nos serveurs. My Spools local dans ton navigateur n’est pas affecté et reste gratuit. Les enregistrements de paiement et de sécurité peuvent être conservés plus longtemps si la comptabilité ou la prévention de la fraude l’exigent.",
        ],
      },
      {
        heading: "Contributions",
        paragraphs: [
          "En soumettant des calibrations, tu acceptes les conditions de contribution affichées au moment de l’envoi et licences la contribution pour affichage public sous les conditions ouvertes du projet. Les e-mails des contributeurs restent privés.",
        ],
      },
      {
        heading: "Responsabilité",
        paragraphs: [
          "Dans la mesure permise par le droit applicable, OpenFilament et son opérateur ne sont pas responsables des dommages indirects, accessoires ou consécutifs découlant de l’usage des outils gratuits ou du service Cloud en bêta. Les droits de consommation impératifs qui ne peuvent être écartés en droit néerlandais ou de l’UE restent inchangés.",
        ],
      },
    ],
    cookies: [
      {
        heading: "Stockage nécessaire",
        paragraphs: [
          "Requis pour le fonctionnement du site : langue (of_locale), choix de consentement (of_consent), session connectée (of_session, httpOnly), protection CSRF (of_csrf) et données My Spools locales dans IndexedDB. Un service worker / Cache Storage peut garder le shell PWA hors ligne. Ce n’est pas utilisé pour la publicité.",
        ],
      },
      {
        heading: "Analytics optionnel",
        paragraphs: [
          "Seulement si tu acceptes l’analytics, nous chargeons Google Analytics 4 respectueux de la vie privée, qui peut poser des cookies first-party comme _ga. Refuser l’analytics laisse recherche, My Spools, comptes, QR, RFID et téléchargements pleinement utilisables. Aucun cookie marketing n’est utilisé.",
        ],
      },
      {
        heading: "Modifier ton choix",
        paragraphs: [
          "Ouvre Paramètres cookies depuis le pied de page ou la page de confidentialité à tout moment. Changer d’avis met à jour le stockage immédiatement et coupe l’analytics si tu retires ton consentement.",
        ],
      },
    ],
    security: [
      {
        heading: "Ce que nous protégeons",
        items: [
          "Identifiants de compte avec hachages de mot de passe scrypt.",
          "Jetons de session hachés au repos et envoyés au navigateur en cookies httpOnly.",
          "My Spools privé avec contrôles de propriété côté serveur.",
          "Projections QR publiques sans notes, lieux ni identifiants de compte.",
          "Données de carte gérées par Stripe — non stockées sur les serveurs OpenFilament.",
        ],
      },
      {
        heading: "Responsible disclosure",
        paragraphs: [
          "Signale les vulnérabilités en privé au contact sécurité configuré. Ne divulgue pas publiquement secrets, exploits contre des utilisateurs réels ou accès de production. Laisse un délai raisonnable de correction avant discussion publique.",
        ],
      },
    ],
  },
};

export const supportFr = {
  title: "Assistance",
  metaDescription: "Ce qu’est OpenFilament, ce que tu peux faire, et en quoi My Spools gratuit diffère de la sync Cloud payante (bêta).",
  lead: "Aide courte opérateur → client : à quoi sert ce site, et comment My Spools Local vs Cloud fonctionne — y compris que le Cloud payant est encore en bêta.",
  productHeading: "Ce qu’est OpenFilament",
  productBody: "OpenFilament est un catalogue de filament et un hub de calibration, d’abord dans le navigateur. Trouve des données filament, télécharge des profils starter ou mesurés pour ton slicer, identifie des bobines avec QR ou RFID, et tiens un inventaire optionnel avec My Spools — sans installer d’app bureau pour le produit principal.",
  productItems: [
    "Cherche marques, matériaux et couleurs ; utilise les plages fabricant comme premier réglage solide.",
    "Télécharge des presets slicer (profils communautaires mesurés si dispo, sinon starters basés fabricant).",
    "Imprime des étiquettes QR et utilise les flux RFID si tu as du matériel compatible.",
    "Contribute des calibrations pour que les autres impriment mieux.",
    "Compte optionnel pour la sync d’inventaire Cloud — navigation et My Spools Local fonctionnent sans payer.",
  ],
  mySpoolsHeading: "My Spools — gratuit vs payant",
  mySpoolsLocalTitle: "My Spools Local (gratuit)",
  mySpoolsLocalBody: "Inventaire complet sur cet appareil : notes, séchage, liens QR/RFID, import/export. Aucun compte requis. Les données restent dans ton navigateur — exporte des sauvegardes si tu effaces les données du site ou changes d’appareil.",
  mySpoolsCloudTitle: "My Spools Cloud (payant, bêta)",
  mySpoolsCloudBody: "Hébergement prépayé optionnel (19,99 € pour 12 mois, paiement unique via Stripe, sans renouvellement auto). Un compte (e-mail + mot de passe) est requis pour rattacher l’inventaire Cloud et récupérer l’accès.",
  mySpoolsDiffItems: [
    "Local gratuit : outils d’inventaire complets sur un navigateur/appareil.",
    "Cloud payant : les seuls extras sont la sync des bobines entre appareils et le stock/sauvegarde côté serveur sur notre VPS.",
    "Le Cloud ne débloque pas de meilleurs profils, privilèges catalogue, fonctions RFID/QR, ni d’autres outils d’inventaire au-delà de Local.",
    "Après la période payée, nous conservons les données Cloud 30 jours pour que tu puisses encore les exporter ; ensuite elles peuvent être supprimées. My Spools Local reste pleinement utilisable sans Cloud.",
  ],
  betaNote:
    "My Spools Cloud est en bêta. Attends-toi à des aspérités pendant que nous durcissons sync et facturation. Le produit payé reste étroit : sync de bobines et sauvegarde de stock — rien de plus. Les achats sont définitifs (pas de remboursement) et ne se renouvellent pas automatiquement.",
  contactHeading: "Contact",
  contactBody: "Questions sur la confidentialité, la facturation ou la bêta Cloud : écris-nous. Pour les cookies, utilise Paramètres cookies sur la page de confidentialité.",
};
