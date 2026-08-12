/** Shared Spanish copy. Address: tú. */
export const consentEs = {
  bannerAria: "Consentimiento de cookies",
  bannerText:
    "Usamos almacenamiento necesario para que el sitio funcione. La analítica respetuosa con la privacidad ayuda a mejorar OpenFilament y permanece activa hasta que la rechaces. Puedes rechazar cookies no esenciales sin perder búsqueda, My Spools, descargas, QR o RFID.",
  acceptAll: "Aceptar todo",
  rejectNonEssential: "Rechazar no esenciales",
  manage: "Gestionar preferencias",
  cookiePolicy: "Política de cookies",
  privacyPolicy: "Política de privacidad",
  prefsTitle: "Preferencias de cookies",
  prefsLead:
    "El almacenamiento necesario permanece activo. La analítica permanece activa hasta que la desactives. El marketing no se usa.",
  necessary: "Necesarias",
  necessaryHelp: "Sesión, seguridad, elección de consentimiento, idioma, My Spools local.",
  preferences: "Preferencias",
  preferencesHelp: "Recordar preferencias de IU no esenciales.",
  analytics: "Analytics",
  analyticsHelp: "Google Analytics 4 respetuoso con la privacidad — activo hasta que lo rechaces.",
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
  support: "Soporte",
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
    "Elige marca y material del catálogo, luego producto y color. Busca primero; «Otro» solo si el ítem falta de verdad.",
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
  usageAddSubmit: "Añadir gramos",
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
  privacyMetaDescription: "Cómo OpenFilament trata el correo de la cuenta, los pagos de Stripe, My Spools y las cookies.",
  cookiesTitle: "Política de cookies",
  termsTitle: "Condiciones del servicio",
  termsMetaDescription:
    "Condiciones de OpenFilament: servicio tal cual, sin reembolsos de Cloud, sin renovación automática, ventana de exportación Cloud de 30 días tras el vencimiento.",
  securityTitle: "Seguridad",
  trustTitle: "Trust center",
  placeholderNotice: "Esta página incluye placeholders del operador claramente marcados. Bloquean el lanzamiento hasta sustituirlos.",
  effective: "Fecha de vigencia",
  operator: "Operador",
  privacyContact: "Contacto de privacidad",
  hosting: "Alojamiento",
  contact: "Contacto",
  openSourceRepository: "Repositorio de código abierto",
  cookieSettingsHint: "Puedes cambiar las cookies de analítica y preferencias en cualquier momento con Ajustes de cookies. Versión del consentimiento:",
  sections: {
    privacy: [
      {
        heading: "Cuentas — qué almacenamos",
        paragraphs: [
          "Crear una cuenta solo requiere un correo y una contraseña. Guardamos ese correo para que puedas iniciar sesión, recibir recibos de pago y restablecer la contraseña. No pedimos tu nombre real; se genera automáticamente un nombre de usuario interno. Las contraseñas se almacenan como hashes scrypt — nunca en texto claro.",
          "No usamos tu correo para marketing. La recuperación de cuenta y los mensajes esenciales del servicio (por ejemplo, pagos o seguridad) son los usos previstos.",
        ],
      },
      {
        heading: "Pagos (Stripe)",
        paragraphs: [
          "Las compras opcionales de My Spools Cloud se pagan con Stripe Checkout. Introduces tarjeta o monedero en las páginas de pago alojadas por Stripe. Stripe es el procesador de pagos: OpenFilament nunca recibe ni almacena tu número de tarjeta completo, CVC ni secretos equivalentes del monedero.",
          "En nuestro lado solo guardamos lo necesario para el acceso Cloud y la contabilidad: importe, moneda, estado del pago, identificadores de sesión/pago de Stripe, marcas de tiempo y tu periodo de derecho Cloud. Stripe trata los datos de pago bajo sus propios términos y política de privacidad.",
          "El acceso Cloud es un periodo prepago único (actualmente 12 meses). No hay renovación automática ni cargo fuera de sesión a menos que inicies tú un nuevo Checkout.",
        ],
      },
      {
        heading: "Qué más tratamos",
        items: [
          "Sesiones de autenticación (cookies httpOnly) y registros de seguridad.",
          "Inventario My Spools Cloud, notas privadas e identidades QR/RFID solo cuando sincronizas explícitamente a la nube.",
          "My Spools local permanece en tu navegador hasta que sincronices o exportes — iniciar sesión no sube las bobinas locales por sí solo.",
          "Contribuciones públicas de la comunidad que eliges publicar (calibraciones, tips del catálogo).",
          "Preferencias de consentimiento y Google Analytics 4 respetuoso con la privacidad salvo que rechaces las cookies no esenciales.",
        ],
      },
      {
        heading: "Bases legales",
        items: [
          "Contrato / servicio solicitado para cuentas, Cloud, exportaciones y descargas.",
          "Interés legítimo para seguridad, prevención de abusos e integridad del servicio.",
          "Cookies/almacenamiento de analítica hasta que las rechaces — desactívalas en Ajustes de cookies.",
          "Obligación legal cuando deban conservarse registros de seguridad o contables.",
        ],
      },
      {
        heading: "My Spools",
        paragraphs: [
          "My Spools local es gratuito y permanece en tu dispositivo. Borrar datos del sitio, perder el dispositivo o cambiar de navegador puede eliminarlo.",
          "My Spools Cloud es alojamiento de pago opcional para sincronizar inventario y copia de seguridad. La resolución QR pública no expone notas privadas, ubicaciones ni identificadores de cuenta.",
        ],
      },
      {
        heading: "Tus derechos y retención",
        paragraphs: [
          "Puedes solicitar acceso, rectificación, eliminación, limitación, portabilidad y oposición, y retirar el consentimiento. Usa exportar/eliminar cuenta, Ajustes de cookies o escribe al contacto de privacidad. Puedes reclamar ante la autoridad de control indicada para este sitio.",
          "Las bobinas Cloud eliminadas de forma suave se purgan según calendario. Los registros de pago y seguridad pueden conservarse más tiempo si la contabilidad o la prevención del fraude lo exigen. Las copias de seguridad pueden retener datos eliminados hasta que caduque la copia.",
        ],
      },
      {
        heading: "Transferencias internacionales y cambios",
        paragraphs: [
          "El alojamiento de la aplicación y la base de datos está en nuestro VPS de la UE como se indica arriba. Si activas la analítica, Google puede tratar datos fuera del EEE bajo sus salvaguardas. Stripe puede tratar datos de pago en regiones donde opera. Los cambios materiales de política actualizan la versión de consentimiento y pueden volver a pedir consentimiento.",
        ],
      },
    ],
    terms: [
      {
        heading: "Servicio comunitario tal cual",
        paragraphs: [
          "OpenFilament se ofrece tal cual y según disponibilidad. Los datos del catálogo, los perfiles de inicio y las calibraciones de la comunidad no garantizan la seguridad de impresión. Sigues siendo responsable de validar los ajustes en tu impresora y de los resultados de impresión.",
          "No garantizamos disponibilidad ininterrumpida, funcionamiento sin errores ni idoneidad para un fin concreto, en la medida permitida por la ley. My Spools Cloud se ofrece en beta.",
        ],
      },
      {
        heading: "Cuentas y uso gratuito",
        paragraphs: [
          "Navegar, buscar, descargar perfiles y My Spools Local son gratuitos. Una cuenta (correo y contraseña) es opcional para el uso gratuito y solo se requiere si compras My Spools Cloud, para que podamos asociar el inventario y recuperar el acceso.",
        ],
      },
      {
        heading: "My Spools Cloud — pago, sin renovación, sin reembolsos",
        paragraphs: [
          "Cloud es un servicio digital prepago opcional: actualmente 19,99 € por 12 meses, pagado una vez vía Stripe Checkout. No hay renovación automática ni cargo fuera de sesión. El acceso termina cuando acaba el periodo pagado, salvo que inicies tú un nuevo Checkout.",
          "Todas las compras de Cloud son finales: sin reembolsos, sin contracargos por arrepentimiento del comprador ni reembolsos parciales por meses no usados. Stripe procesa el pago; OpenFilament no almacena números de tarjeta.",
          "Cloud solo añade sincronización de bobinas entre dispositivos y stock/copia de seguridad en el servidor. No desbloquea funciones extra de catálogo, perfiles o RFID/QR más allá de Local.",
        ],
      },
      {
        heading: "Tras caducar Cloud — 30 días para exportar",
        paragraphs: [
          "Cuando termina tu periodo Cloud, conservamos tu inventario Cloud 30 días más. Durante esos 30 días aún puedes exportar tus datos Cloud (JSON). La sincronización y el acceso de escritura tras el vencimiento siguen las reglas del producto (solo lectura / ventana de exportación).",
          "Tras esos 30 días, el inventario Cloud puede eliminarse de forma permanente de nuestros servidores. My Spools local en tu navegador no se ve afectado y sigue siendo gratuito. Los registros de pago y seguridad pueden conservarse más tiempo si la contabilidad o la prevención del fraude lo exigen.",
        ],
      },
      {
        heading: "Contribuciones",
        paragraphs: [
          "Al enviar calibraciones aceptas los términos de contribución mostrados al enviar y licencias la contribución para visualización pública bajo los términos abiertos del proyecto. Los correos de los colaboradores permanecen privados.",
        ],
      },
      {
        heading: "Responsabilidad",
        paragraphs: [
          "En la medida permitida por la ley aplicable, OpenFilament y su operador no responden de daños indirectos, incidentales o consecuentes derivados del uso de las herramientas gratuitas o del servicio Cloud en beta. Los derechos de consumo imperativos que no pueden renunciarse según el derecho neerlandés o de la UE no se ven afectados.",
        ],
      },
    ],
    cookies: [
      {
        heading: "Almacenamiento necesario",
        paragraphs: [
          "Necesario para que el sitio funcione: idioma (of_locale), elección de consentimiento (of_consent), sesión iniciada (of_session, httpOnly), protección CSRF (of_csrf) y datos locales de My Spools en IndexedDB. Un service worker / Cache Storage puede mantener el shell PWA sin conexión. No se usa para publicidad.",
        ],
      },
      {
        heading: "Analítica opcional",
        paragraphs: [
          "Cargamos por defecto Google Analytics 4 respetuoso con la privacidad, que puede establecer cookies de origen como _ga. Rechaza las cookies no esenciales (o desactiva la analítica en Ajustes de cookies) para detenerlo. Búsqueda, My Spools, cuentas, QR, RFID y descargas siguen usables. No se usan cookies de marketing.",
        ],
      },
      {
        heading: "Cambiar tu elección",
        paragraphs: [
          "Abre Ajustes de cookies desde el pie o la página de privacidad en cualquier momento. Cambiar de opinión actualiza el almacenamiento de inmediato y desactiva la analítica si retiras el consentimiento.",
        ],
      },
    ],
    security: [
      {
        heading: "Qué protegemos",
        items: [
          "Credenciales de cuenta con hashes de contraseña scrypt.",
          "Tokens de sesión hasheados en reposo y enviados al navegador como cookies httpOnly.",
          "My Spools privado con comprobaciones de propiedad en el servidor.",
          "Proyecciones QR públicas sin notas, ubicaciones ni identificadores de cuenta.",
          "Datos de tarjeta gestionados por Stripe — no almacenados en servidores de OpenFilament.",
        ],
      },
      {
        heading: "Responsible disclosure",
        paragraphs: [
          "Informa de vulnerabilidades en privado al contacto de seguridad configurado. No divulgues públicamente secretos, exploits contra usuarios reales ni credenciales de producción. Concede un tiempo razonable de remediación antes del debate público.",
        ],
      },
    ],
  },
};

