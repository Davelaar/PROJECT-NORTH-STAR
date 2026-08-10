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
    "Choisis marque → matériau → produit → couleur dans le catalogue. Cherche d’abord ; « Autre » seulement si l’élément manque vraiment.",
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
  cookiesTitle: "Politique cookies",
  termsTitle: "Conditions d’utilisation",
  securityTitle: "Sécurité",
  trustTitle: "Trust center",
  placeholderNotice:
    "Cette page contient des placeholders clairement marqués. Ils bloquent la mise en production jusqu’à remplacement.",
  effective: "Date d’entrée en vigueur",
  operator: "Opérateur",
  privacyContact: "Contact confidentialité",
  hosting: "Hébergement",
  contact: "Contact",
  openSourceRepository: "Dépôt open source",
  cookieSettingsHint: "Utilise les paramètres cookies dans le pied de page",
  sections: {
    privacy: [
      { heading: "Données traitées", items: ["Compte, sessions et journaux de sécurité.", "Cloud My Spools, notes privées et identités QR/RFID uniquement après synchronisation explicite.", "My Spools local reste dans le navigateur.", "Contributions publiques et préférences de consentement.", "Google Analytics 4 seulement après consentement."] },
      { heading: "Bases légales et droits", paragraphs: ["Le traitement couvre le contrat/service demandé, l’intérêt légitime de sécurité, le consentement pour l’analytics et les obligations légales. Tu peux demander accès, rectification, suppression, limitation, portabilité, opposition et retrait du consentement."] },
      { heading: "My Spools, conservation et transferts", paragraphs: ["Local reste sur ton appareil et la connexion ne l’envoie pas. Cloud est un hébergement prépayé optionnel de 12 mois sans renouvellement automatique. La résolution QR publique n’expose pas notes, lieux ou identifiants de compte.", "La conservation suit docs/DATA_RETENTION.md. Si l’analytics est activé, Google peut traiter hors EEE. Les changements importants peuvent redemander le consentement."] },
    ],
    terms: [
      { heading: "Plateforme communautaire", paragraphs: ["OpenFilament fournit catalogue, identification et calibrations communautaires sans garantie de sécurité d’impression ; tu valides les réglages sur ton imprimante."] },
      { heading: "Comptes, Cloud et contributions", paragraphs: ["Les comptes sont optionnels. My Spools Local est gratuit. Cloud coûte 19,99 € pour 12 mois via paiement Stripe unique, sans renouvellement automatique. Stripe traite les paiements ; OpenFilament ne stocke pas les numéros de carte.", "En soumettant des calibrations, tu acceptes les conditions affichées ; les e-mails contributeurs restent privés."] },
      { heading: "Disponibilité et responsabilité", paragraphs: ["Le service est fourni tel quel, sans garantie de disponibilité continue ; la responsabilité des outils communautaires gratuits est limitée dans la mesure permise par la loi."] },
    ],
    cookies: [
      { heading: "Stockage navigateur", paragraphs: ["Les cookies/stockages nécessaires servent à la langue, au consentement, aux sessions, à la protection CSRF, à My Spools local et au shell PWA. Analytics seulement après consentement."] },
      { heading: "Choix", paragraphs: ["Refuser l’analytics ne désactive pas recherche, My Spools, comptes, QR, RFID ou téléchargements. Aucun stockage marketing n’est utilisé."] },
    ],
    security: [
      { heading: "Protection", items: ["Mots de passe hachés avec scrypt.", "Tokens de session hachés et cookies httpOnly.", "My Spools privé avec contrôles de propriété.", "Projections QR publiques sans champs privés."] },
      { heading: "Responsible disclosure", paragraphs: ["Signale les vulnérabilités en privé au contact sécurité et ne publie pas secrets, exploits contre des utilisateurs réels ou accès production avant un délai raisonnable de correction."] },
    ],
  },
};
