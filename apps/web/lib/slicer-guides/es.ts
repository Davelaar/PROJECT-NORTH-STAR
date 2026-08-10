/**
 * Spanish (Español) slicer instruction guide content.
 * Menu names stay in official English where the slicer UI does.
 */

import type { GuidesBundle, GuideSection, SlicerGuide } from "./en";

function guide(
  title: string,
  lead: string,
  sections: GuideSection[],
): SlicerGuide {
  return { title, lead, sections };
}

export const guides: GuidesBundle = {
  overview: {
    heading: "Slicers compatibles",
    lead: "OpenFilament crea un archivo de preset de filamento. Tú lo descargas y lo importas en tu slicer. OpenFilament no instala software ni modifica carpetas locales del slicer.",
    tableCaption: "Resumen de compatibilidad",
    interchangeTitle: "OpenFilamentProfile JSON",
    interchangeBody:
      "Formato de intercambio canónico para copias de seguridad, portabilidad, integraciones y desarrolladores. No es un preset de slicer y no puede imprimirse directamente.",
    viewInstructions: "Ver instrucciones de importación",
    officialSite: "Sitio oficial",
    colSlicer: "Slicer",
    colStatus: "Estado",
    colFilament: "Preset de filamento",
    colPrinter: "Preset de impresora",
    colProcess: "Preset de proceso",
    colInstructions: "Instrucciones",
    yes: "Sí",
    no: "No",
    identityHeading: "Preset vs identidad de la bobina",
    identityBody:
      "El preset de filamento del slicer configura temperaturas y extrusión. CFS/AMS/RFID identifican o mapean la bobina física. El G-code rebanado es lo que ejecuta la impresora. Pueden referirse al mismo registro OpenFilament, pero no son el mismo archivo.",
  },
  status: {
    supported: "Soportado",
    beta: "Beta",
    planned: "Planificado",
    interchange: "Formato de intercambio",
  },
  guides: {
    "creality-print": guide(
      "Creality Print — instrucciones de importación",
      "Descarga un preset de filamento de usuario OpenFilament (.json) e impórtalo con File → Import → Import Configs. Los ajustes de impresora y proceso no cambian. Los nombres de menú siguen la interfaz en inglés de Creality Print.",
      [
        {
          id: "what",
          heading: "Qué exporta OpenFilament",
          blocks: [
            {
              type: "p",
              text: "Un JSON de preset de filamento de usuario en formato Creality Print, con overrides en arrays de strings y una cadena de herencia (base Generic/HP para tu impresora y boquilla).",
            },
            {
              type: "ul",
              items: [
                "Fabricante, tipo, color, densidad y diámetro del filamento",
                "Temperaturas de boquilla y cama (incluyendo primera capa si se conocen)",
                "Ratio de flujo, pressure advance, flujo volumétrico máx.",
                "Overrides de enfriamiento y retracción si están presentes",
                "Temperatura de cámara y contracción si están presentes",
                "Notas de procedencia en filament_notes",
              ],
            },
            {
              type: "p",
              text: "No incluye firmware de impresora, un preset de impresora completo, un preset de proceso/impresión, G-code rebanado ni datos RFID/CFS.",
            },
          ],
        },
        {
          id: "before",
          heading: "Antes de empezar",
          blocks: [
            {
              type: "ul",
              items: [
                "Creality Print 6.x o 7.x (soporte Beta)",
                "Añade primero tu impresora en Creality Print",
                "Selecciona el diámetro de boquilla correspondiente",
                "No se necesita cuenta OpenFilament para descargar",
                "Opcional: haz copia de seguridad de los presets existentes (File → Export → Export Presets)",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Descargar desde OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Encuentra el filamento (Búsqueda / catálogo).",
                "Abre el color / variante.",
                "Elige impresora y boquilla.",
                "Elige un perfil de calibración.",
                "Abre Descargar para slicer / Export y elige Creality Print.",
                "Crea la descarga y guarda el archivo .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importar en Creality Print",
          blocks: [
            {
              type: "ol",
              items: [
                "Abre Creality Print.",
                "Elige File → Import → Import Configs.",
                "Selecciona el archivo .json de OpenFilament descargado.",
                "Confirma si se pregunta sobre presets existentes.",
              ],
            },
            {
              type: "note",
              text: "Al actualizar entre versiones mayores, Creality puede ofrecer « Import 5.x Presets » o solicitudes de migración — esa ruta es para migrar datos de usuario antiguos de Creality, no la descarga habitual de OpenFilament.",
            },
          ],
        },
        {
          id: "select",
          heading: "Seleccionar el perfil importado",
          blocks: [
            {
              type: "ul",
              items: [
                "Abre la lista de filamentos de tu proyecto.",
                "Busca el preset de usuario con un nombre como « Marca Producto Color @Creality … boquilla ».",
                "Verifica que la impresora y boquilla activas coinciden con el perfil.",
                "Los presets del sistema están separados de los presets de usuario.",
              ],
            },
          ],
        },
        {
          id: "cfs",
          heading: "Conectar al filamento físico (CFS)",
          blocks: [
            {
              type: "p",
              text: "El preset importado está en el slicer. La identidad del material del slot CFS es independiente.",
            },
            {
              type: "ol",
              items: [
                "Carga o edita el slot CFS para la bobina física.",
                "Mapea el slot al preset de filamento importado cuando Creality Print pida un filamento.",
                "El RFID puede identificar material y color; no contiene el perfil de calibración OpenFilament completo.",
              ],
            },
          ],
        },
        {
          id: "verify",
          heading: "Verificar la importación",
          blocks: [
            {
              type: "ul",
              items: [
                "El preset aparece en la lista de filamentos",
                "Impresora correcta seleccionada",
                "Diámetro de boquilla correcto seleccionado",
                "Las temperaturas coinciden con el perfil OpenFilament",
                "El flujo y el flujo volumétrico máx. están presentes",
                "El proyecto rebanado usa el filamento importado",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Solución de problemas",
          blocks: [
            {
              type: "ul",
              items: [
                "Archivo rechazado — confirma que es el preset de usuario .json de OpenFilament, no el JSON de intercambio OpenFilamentProfile.",
                "No visible — limpia filtros; comprueba que la base de herencia existe para tu impresora/boquilla.",
                "Boquilla incorrecta — re-exporta con la boquilla correcta, o cambia de boquilla en Creality Print y re-selecciona el filamento.",
                "Nombre duplicado — renombra o elimina el preset de usuario anterior antes de re-importar.",
                "Versión antigua — actualiza a Creality Print 6.x/7.x.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Eliminar o reemplazar el perfil",
          blocks: [
            {
              type: "p",
              text: "Elimina el preset de usuario de la lista de filamentos de Creality Print, o importa una revisión más reciente de OpenFilament (usa un nombre de archivo distinto en cada descarga). Evita acumular revisiones casi duplicadas.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitaciones conocidas",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta: los tests estructurales pasan; verificación manual ampliada en curso.",
                "Solo filamento — sin exportación de impresora/proceso.",
                "Los materiales exóticos pueden heredar una base Generic incompleta para ese tipo.",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Fuentes y compatibilidad",
          blocks: [
            {
              type: "ul",
              items: [
                "Versiones soportadas: 6.x, 7.x (Beta)",
                "Última verificación estructural: 2026-08-10",
                "Adaptador: @open-filament/slicer-creality",
                "Notas de investigación: docs/SLICER_IMPORT_SOURCES.md",
              ],
            },
          ],
        },
      ],
    ),
    orcaslicer: guide(
      "OrcaSlicer — instrucciones de importación",
      "Descarga un preset de filamento JSON de OpenFilament e impórtalo con File → Import → Import Configs. Los nombres de menú siguen la interfaz en inglés de OrcaSlicer / wiki.",
      [
        {
          id: "what",
          heading: "Qué exporta OpenFilament",
          blocks: [
            {
              type: "p",
              text: "Un preset de filamento de usuario OrcaSlicer en JSON (type: filament) con herencia como Generic ASA @K2 Plus-all, más temperaturas, flujo, PA, límite volumétrico, enfriamiento y retracción si se conocen.",
            },
            {
              type: "p",
              text: "No incluye presets de impresora o proceso, G-code ni datos RFID.",
            },
          ],
        },
        {
          id: "before",
          heading: "Antes de empezar",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer 2.0+ recomendado (Beta)",
                "Instala/selecciona primero tu perfil de impresora",
                "Copia de seguridad opcional: File → Export → Export Preset Bundle",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Descargar desde OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Encuentra filamento → variante → impresora/boquilla → perfil.",
                "Elige OrcaSlicer en la página Export / Descargar para slicer.",
                "Crea la descarga y guarda el archivo .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importar en OrcaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Abre OrcaSlicer.",
                "Elige File → Import → Import Configs (wiki: Preset Configs).",
                "Selecciona el preset de filamento .json de OpenFilament.",
                "Confirma sobrescritura si ya existe un preset con el mismo nombre.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Seleccionar el perfil importado",
          blocks: [
            {
              type: "ul",
              items: [
                "Abre el desplegable Filament.",
                "Localiza el preset de usuario (marca / producto / color).",
                "Si falta: Filament settings → Dependencies — habilita tu impresora/boquilla.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Conectar al filamento físico",
          blocks: [
            {
              type: "p",
              text: "Para una bobina externa, selecciona el filamento importado en la pestaña de preparación. Para el mapeo AMS/CFS en Orca, mapea el slot a este filamento de usuario solo donde tu perfil de impresora lo soporte — OpenFilament no escribe RFID automáticamente.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verificar la importación",
          blocks: [
            {
              type: "ul",
              items: [
                "Preset listado en filamentos de usuario",
                "Impresora y boquilla activas",
                "Temperaturas / flujo / volumétrico máx. coinciden",
                "El proyecto se rebana con este filamento",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Solución de problemas",
          blocks: [
            {
              type: "ul",
              items: [
                "Configuración inválida — asegúrate de que es JSON (no un .ini de Prusa).",
                "Oculto tras importar — corrige compatible_printers / Dependencies.",
                "Base de herencia incorrecta — re-exporta tras elegir un modelo de impresora más cercano.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Eliminar o reemplazar el perfil",
          blocks: [
            {
              type: "p",
              text: "Elimina el preset de filamento de usuario en OrcaSlicer, o importa una descarga más reciente de OpenFilament. Usa nombres de archivo de revisión distintos desde OpenFilament.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitaciones conocidas",
          blocks: [
            {
              type: "ul",
              items: [
                "Soporte beta",
                "Solo exportación de filamento",
                "Hereda bases de estilo Generic @printer-all",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Fuentes y compatibilidad",
          blocks: [
            {
              type: "ul",
              items: [
                "Wiki de OrcaSlicer import_export",
                "Última verificación estructural: 2026-08-10",
                "Adaptador: @open-filament/slicer-orca",
              ],
            },
          ],
        },
      ],
    ),
    prusaslicer: guide(
      "PrusaSlicer — instrucciones de importación",
      "Descarga un bundle de configuración de filamento OpenFilament (.ini) e impórtalo con File → Import → Import Config Bundle…. Los nombres de menú siguen la interfaz en inglés de PrusaSlicer / Prusa Knowledge Base.",
      [
        {
          id: "what",
          heading: "Qué exporta OpenFilament",
          blocks: [
            {
              type: "p",
              text: "Un bundle de configuración PrusaSlicer con una sección [filament:…] con herencia (*PLA*, *PET*, *ABS*, *FLEX*), temperaturas, multiplicador de extrusión, límite volumétrico, ventiladores y notas. El pressure advance es una indicación en start_filament_gcode.",
            },
            {
              type: "p",
              text: "Sin preset de impresora, preset de impresión/proceso, G-code ni datos RFID.",
            },
          ],
        },
        {
          id: "before",
          heading: "Antes de empezar",
          blocks: [
            {
              type: "ul",
              items: [
                "PrusaSlicer 2.7+ (Beta; testado estructuralmente hasta campos 2.9.x)",
                "Configura primero tu impresora en PrusaSlicer",
                "Opcional: File → Export → Export Config Bundle para copia de seguridad",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Descargar desde OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Encuentra filamento → variante → impresora/boquilla → perfil.",
                "Elige PrusaSlicer en Export / Descargar para slicer.",
                "Crea la descarga y guarda el archivo .ini.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importar en PrusaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Abre PrusaSlicer.",
                "Elige File → Import → Import Config Bundle…",
                "Selecciona el archivo .ini de OpenFilament.",
              ],
            },
            {
              type: "note",
              text: "Usa Import Config Bundle para este archivo (es un bundle pequeño con una sección de filamento). Import Config es para un perfil combinado único / G-code — no es la ruta habitual de OpenFilament.",
            },
          ],
        },
        {
          id: "select",
          heading: "Seleccionar el perfil importado",
          blocks: [
            {
              type: "ul",
              items: [
                "Abre Filament Settings.",
                "Selecciona el preset personalizado (marca / producto / color).",
                "Confirma impresora y boquilla en el plato antes de rebanar.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Conectar al filamento físico",
          blocks: [
            {
              type: "p",
              text: "PrusaSlicer no mapea automáticamente RFID de terceros. Selecciona el preset de filamento importado en el plato para la bobina que hayas cargado. No existe una integración automática del sistema de materiales OpenFilament.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verificar la importación",
          blocks: [
            {
              type: "ul",
              items: [
                "El filamento personalizado aparece en la lista",
                "Las temperaturas y el multiplicador de extrusión coinciden",
                "El rebanado usa el filamento seleccionado",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Solución de problemas",
          blocks: [
            {
              type: "ul",
              items: [
                "No se importó nada — usa Import Config Bundle, no Import Config.",
                "Extensión incorrecta — mantén .ini (no dejes como .txt).",
                "El ASA usa herencia *ABS* — esperado para las plantillas estándar.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Eliminar o reemplazar el perfil",
          blocks: [
            {
              type: "p",
              text: "Elimina el preset de filamento personalizado en PrusaSlicer, o importa un .ini de OpenFilament más reciente. Renombra localmente si has personalizado valores que quieras conservar.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitaciones conocidas",
          blocks: [
            {
              type: "ul",
              items: [
                "Soporte beta",
                "Bundle solo de filamento",
                "PA vía indicación en gcode",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Fuentes y compatibilidad",
          blocks: [
            {
              type: "ul",
              items: [
                "Artículo de Prusa Knowledge Base 382766",
                "Última verificación estructural: 2026-08-10",
                "Adaptador: @open-filament/slicer-prusa",
              ],
            },
          ],
        },
      ],
    ),
    "bambu-studio": guide(
      "Bambu Studio — instrucciones de importación",
      "Descarga un preset de filamento de usuario JSON de OpenFilament e impórtalo con File → Import → Import Configs. Los nombres de menú siguen la interfaz en inglés actual de Bambu Studio.",
      [
        {
          id: "what",
          heading: "Qué exporta OpenFilament",
          blocks: [
            {
              type: "p",
              text: "Un preset de filamento de usuario JSON de Bambu Studio / familia SoftFever con herencia (Generic {material} [@printer]), temperaturas, flujo, PA, límite volumétrico, enfriamiento, retracción y notas.",
            },
            {
              type: "p",
              text: "Sin presets de impresora/proceso, G-code ni soporte de escritura RFID Bambu desde OpenFilament.",
            },
          ],
        },
        {
          id: "before",
          heading: "Antes de empezar",
          blocks: [
            {
              type: "ul",
              items: [
                "Bambu Studio 1.9+ / 2.0+ (Beta)",
                "Selecciona primero tu impresora y boquilla en Studio",
                "Opcional: exporta una copia de seguridad de los presets de usuario",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Descargar desde OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Encuentra filamento → variante → impresora/boquilla → perfil.",
                "Elige Bambu Studio en Export / Descargar para slicer.",
                "Crea la descarga y guarda el archivo .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importar en Bambu Studio",
          blocks: [
            {
              type: "ol",
              items: [
                "Abre Bambu Studio.",
                "Elige File → Import → Import Configs.",
                "Selecciona el preset de filamento .json de OpenFilament.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Seleccionar el perfil importado",
          blocks: [
            {
              type: "ul",
              items: [
                "Abre la selección de filamento → Filamentos de usuario / personalizados.",
                "Limpia los filtros de impresora/boquilla si el preset está oculto.",
                "Selecciona el preset importado para la placa.",
              ],
            },
          ],
        },
        {
          id: "ams",
          heading: "Conectar al filamento físico (AMS)",
          blocks: [
            {
              type: "p",
              text: "La identidad del material del AMS es independiente del preset del slicer. Mapea el slot del AMS al filamento de usuario importado en la interfaz de mapeo AMS / filamento de Studio. OpenFilament no pretende escribir RFID de terceros en tags Bambu.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Verificar la importación",
          blocks: [
            {
              type: "ul",
              items: [
                "Filamento de usuario listado",
                "Impresora/boquilla correctos",
                "Temperaturas / flujo / volumétrico coinciden",
                "El rebanado usa el filamento importado",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Solución de problemas",
          blocks: [
            {
              type: "ul",
              items: [
                "No visible — limpia filtros; confirma que la base de herencia existe.",
                "Rechazado — no uses el JSON de intercambio OpenFilamentProfile.",
                "Desajuste AMS — mapea el slot manualmente al preset de usuario.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Eliminar o reemplazar el perfil",
          blocks: [
            {
              type: "p",
              text: "Elimina el filamento de usuario en Bambu Studio o importa una descarga más reciente de OpenFilament con un nombre de archivo distinto.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitaciones conocidas",
          blocks: [
            {
              type: "ul",
              items: [
                "Soporte beta",
                "Solo filamento",
                "Sin escritura RFID Bambu",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Fuentes y compatibilidad",
          blocks: [
            {
              type: "ul",
              items: [
                "File → Import → Import Configs (Studio actual)",
                "Última verificación estructural: 2026-08-10",
                "Adaptador: @open-filament/slicer-bambu",
              ],
            },
          ],
        },
      ],
    ),
  },
};