export const supportEs = {
  title: "Soporte",
  metaDescription: "Qué es OpenFilament, qué puedes hacer y cómo My Spools gratuito difiere de la sync Cloud de pago (beta).",
  lead: "Ayuda breve de operador a cliente: para qué sirve este sitio y cómo funciona My Spools Local vs Cloud — incluido que Cloud de pago sigue en beta.",
  productHeading: "Qué es OpenFilament",
  productBody: "OpenFilament es un catálogo de filamento y hub de calibración, primero en el navegador. Encuentra datos de filamento, descarga perfiles starter o medidos para tu slicer, identifica bobinas con QR o RFID y mantén un inventario opcional con My Spools — sin instalar una app de escritorio para el producto principal.",
  productItems: [
    "Busca marcas, materiales y colores; usa rangos del fabricante como primer ajuste sólido.",
    "Descarga presets de slicer (perfiles medidos de la comunidad si hay, si no starters basados en el fabricante).",
    "Imprime etiquetas QR y usa flujos RFID si tienes hardware compatible.",
    "Aporta calibraciones para que otros impriman mejor.",
    "Cuenta opcional para sync de inventario Cloud — navegar y My Spools Local funcionan sin pagar.",
  ],
  mySpoolsHeading: "My Spools — gratis vs de pago",
  mySpoolsLocalTitle: "My Spools Local (gratis)",
  mySpoolsLocalBody: "Inventario completo en este dispositivo: notas, secado, enlaces QR/RFID, importar/exportar. No hace falta cuenta. Los datos permanecen en el navegador — exporta copias si borras datos del sitio o cambias de dispositivo.",
  mySpoolsCloudTitle: "My Spools Cloud (de pago, beta)",
  mySpoolsCloudBody: "Alojamiento prepago opcional (19,99 € por 12 meses, pago único vía Stripe, sin renovación automática). Se requiere una cuenta (correo + contraseña) para asociar el inventario Cloud y recuperar el acceso.",
  mySpoolsDiffItems: [
    "Local gratis: herramientas de inventario completas en un navegador/dispositivo.",
    "Cloud de pago: los únicos extras son sincronizar bobinas entre dispositivos y stock/copia de seguridad en el servidor en nuestro VPS.",
    "Cloud no desbloquea mejores perfiles, privilegios de catálogo, funciones RFID/QR ni otras herramientas de inventario más allá de Local.",
    "Tras el periodo de pago conservamos los datos Cloud 30 días para que aún puedas exportarlos; después pueden eliminarse. My Spools Local sigue plenamente usable sin Cloud.",
  ],
  betaNote:
    "My Spools Cloud está en beta. Espera aristas mientras endurecemos sync y facturación. El producto de pago sigue siendo estrecho: sync de bobinas y copia de stock — nada más. Las compras son finales (sin reembolsos) y no se renuevan automáticamente.",
  contactHeading: "Contacto",
  contactBody: "Preguntas sobre privacidad, facturación o la beta Cloud: escríbenos. Para cookies, usa Ajustes de cookies en la página de privacidad.",
};
