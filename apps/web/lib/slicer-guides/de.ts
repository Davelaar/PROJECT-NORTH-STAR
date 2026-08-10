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
    heading: "Unterstützte Slicer",
    lead: "OpenFilament erstellt eine Filament-Preset-Datei. Du lädst sie herunter und importierst sie in deinen Slicer. OpenFilament installiert keine Software und ändert keine lokalen Slicer-Ordner.",
    tableCaption: "Kompatibilitätsübersicht",
    interchangeTitle: "OpenFilamentProfile JSON",
    interchangeBody:
      "Kanonisches Austauschformat für Backups, Portabilität, Integrationen und Entwickler. Es ist kein Slicer-Preset und kann nicht direkt zum Drucken verwendet werden.",
    viewInstructions: "Importanleitung anzeigen",
    officialSite: "Offizielle Website",
    colSlicer: "Slicer",
    colStatus: "Status",
    colFilament: "Filament-Preset",
    colPrinter: "Drucker-Preset",
    colProcess: "Prozess-Preset",
    colInstructions: "Anleitung",
    yes: "Ja",
    no: "Nein",
    identityHeading: "Preset vs. Spulenidentität",
    identityBody:
      "Das Slicer-Filament-Preset konfiguriert Temperaturen und Extrusion. CFS/AMS/RFID identifizieren oder zuordnen die physische Spule. Der geslicte G-Code ist das, was der Drucker ausführt. Sie können sich auf denselben OpenFilament-Datensatz beziehen, sind aber nicht dieselbe Datei.",
  },
  status: {
    supported: "Unterstützt",
    beta: "Beta",
    planned: "Geplant",
    interchange: "Austauschformat",
  },
  guides: {
    "creality-print": guide(
      "Creality Print — Importanleitung",
      "Lade ein OpenFilament-Filament-Benutzer-Preset (.json) herunter und importiere es über File → Import → Import Configs. Drucker- und Prozesseinstellungen bleiben unverändert. Menünamen folgen der englischen Benutzeroberfläche von Creality Print.",
      [
        {
          id: "what",
          heading: "Was OpenFilament exportiert",
          blocks: [
            {
              type: "p",
              text: "Eine Creality-Print-kompatible Filament-Benutzer-Wrapper-JSON mit String-Array-Overrides und einer Vererbungskette (Generic/HP-Basis für deinen Drucker und deine Düse).",
            },
            {
              type: "ul",
              items: [
                "Filament-Hersteller, Typ, Farbe, Dichte, Durchmesser",
                "Düsen- und Betttemperaturen (einschließlich erster Schicht, falls bekannt)",
                "Flussverhältnis, Pressure Advance, maximaler volumetrischer Fluss",
                "Kühlungs- und Retraction-Overrides, falls vorhanden",
                "Kammertemperatur und Schrumpfung, falls vorhanden",
                "Herkunftshinweise in filament_notes",
              ],
            },
            {
              type: "p",
              text: "Enthält keine Drucker-Firmware, kein vollständiges Drucker-Preset, kein Prozess-/Druck-Preset, keinen geslicten G-Code und keine RFID-/CFS-Payloads.",
            },
          ],
        },
        {
          id: "before",
          heading: "Bevor du beginnst",
          blocks: [
            {
              type: "ul",
              items: [
                "Creality Print 6.x oder 7.x (Beta-Unterstützung)",
                "Füge deinen Drucker zuerst in Creality Print hinzu",
                "Wähle den passenden Düsendurchmesser",
                "Zum Herunterladen ist kein OpenFilament-Konto erforderlich",
                "Optional: Bestehende Benutzer-Presets sichern (File → Export → Export Presets)",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Von OpenFilament herunterladen",
          blocks: [
            {
              type: "ol",
              items: [
                "Finde das Filament (Suche / Katalog).",
                "Öffne die Farbe / Variante.",
                "Wähle Drucker und Düse.",
                "Wähle ein Kalibrierungsprofil.",
                "Öffne Download for slicer / Export und wähle Creality Print.",
                "Erstelle den Download und speichere die .json-Datei.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "In Creality Print importieren",
          blocks: [
            {
              type: "ol",
              items: [
                "Öffne Creality Print.",
                "Wähle File → Import → Import Configs.",
                "Wähle die heruntergeladene OpenFilament-.json-Datei.",
                "Bestätige, falls nach bestehenden Presets gefragt wird.",
              ],
            },
            {
              type: "note",
              text: "Bei Upgrades zwischen Hauptversionen bietet Creality möglicherweise auch \u201EImport 5.x Presets\u201C oder Migrationsaufforderungen an \u2014 dieser Weg dient der Migration alter Creality-Benutzerdaten, nicht dem üblichen OpenFilament-Download.",
            },
          ],
        },
        {
          id: "select",
          heading: "Das importierte Profil auswählen",
          blocks: [
            {
              type: "ul",
              items: [
                "Öffne die Filamentliste für dein Projekt.",
                "Finde das Benutzer-Preset mit dem Namen \u201EBrand Product Colour @Creality \u2026 nozzle\u201C.",
                "Stelle sicher, dass der aktive Drucker und die Düse zum Profil passen.",
                "System-Presets bleiben von Benutzer-Presets getrennt.",
              ],
            },
          ],
        },
        {
          id: "cfs",
          heading: "Mit physischem Filament verbinden (CFS)",
          blocks: [
            {
              type: "p",
              text: "Das importierte Preset lebt im Slicer. Die CFS-Slot-Materialidentität ist davon getrennt.",
            },
            {
              type: "ol",
              items: [
                "Lade oder bearbeite den CFS-Slot für die physische Spule.",
                "Ordne den Slot dem importierten Filament-Preset zu, wenn Creality Print nach einem Filament fragt.",
                "RFID kann Material und Farbe identifizieren; es enthält jedoch nicht das vollständige OpenFilament-Kalibrierungsprofil.",
              ],
            },
          ],
        },
        {
          id: "verify",
          heading: "Import überprüfen",
          blocks: [
            {
              type: "ul",
              items: [
                "Preset erscheint in der Filamentliste",
                "Richtiger Drucker ausgewählt",
                "Richtiger Düsendurchmesser ausgewählt",
                "Temperaturen stimmen mit dem OpenFilament-Profil überein",
                "Fluss und maximaler volumetrischer Fluss sind vorhanden",
                "Das geslicte Projekt verwendet das importierte Filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Fehlerbehebung",
          blocks: [
            {
              type: "ul",
              items: [
                "Datei abgelehnt — Stelle sicher, dass es das OpenFilament-.json-Benutzer-Preset ist, nicht das OpenFilamentProfile-Austausch-JSON.",
                "Nicht sichtbar — Filter zurücksetzen; prüfe, ob die Vererbungsbasis für deinen Drucker/deine Düse existiert.",
                "Falsche Düse — Exportiere erneut mit der richtigen Düse, oder ändere die Düse in Creality Print und wähle das Filament erneut.",
                "Doppelter Name — Benenne das ältere Benutzer-Preset um oder lösche es, bevor du erneut importierst.",
                "Alte Version — Aktualisiere auf Creality Print 6.x/7.x.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Profil entfernen oder ersetzen",
          blocks: [
            {
              type: "p",
              text: "Lösche das Benutzer-Preset aus der Filament-Benutzerliste von Creality Print, oder importiere eine neuere OpenFilament-Version (verwende vorzugsweise einen neuen Dateinamen aus einem neuen Download). Vermeide es, viele nahezu identische Revisionen aufzubewahren.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Bekannte Einschränkungen",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta: Strukturelle Tests bestanden; breitere manuelle Überprüfung läuft.",
                "Nur Filament — kein Drucker-/Prozess-Export.",
                "Exotische Materialien erben möglicherweise eine Generic-Basis, die für diesen Typ unvollständig ist.",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Quellen und Kompatibilität",
          blocks: [
            {
              type: "ul",
              items: [
                "Unterstützte Versionen: 6.x, 7.x (Beta)",
                "Letzte strukturelle Überprüfung: 2026-08-10",
                "Adapter: @open-filament/slicer-creality",
                "Forschungsnotizen: docs/SLICER_IMPORT_SOURCES.md",
              ],
            },
          ],
        },
      ],
    ),
    orcaslicer: guide(
      "OrcaSlicer — Importanleitung",
      "Lade ein OpenFilament-Filament-JSON-Preset herunter und importiere es über File → Import → Import Configs. Menünamen folgen der englischen Benutzeroberfläche / dem Wiki von OrcaSlicer.",
      [
        {
          id: "what",
          heading: "Was OpenFilament exportiert",
          blocks: [
            {
              type: "p",
              text: "Ein OrcaSlicer-Filament-Benutzer-Preset-JSON (type: filament) mit inherits wie Generic ASA @K2 Plus-all, plus Temperaturen, Fluss, PA, volumetrisches Limit, Kühlung und Retraction, falls bekannt.",
            },
            {
              type: "p",
              text: "Enthält keine Drucker- oder Prozess-Presets, keinen G-Code und keine RFID-Daten.",
            },
          ],
        },
        {
          id: "before",
          heading: "Bevor du beginnst",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer 2.0+ empfohlen (Beta)",
                "Installiere/wähle zuerst dein Druckerprofil",
                "Optionales Backup: File → Export → Export Preset Bundle",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Von OpenFilament herunterladen",
          blocks: [
            {
              type: "ol",
              items: [
                "Finde Filament → Variante → Drucker/Düse → Profil.",
                "Wähle OrcaSlicer auf der Seite Export / Download for slicer.",
                "Erstelle den Download und speichere die .json-Datei.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "In OrcaSlicer importieren",
          blocks: [
            {
              type: "ol",
              items: [
                "Öffne OrcaSlicer.",
                "Wähle File → Import → Import Configs (Wiki: Preset Configs).",
                "Wähle das OpenFilament-.json-Filament-Preset.",
                "Bestätige das Überschreiben, falls ein Preset mit demselben Namen existiert.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Das importierte Profil auswählen",
          blocks: [
            {
              type: "ul",
              items: [
                "Öffne das Filament-Dropdown.",
                "Finde das Benutzer-Preset (Marke / Produkt / Farbe).",
                "Falls nicht sichtbar: Filament settings → Dependencies — aktiviere deinen Drucker/deine Düse.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Mit physischem Filament verbinden",
          blocks: [
            {
              type: "p",
              text: "Wähle für eine externe Spule das importierte Filament auf dem Prepare-Tab. Für AMS/CFS-ähnliches Mapping in Orca ordne den Slot nur dann diesem Benutzer-Filament zu, wenn dein Druckerprofil dies unterstützt — OpenFilament schreibt kein RFID automatisch.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Import überprüfen",
          blocks: [
            {
              type: "ul",
              items: [
                "Preset unter Benutzer-Filamenten aufgeführt",
                "Drucker und Düse aktiv",
                "Temperaturen / Fluss / maximaler volumetrischer Fluss stimmen überein",
                "Projekt wird mit diesem Filament geslict",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Fehlerbehebung",
          blocks: [
            {
              type: "ul",
              items: [
                "Ungültige Konfiguration — Stelle sicher, dass es JSON ist (nicht Prusa .ini).",
                "Nach Import versteckt — Korrigiere compatible_printers / Dependencies.",
                "Falsche Vererbungsbasis — Exportiere erneut nach Auswahl eines passenderen Druckermodells.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Profil entfernen oder ersetzen",
          blocks: [
            {
              type: "p",
              text: "Lösche das Benutzer-Filament-Preset in OrcaSlicer, oder importiere einen neueren OpenFilament-Download. Verwende vorzugsweise unterschiedliche Revisionsdateinamen von OpenFilament.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Bekannte Einschränkungen",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta-Unterstützung",
                "Nur Filament-Export",
                "Erbt Generic @printer-all-Basen",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Quellen und Kompatibilität",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer Wiki import_export",
                "Letzte strukturelle Überprüfung: 2026-08-10",
                "Adapter: @open-filament/slicer-orca",
              ],
            },
          ],
        },
      ],
    ),
    prusaslicer: guide(
      "PrusaSlicer — Importanleitung",
      "Lade ein OpenFilament-Filament-Config-Bundle (.ini) herunter und importiere es über File → Import → Import Config Bundle…. Menünamen folgen der englischen Benutzeroberfläche von PrusaSlicer / der Prusa Knowledge Base.",
      [
        {
          id: "what",
          heading: "Was OpenFilament exportiert",
          blocks: [
            {
              type: "p",
              text: "Ein PrusaSlicer-Config-Bundle mit einer [filament:…]-Sektion mit inherits (*PLA*, *PET*, *ABS*, *FLEX*), Temperaturen, Extrusionsmultiplikator, volumetrischem Limit, Lüftern und Notizen. Pressure Advance ist ein start_filament_gcode-Hinweis.",
            },
            {
              type: "p",
              text: "Kein Drucker-Preset, kein Druck-/Prozess-Preset, kein G-Code und keine RFID-Daten.",
            },
          ],
        },
        {
          id: "before",
          heading: "Bevor du beginnst",
          blocks: [
            {
              type: "ul",
              items: [
                "PrusaSlicer 2.7+ (Beta; strukturell getestet bis 2.9.x-Felder)",
                "Konfiguriere deinen Drucker zuerst in PrusaSlicer",
                "Optional: File → Export → Export Config Bundle für Backup",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Von OpenFilament herunterladen",
          blocks: [
            {
              type: "ol",
              items: [
                "Finde Filament → Variante → Drucker/Düse → Profil.",
                "Wähle PrusaSlicer auf Export / Download for slicer.",
                "Erstelle den Download und speichere die .ini-Datei.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "In PrusaSlicer importieren",
          blocks: [
            {
              type: "ol",
              items: [
                "Öffne PrusaSlicer.",
                "Wähle File → Import → Import Config Bundle…",
                "Wähle die OpenFilament-.ini-Datei.",
              ],
            },
            {
              type: "note",
              text: "Verwende Import Config Bundle für diese Datei (es ist ein kleines Bundle mit einer Filament-Sektion). Import Config ist für ein einzelnes kombiniertes Profil / G-Code — nicht der übliche OpenFilament-Weg.",
            },
          ],
        },
        {
          id: "select",
          heading: "Das importierte Profil auswählen",
          blocks: [
            {
              type: "ul",
              items: [
                "Öffne Filament Settings.",
                "Wähle das benutzerdefinierte Preset (Marke / Produkt / Farbe).",
                "Bestätige Drucker und Düse auf dem Plater vor dem Slicen.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Mit physischem Filament verbinden",
          blocks: [
            {
              type: "p",
              text: "PrusaSlicer ordnet RFID von Drittanbietern nicht automatisch zu. Wähle das importierte Filament-Preset auf dem Plater für die eingelegte Spule. Es gibt keine automatische OpenFilament-Material-System-Integration.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Import überprüfen",
          blocks: [
            {
              type: "ul",
              items: [
                "Benutzerdefiniertes Filament erscheint in der Liste",
                "Temperaturen und Extrusionsmultiplikator stimmen überein",
                "Slice verwendet das ausgewählte Filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Fehlerbehebung",
          blocks: [
            {
              type: "ul",
              items: [
                "Nichts importiert — Verwende Import Config Bundle, nicht Import Config.",
                "Falsche Erweiterung — Behalte .ini bei (nicht als .txt speichern).",
                "ASA verwendet *ABS* inherit — das ist bei Standard-Templates erwartet.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Profil entfernen oder ersetzen",
          blocks: [
            {
              type: "p",
              text: "Entferne das benutzerdefinierte Filament-Preset in PrusaSlicer, oder importiere eine neuere OpenFilament-.ini. Benenne lokal um, wenn du angepasste Werte behalten möchtest.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Bekannte Einschränkungen",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta-Unterstützung",
                "Nur Filament-Bundle",
                "PA über G-Code-Hinweis",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Quellen und Kompatibilität",
          blocks: [
            {
              type: "ul",
              items: [
                "Prusa Knowledge Base Artikel 382766",
                "Letzte strukturelle Überprüfung: 2026-08-10",
                "Adapter: @open-filament/slicer-prusa",
              ],
            },
          ],
        },
      ],
    ),
    "bambu-studio": guide(
      "Bambu Studio — Importanleitung",
      "Lade ein OpenFilament-Filament-JSON-Benutzer-Preset herunter und importiere es über File → Import → Import Configs. Menünamen folgen der aktuellen englischen Benutzeroberfläche von Bambu Studio.",
      [
        {
          id: "what",
          heading: "Was OpenFilament exportiert",
          blocks: [
            {
              type: "p",
              text: "Ein Bambu Studio / SoftFever-Familie Filament-Benutzer-Preset-JSON mit inherits (Generic {material} [@printer]), Temperaturen, Fluss, PA, volumetrischem Limit, Kühlung, Retraction und Notizen.",
            },
            {
              type: "p",
              text: "Keine Drucker-/Prozess-Presets, kein G-Code und keine Bambu-RFID-Schreibunterstützung durch OpenFilament.",
            },
          ],
        },
        {
          id: "before",
          heading: "Bevor du beginnst",
          blocks: [
            {
              type: "ul",
              items: [
                "Bambu Studio 1.9+ / 2.0+ (Beta)",
                "Wähle zuerst deinen Drucker und deine Düse in Studio",
                "Optional: Backup der Benutzer-Presets exportieren",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Von OpenFilament herunterladen",
          blocks: [
            {
              type: "ol",
              items: [
                "Finde Filament → Variante → Drucker/Düse → Profil.",
                "Wähle Bambu Studio auf Export / Download for slicer.",
                "Erstelle den Download und speichere die .json-Datei.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "In Bambu Studio importieren",
          blocks: [
            {
              type: "ol",
              items: [
                "Öffne Bambu Studio.",
                "Wähle File → Import → Import Configs.",
                "Wähle das OpenFilament-.json-Filament-Preset.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Das importierte Profil auswählen",
          blocks: [
            {
              type: "ul",
              items: [
                "Öffne Filamentauswahl → User / Custom filaments.",
                "Setze Drucker-/Düsenfilter zurück, falls das Preset versteckt ist.",
                "Wähle das importierte Preset für die Platte.",
              ],
            },
          ],
        },
        {
          id: "ams",
          heading: "Mit physischem Filament verbinden (AMS)",
          blocks: [
            {
              type: "p",
              text: "Die AMS-Materialidentität ist vom Slicer-Preset getrennt. Ordne den AMS-Slot dem importierten Benutzer-Filament in Studios AMS- / Filament-Mapping-Oberfläche zu. OpenFilament beansprucht kein RFID-Schreiben auf Bambu-Tags durch Drittanbieter.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Import überprüfen",
          blocks: [
            {
              type: "ul",
              items: [
                "Benutzer-Filament aufgeführt",
                "Drucker/Düse korrekt",
                "Temperaturen / Fluss / volumetrischer Fluss stimmen überein",
                "Slice verwendet das importierte Filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Fehlerbehebung",
          blocks: [
            {
              type: "ul",
              items: [
                "Nicht sichtbar — Filter zurücksetzen; Vererbungsbasis bestätigen.",
                "Abgelehnt — Verwende nicht das OpenFilamentProfile-Austausch-JSON.",
                "AMS-Zuordnungsfehler — Ordne den Slot manuell dem Benutzer-Preset zu.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Profil entfernen oder ersetzen",
          blocks: [
            {
              type: "p",
              text: "Entferne das Benutzer-Filament in Bambu Studio oder importiere einen neueren OpenFilament-Download mit einem anderen Dateinamen.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Bekannte Einschränkungen",
          blocks: [
            {
              type: "ul",
              items: [
                "Beta-Unterstützung",
                "Nur Filament",
                "Kein Bambu-RFID-Schreiben",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Quellen und Kompatibilität",
          blocks: [
            {
              type: "ul",
              items: [
                "File → Import → Import Configs (aktuelles Studio)",
                "Letzte strukturelle Überprüfung: 2026-08-10",
                "Adapter: @open-filament/slicer-bambu",
              ],
            },
          ],
        },
      ],
    ),
  },
};
