/**
 * Dutch (Nederlands) slicer instruction guide content.
 * Menu names stay in official English where the slicer UI does.
 */

import type {
  GuidesBundle,
  GuideSection,
  SlicerGuide,
} from "./en";

function guide(
  title: string,
  lead: string,
  sections: GuideSection[],
): SlicerGuide {
  return { title, lead, sections };
}

export const guides: GuidesBundle = {
  overview: {
    heading: "Ondersteunde slicers",
    lead: "OpenFilament maakt een filament-presetbestand aan. Je downloadt het en importeert het in je slicer. OpenFilament installeert geen software en wijzigt geen lokale slicermappen.",
    tableCaption: "Compatibiliteitsoverzicht",
    interchangeTitle: "OpenFilamentProfile JSON",
    interchangeBody:
      "Canoniek uitwisselingsformaat voor back-ups, portabiliteit, integraties en ontwikkelaars. Het is geen slicer-preset en kan niet rechtstreeks worden geprint.",
    viewInstructions: "Bekijk importinstructies",
    officialSite: "Officiële website",
    colSlicer: "Slicer",
    colStatus: "Status",
    colFilament: "Filament-preset",
    colPrinter: "Printer-preset",
    colProcess: "Proces-preset",
    colInstructions: "Instructies",
    yes: "Ja",
    no: "Nee",
    identityHeading: "Preset vs. spoelidentiteit",
    identityBody:
      "De slicer filament-preset configureert temperaturen en extrusie. CFS/AMS/RFID identificeren of koppelen de fysieke spoel. Geslicete G-code is wat de printer uitvoert. Ze kunnen naar hetzelfde OpenFilament-record verwijzen, maar het zijn niet dezelfde bestanden.",
  },
  status: {
    supported: "Ondersteund",
    beta: "Bèta",
    planned: "Gepland",
    interchange: "Uitwisselingsformaat",
  },
  guides: {
    "creality-print": guide(
      "Creality Print — importinstructies",
      "Download een OpenFilament filament-gebruikerspreset (.json) en importeer deze via File → Import → Import Configs. Printer- en procesinstellingen blijven ongewijzigd. Menunamen volgen de Engelse UI van Creality Print.",
      [
        {
          id: "what",
          heading: "Wat OpenFilament exporteert",
          blocks: [
            {
              type: "p",
              text: "Een Creality Print–stijl filament-gebruikerswrapper-JSON met string-array-overschrijvingen en een inherits-keten (Generic/HP-basis voor je printer en nozzle).",
            },
            {
              type: "ul",
              items: [
                "Filamentmerk, type, kleur, dichtheid, diameter",
                "Nozzle- en bedtemperaturen (inclusief eerste laag indien bekend)",
                "Stroomverhouding, pressure advance, maximaal volumetrisch debiet",
                "Koeling- en retractie-overschrijvingen indien aanwezig",
                "Kamertemperatuur en krimp indien aanwezig",
                "Herkomstnotities in filament_notes",
              ],
            },
            {
              type: "p",
              text: "Het bevat geen printerfirmware, volledig printer-preset, proces-/printpreset, geslicete G-code of RFID/CFS-payloads.",
            },
          ],
        },
        {
          id: "before",
          heading: "Voordat je begint",
          blocks: [
            {
              type: "ul",
              items: [
                "Creality Print 6.x of 7.x (bèta-ondersteuning)",
                "Voeg eerst je printer toe in Creality Print",
                "Selecteer de juiste nozzlediameter",
                "Geen OpenFilament-account nodig om te downloaden",
                "Optioneel: maak een back-up van bestaande gebruikerspresets (File → Export → Export Presets)",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Downloaden van OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Zoek het filament (Zoeken / catalogus).",
                "Open de kleur / variant.",
                "Kies printer en nozzle.",
                "Kies een kalibratieprofiel.",
                "Open Download for slicer / Export en kies Creality Print.",
                "Maak de download aan en sla het .json-bestand op.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importeren in Creality Print",
          blocks: [
            {
              type: "ol",
              items: [
                "Open Creality Print.",
                "Kies File → Import → Import Configs.",
                "Selecteer het gedownloade OpenFilament .json-bestand.",
                "Bevestig als er gevraagd wordt over bestaande presets.",
              ],
            },
            {
              type: "note",
              text: "Bij upgrades tussen hoofdversies kan Creality ook \u201CImport 5.x Presets\u201D of migratieprompts aanbieden \u2014 dat pad is voor het migreren van oude Creality-gebruikersdata, niet voor de gebruikelijke OpenFilament-download.",
            },
          ],
        },
        {
          id: "select",
          heading: "Het geïmporteerde profiel selecteren",
          blocks: [
            {
              type: "ul",
              items: [
                "Open de filamentlijst voor je project.",
                "Zoek de gebruikerspreset met een naam als \u201CMerk Product Kleur @Creality \u2026 nozzle\u201D.",
                "Controleer of de actieve printer en nozzle overeenkomen met het profiel.",
                "Systeempresets blijven gescheiden van gebruikerspresets.",
              ],
            },
          ],
        },
        {
          id: "cfs",
          heading: "Koppelen aan fysiek filament (CFS)",
          blocks: [
            {
              type: "p",
              text: "De geïmporteerde preset bevindt zich in de slicer. De materiaalidentiteit van het CFS-slot is afzonderlijk.",
            },
            {
              type: "ol",
              items: [
                "Laad of bewerk het CFS-slot voor de fysieke spoel.",
                "Koppel het slot aan de geïmporteerde filament-preset wanneer Creality Print om een filament vraagt.",
                "RFID kan materiaal en kleur identificeren; het bevat niet het volledige OpenFilament-kalibratieprofiel.",
              ],
            },
          ],
        },
        {
          id: "verify",
          heading: "De import verifiëren",
          blocks: [
            {
              type: "ul",
              items: [
                "Preset verschijnt in de filamentlijst",
                "Juiste printer geselecteerd",
                "Juiste nozzlediameter geselecteerd",
                "Temperaturen komen overeen met het OpenFilament-profiel",
                "Stroom en maximaal volumetrisch debiet zijn aanwezig",
                "Het geslicete project gebruikt het geïmporteerde filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Probleemoplossing",
          blocks: [
            {
              type: "ul",
              items: [
                "Bestand geweigerd — controleer of het de OpenFilament .json-gebruikerspreset is, niet de OpenFilamentProfile interchange JSON.",
                "Niet zichtbaar — wis filters; controleer of de inherits-basis bestaat voor je printer/nozzle.",
                "Verkeerde nozzle — exporteer opnieuw met de juiste nozzle, of wijzig de nozzle in Creality Print en selecteer het filament opnieuw.",
                "Dubbele naam — hernoem of verwijder de oudere gebruikerspreset vóór opnieuw importeren.",
                "Oude versie — update naar Creality Print 6.x/7.x.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Het profiel verwijderen of vervangen",
          blocks: [
            {
              type: "p",
              text: "Verwijder de gebruikerspreset uit de filament-gebruikerslijst van Creality Print, of importeer een nieuwere OpenFilament-revisie (gebruik bij voorkeur een andere bestandsnaam uit een nieuwe download). Vermijd het bewaren van veel bijna-dubbele revisies.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Bekende beperkingen",
          blocks: [
            {
              type: "ul",
              items: [
                "Bèta: structurele tests slagen; bredere handmatige verificatie loopt.",
                "Alleen filament — geen printer-/procesexport.",
                "Exotische materialen kunnen een Generic-basis erven die onvolledig is voor dat type.",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Bronnen en compatibiliteit",
          blocks: [
            {
              type: "ul",
              items: [
                "Ondersteunde versies: 6.x, 7.x (bèta)",
                "Laatste structurele verificatie: 2026-08-10",
                "Adapter: @open-filament/slicer-creality",
                "Onderzoeksnotities: docs/SLICER_IMPORT_SOURCES.md",
              ],
            },
          ],
        },
      ],
    ),
    orcaslicer: guide(
      "OrcaSlicer — importinstructies",
      "Download een OpenFilament filament JSON-preset en importeer deze via File → Import → Import Configs. Menunamen volgen de Engelse UI / wiki van OrcaSlicer.",
      [
        {
          id: "what",
          heading: "Wat OpenFilament exporteert",
          blocks: [
            {
              type: "p",
              text: "Een OrcaSlicer filament-gebruikerspreset JSON (type: filament) met inherits zoals Generic ASA @K2 Plus-all, plus temperaturen, stroom, PA, volumetrische limiet, koeling en retractie indien bekend.",
            },
            {
              type: "p",
              text: "Het bevat geen printer- of procespresets, G-code of RFID-data.",
            },
          ],
        },
        {
          id: "before",
          heading: "Voordat je begint",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer 2.0+ aanbevolen (bèta)",
                "Installeer/selecteer eerst je printerprofiel",
                "Optionele back-up: File → Export → Export Preset Bundle",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Downloaden van OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Zoek filament → variant → printer/nozzle → profiel.",
                "Kies OrcaSlicer op de Export / Download for slicer-pagina.",
                "Maak de download aan en sla het .json-bestand op.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importeren in OrcaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Open OrcaSlicer.",
                "Kies File → Import → Import Configs (wiki: Preset Configs).",
                "Selecteer de OpenFilament .json filament-preset.",
                "Bevestig overschrijven als er al een preset met dezelfde naam bestaat.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Het geïmporteerde profiel selecteren",
          blocks: [
            {
              type: "ul",
              items: [
                "Open het Filament-dropdown.",
                "Zoek de gebruikerspreset (merk / product / kleur).",
                "Indien niet zichtbaar: Filament settings → Dependencies — schakel je printer/nozzle in.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Koppelen aan fysiek filament",
          blocks: [
            {
              type: "p",
              text: "Selecteer voor een externe spoel het geïmporteerde filament op het voorbereidingstabblad. Voor AMS/CFS-stijl koppeling in Orca, koppel het slot aan dit gebruikersfilament alleen als je printerprofiel dit ondersteunt — OpenFilament schrijft geen RFID automatisch.",
            },
          ],
        },
        {
          id: "verify",
          heading: "De import verifiëren",
          blocks: [
            {
              type: "ul",
              items: [
                "Preset staat onder gebruikersfilamenten",
                "Printer en nozzle actief",
                "Temperaturen / stroom / maximaal volumetrisch debiet komen overeen",
                "Project slicet met dit filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Probleemoplossing",
          blocks: [
            {
              type: "ul",
              items: [
                "Ongeldige configuratie — zorg dat het JSON is (niet Prusa .ini).",
                "Verborgen na import — corrigeer compatible_printers / Dependencies.",
                "Verkeerde inherit-basis — exporteer opnieuw na het kiezen van een beter passend printermodel.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Het profiel verwijderen of vervangen",
          blocks: [
            {
              type: "p",
              text: "Verwijder de gebruikersfilament-preset in OrcaSlicer, of importeer een nieuwere OpenFilament-download. Gebruik bij voorkeur verschillende revisiebestandsnamen van OpenFilament.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Bekende beperkingen",
          blocks: [
            {
              type: "ul",
              items: [
                "Bèta-ondersteuning",
                "Alleen filament-export",
                "Erft Generic @printer-all-stijl bases",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Bronnen en compatibiliteit",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer wiki import_export",
                "Laatste structurele verificatie: 2026-08-10",
                "Adapter: @open-filament/slicer-orca",
              ],
            },
          ],
        },
      ],
    ),
    prusaslicer: guide(
      "PrusaSlicer — importinstructies",
      "Download een OpenFilament filament config bundle (.ini) en importeer deze via File → Import → Import Config Bundle…. Menunamen volgen de Engelse UI / Prusa Knowledge Base van PrusaSlicer.",
      [
        {
          id: "what",
          heading: "Wat OpenFilament exporteert",
          blocks: [
            {
              type: "p",
              text: "Een PrusaSlicer config bundle met één [filament:…]-sectie met inherits (*PLA*, *PET*, *ABS*, *FLEX*), temperaturen, extrusiemultiplicator, volumetrische limiet, ventilatoren en notities. Pressure advance is een start_filament_gcode-hint.",
            },
            {
              type: "p",
              text: "Geen printer-preset, print-/procespreset, G-code of RFID-data.",
            },
          ],
        },
        {
          id: "before",
          heading: "Voordat je begint",
          blocks: [
            {
              type: "ul",
              items: [
                "PrusaSlicer 2.7+ (bèta; structureel getest t/m 2.9.x-velden)",
                "Configureer eerst je printer in PrusaSlicer",
                "Optioneel: File → Export → Export Config Bundle voor back-up",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Downloaden van OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Zoek filament → variant → printer/nozzle → profiel.",
                "Kies PrusaSlicer op Export / Download for slicer.",
                "Maak de download aan en sla het .ini-bestand op.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importeren in PrusaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Open PrusaSlicer.",
                "Kies File → Import → Import Config Bundle…",
                "Selecteer het OpenFilament .ini-bestand.",
              ],
            },
            {
              type: "note",
              text: "Gebruik Import Config Bundle voor dit bestand (het is een kleine bundle met een filamentsectie). Import Config is voor een enkel gecombineerd profiel / G-code — niet het gebruikelijke OpenFilament-pad.",
            },
          ],
        },
        {
          id: "select",
          heading: "Het geïmporteerde profiel selecteren",
          blocks: [
            {
              type: "ul",
              items: [
                "Open Filament Settings.",
                "Selecteer de aangepaste preset (merk / product / kleur).",
                "Controleer printer en nozzle op de plater voordat je slicet.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Koppelen aan fysiek filament",
          blocks: [
            {
              type: "p",
              text: "PrusaSlicer koppelt niet automatisch RFID van derden. Selecteer de geïmporteerde filament-preset op de plater voor de spoel die je hebt geladen. Er is geen automatische OpenFilament-materiaalssysteemintegratie.",
            },
          ],
        },
        {
          id: "verify",
          heading: "De import verifiëren",
          blocks: [
            {
              type: "ul",
              items: [
                "Aangepast filament verschijnt in de lijst",
                "Temperaturen en extrusiemultiplicator komen overeen",
                "Slice gebruikt het geselecteerde filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Probleemoplossing",
          blocks: [
            {
              type: "ul",
              items: [
                "Niets geïmporteerd — gebruik Import Config Bundle, niet Import Config.",
                "Verkeerde extensie — behoud .ini (laat het niet als .txt staan).",
                "ASA gebruikt *ABS* inherit — verwacht bij standaardsjablonen.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Het profiel verwijderen of vervangen",
          blocks: [
            {
              type: "p",
              text: "Verwijder de aangepaste filament-preset in PrusaSlicer, of importeer een nieuwer OpenFilament .ini-bestand. Hernoem lokaal als je aangepaste waarden wilt behouden.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Bekende beperkingen",
          blocks: [
            {
              type: "ul",
              items: [
                "Bèta-ondersteuning",
                "Alleen filament-bundle",
                "PA via gcode-hint",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Bronnen en compatibiliteit",
          blocks: [
            {
              type: "ul",
              items: [
                "Prusa Knowledge Base artikel 382766",
                "Laatste structurele verificatie: 2026-08-10",
                "Adapter: @open-filament/slicer-prusa",
              ],
            },
          ],
        },
      ],
    ),
    "bambu-studio": guide(
      "Bambu Studio — importinstructies",
      "Download een OpenFilament filament JSON-gebruikerspreset en importeer deze via File → Import → Import Configs. Menunamen volgen de huidige Engelse UI van Bambu Studio.",
      [
        {
          id: "what",
          heading: "Wat OpenFilament exporteert",
          blocks: [
            {
              type: "p",
              text: "Een Bambu Studio / SoftFever-familie filament-gebruikerspreset JSON met inherits (Generic {material} [@printer]), temperaturen, stroom, PA, volumetrische limiet, koeling, retractie en notities.",
            },
            {
              type: "p",
              text: "Geen printer-/procespresets, G-code of Bambu RFID-schrijfondersteuning vanuit OpenFilament.",
            },
          ],
        },
        {
          id: "before",
          heading: "Voordat je begint",
          blocks: [
            {
              type: "ul",
              items: [
                "Bambu Studio 1.9+ / 2.0+ (bèta)",
                "Selecteer eerst je printer en nozzle in Studio",
                "Optioneel: exporteer een back-up van gebruikerspresets",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Downloaden van OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Zoek filament → variant → printer/nozzle → profiel.",
                "Kies Bambu Studio op Export / Download for slicer.",
                "Maak de download aan en sla het .json-bestand op.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importeren in Bambu Studio",
          blocks: [
            {
              type: "ol",
              items: [
                "Open Bambu Studio.",
                "Kies File → Import → Import Configs.",
                "Selecteer de OpenFilament .json filament-preset.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Het geïmporteerde profiel selecteren",
          blocks: [
            {
              type: "ul",
              items: [
                "Open filamentselectie → Gebruiker / Aangepaste filamenten.",
                "Wis printer-/nozzlefilters als de preset verborgen is.",
                "Selecteer de geïmporteerde preset voor de plaat.",
              ],
            },
          ],
        },
        {
          id: "ams",
          heading: "Koppelen aan fysiek filament (AMS)",
          blocks: [
            {
              type: "p",
              text: "De AMS-materiaalidentiteit staat los van de slicer-preset. Koppel het AMS-slot aan het geïmporteerde gebruikersfilament in de AMS- / filamentkoppelings-UI van Studio. OpenFilament claimt geen RFID-schrijfmogelijkheid naar Bambu-tags van derden.",
            },
          ],
        },
        {
          id: "verify",
          heading: "De import verifiëren",
          blocks: [
            {
              type: "ul",
              items: [
                "Gebruikersfilament staat in de lijst",
                "Printer/nozzle correct",
                "Temperaturen / stroom / volumetrisch debiet komen overeen",
                "Slice gebruikt het geïmporteerde filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Probleemoplossing",
          blocks: [
            {
              type: "ul",
              items: [
                "Niet zichtbaar — wis filters; controleer of de inherit-basis bestaat.",
                "Geweigerd — gebruik niet de OpenFilamentProfile interchange JSON.",
                "AMS-verschil — koppel het slot handmatig aan de gebruikerspreset.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Het profiel verwijderen of vervangen",
          blocks: [
            {
              type: "p",
              text: "Verwijder het gebruikersfilament in Bambu Studio of importeer een nieuwere OpenFilament-download met een andere bestandsnaam.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Bekende beperkingen",
          blocks: [
            {
              type: "ul",
              items: [
                "Bèta-ondersteuning",
                "Alleen filament",
                "Geen Bambu RFID-schrijfmogelijkheid",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Bronnen en compatibiliteit",
          blocks: [
            {
              type: "ul",
              items: [
                "File → Import → Import Configs (huidige Studio)",
                "Laatste structurele verificatie: 2026-08-10",
                "Adapter: @open-filament/slicer-bambu",
              ],
            },
          ],
        },
      ],
    ),
  },
};
