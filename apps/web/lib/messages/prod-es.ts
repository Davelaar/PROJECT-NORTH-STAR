/** Shared Spanish copy. Address: tú. */
export const consentEs = {
  bannerAria: "Consentimiento de cookies",
  bannerText:
    "Usamos almacenamiento necesario para que el sitio funcione. Las analytics opcionales ayudan a mejorar OpenFilament. Puedes rechazar cookies no esenciales sin perder búsqueda, My Spools, descargas, QR o RFID.",
  acceptAll: "Aceptar todo",
  rejectNonEssential: "Rechazar no esenciales",
  manage: "Gestionar preferencias",
  cookiePolicy: "Política de cookies",
  privacyPolicy: "Política de privacidad",
  prefsTitle: "Preferencias de cookies",
  prefsLead:
    "El almacenamiento necesario permanece activo. Analytics y marketing permanecen desactivados salvo que los actives.",
  necessary: "Necesarias",
  necessaryHelp: "Sesión, seguridad, elección de consentimiento, idioma, My Spools local.",
  preferences: "Preferencias",
  preferencesHelp: "Recordar preferencias de IU no esenciales.",
  analytics: "Analytics",
  analyticsHelp: "Google Analytics 4 respetuoso con la privacidad solo tras el consentimiento.",
  marketing: "Marketing",
  marketingHelp: "No se usa. Permanece desactivado.",
  savePrefs: "Guardar preferencias",
  cancel: "Cancelar",
};

export const footerEs = {
  navAria: "Sitio y legal",
  privacy: "Privacidad",
  cookies: "Cookies",
  cookieSettings: "Ajustes de cookies",
  terms: "Términos",
  security: "Seguridad",
  trust: "Trust center",
  mySpools: "My Spools",
  tagline: "OpenFilament — inteligencia de filamento, primero en el navegador.",
  legalPlaceholderWarn:
    "Los datos legales del operador aún son placeholders — ver docs/PRODUCTION_LAUNCH_CHECKLIST.md antes del lanzamiento.",
};

export const spoolsEs = {
  heading: "My Spools",
  lead:
    "Lleva el inventario de bobinas físicas en este dispositivo. La sync Cloud es opcional y nunca empieza solo porque inicies sesión.",
  localMode: "Solo local (este navegador)",
  localWarn:
    "Los datos locales pueden perderse si borras datos del sitio o cambias de dispositivo. Exporta una copia de seguridad con regularidad.",
  cloudMode: "Sync Cloud (cuenta)",
  create: "Añadir bobina",
  export: "Exportar JSON",
  import: "Importar JSON",
  clearAll: "Borrar todos los datos locales",
  clearConfirm:
    "¿Eliminar todos los registros locales de bobinas en este dispositivo? No se puede deshacer.",
  syncPreview: "Vista previa de sync",
  syncConfirm: "Subir bobinas seleccionadas",
  syncKeepLocal: "Mantener copia local tras la sync",
  syncRemoveLocal: "Eliminar copia local tras la sync",
  empty: "Aún no hay bobinas. Añade tu primer rollo.",
  status: "Estado",
  weight: "Peso actual (g)",
  tare: "Tara / bobina vacía (g)",
  initial: "Neto inicial (g)",
  remaining: "Restante %",
  location: "Ubicación de almacenamiento",
  notes: "Notas (privadas)",
  batch: "Lote / batch",
  purchase: "Fecha de compra",
  opened: "Fecha de apertura",
  archive: "Archivar",
  restore: "Restaurar",
  delete: "Eliminar",
  duplicate: "Duplicar para un rollo nuevo",
  drying: "Añadir secado",
  qr: "Vincular identidad QR",
  rfid: "Vincular identidad RFID",
  save: "Guardar bobina",
  syncNeverAuto:
    "Iniciar sesión no sube bobinas locales. Debes confirmar la sync explícitamente.",
  conflictPolicy:
    "Los conflictos usan last-write-wins por versión de sync. La reimportación omite duplicados antiguos.",
  wizardLead:
    "Elige marca → material → producto → color del catálogo. Busca primero; «Otro» solo si el ítem falta de verdad.",
  catalogRequired:
    "Selecciona marca, material, producto y color del catálogo antes de guardar.",
  existingRollWarn:
    "Ya tienes {count} rollo(s) de este color en My Spools. Guarda solo si es otra bobina física.",
  editSpool: "Editar bobina",
  cancel: "Cancelar",
  showArchived: "Mostrar archivadas",
  usageLabel: "Usado tras imprimir (g)",
  usagePlaceholder: "p. ej. 42",
  usageSubmit: "Restar uso",
  usageSaved: "Uso registrado y cantidad restante actualizada.",
  usageError: "Introduce una cantidad positiva de gramos usados.",
  usageNeedsWeights: "Añade peso inicial y actual para seguir el uso de impresión.",
};

export const accountEs = {
  heading: "Cuenta",
  sessions: "Sesiones activas",
  revokeSession: "Revocar",
  revokeOthers: "Revocar otras sesiones",
  exportData: "Exportar mis datos",
  deleteAccount: "Eliminar mi cuenta",
  deleteWarn:
    "Esto elimina permanentemente bobinas privadas y sesiones. Las contribuciones públicas pueden anonimizarse en lugar de eliminarse.",
  deleteConfirmLabel: "Escribe DELETE para confirmar",
  privacyPrefs: "Preferencias de privacidad",
  register: "Crear cuenta",
  logout: "Cerrar sesión",
};

export const legalPagesEs = {
  privacyTitle: "Política de privacidad",
  cookiesTitle: "Política de cookies",
  termsTitle: "Términos de uso",
  securityTitle: "Seguridad",
  trustTitle: "Trust center",
  placeholderNotice:
    "Esta página incluye placeholders del operador claramente marcados. Bloquean el lanzamiento hasta sustituirlos.",
  effective: "Fecha de entrada en vigor",
  operator: "Operador",
  privacyContact: "Contacto de privacidad",
  hosting: "Alojamiento",
  contact: "Contacto",
  openSourceRepository: "Repositorio open source",
  cookieSettingsHint: "Usa la configuración de cookies del pie",
  sections: {
    privacy: [
      { heading: "Datos tratados", items: ["Cuenta, sesiones y registros de seguridad.", "Cloud My Spools, notas privadas e identidades QR/RFID solo tras sincronización explícita.", "My Spools local permanece en el navegador.", "Contribuciones públicas y preferencias de consentimiento.", "Google Analytics 4 solo tras consentimiento."] },
      { heading: "Bases legales y derechos", paragraphs: ["Tratamos datos para contrato/servicio solicitado, interés legítimo de seguridad, consentimiento para analítica y obligaciones legales. Puedes solicitar acceso, corrección, eliminación, limitación, portabilidad, oposición y retirar consentimiento."] },
      { heading: "My Spools, conservación y transferencias", paragraphs: ["Local permanece en tu dispositivo y iniciar sesión no lo sube. Cloud es alojamiento prepago opcional de 12 meses sin renovación automática. La resolución QR pública no expone notas, ubicaciones ni IDs de cuenta.", "La conservación sigue docs/DATA_RETENTION.md. Si activas analítica, Google puede tratar datos fuera del EEE. Cambios importantes pueden volver a pedir consentimiento."] },
    ],
    terms: [
      { heading: "Plataforma comunitaria", paragraphs: ["OpenFilament ofrece catálogo, identificación y calibraciones comunitarias sin garantía de seguridad de impresión; tú validas los ajustes en tu impresora."] },
      { heading: "Cuentas, Cloud y contribuciones", paragraphs: ["Las cuentas son opcionales. My Spools Local es gratis. Cloud cuesta 19,99 € por 12 meses con pago único de Stripe, sin renovación automática. Stripe procesa pagos; OpenFilament no guarda números de tarjeta.", "Al enviar calibraciones aceptas los términos mostrados; los correos de contribuidores siguen privados."] },
      { heading: "Disponibilidad y responsabilidad", paragraphs: ["El servicio se ofrece tal cual, sin garantía de disponibilidad continua; la responsabilidad por herramientas comunitarias gratuitas se limita en lo permitido por la ley."] },
    ],
    cookies: [
      { heading: "Almacenamiento del navegador", paragraphs: ["Cookies/almacenamiento necesarios sirven para idioma, consentimiento, sesiones, CSRF, My Spools local y la shell PWA. Analítica solo con consentimiento."] },
      { heading: "Elección", paragraphs: ["Rechazar analítica no desactiva búsqueda, My Spools, cuentas, QR, RFID ni descargas. No se usa almacenamiento de marketing."] },
    ],
    security: [
      { heading: "Protección", items: ["Contraseñas con hash scrypt.", "Tokens de sesión hasheados y cookies httpOnly.", "My Spools privado con controles de propiedad.", "Proyecciones QR públicas sin campos privados."] },
      { heading: "Divulgación responsable", paragraphs: ["Informa vulnerabilidades en privado al contacto de seguridad y no publiques secretos, exploits contra usuarios reales ni credenciales de producción antes de un plazo razonable de corrección."] },
    ],
  },
};
