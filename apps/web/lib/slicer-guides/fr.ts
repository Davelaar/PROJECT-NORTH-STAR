/**
 * French (Français) slicer instruction guide content.
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
    heading: "Slicers pris en charge",
    lead: "OpenFilament crée un fichier de préréglage filament. Vous le téléchargez et l'importez dans votre slicer. OpenFilament n'installe aucun logiciel et ne modifie pas les dossiers locaux du slicer.",
    tableCaption: "Aperçu de la compatibilité",
    interchangeTitle: "OpenFilamentProfile JSON",
    interchangeBody:
      "Format d'échange canonique pour les sauvegardes, la portabilité, les intégrations et les développeurs. Ce n'est pas un préréglage slicer et il ne peut pas être imprimé directement.",
    viewInstructions: "Voir les instructions d'importation",
    officialSite: "Site officiel",
    colSlicer: "Slicer",
    colStatus: "Statut",
    colFilament: "Préréglage filament",
    colPrinter: "Préréglage imprimante",
    colProcess: "Préréglage processus",
    colInstructions: "Instructions",
    yes: "Oui",
    no: "Non",
    identityHeading: "Préréglage vs identité de la bobine",
    identityBody:
      "Le préréglage filament du slicer configure les températures et l'extrusion. CFS/AMS/RFID identifient ou mappent la bobine physique. Le G-code découpé est ce que l'imprimante exécute. Ils peuvent se référer au même enregistrement OpenFilament, mais ce ne sont pas le même fichier.",
  },
  status: {
    supported: "Pris en charge",
    beta: "Bêta",
    planned: "Prévu",
    interchange: "Format d'échange",
  },
  guides: {
    "creality-print": guide(
      "Creality Print — instructions d'importation",
      "Téléchargez un préréglage filament utilisateur OpenFilament (.json) et importez-le avec File → Import → Import Configs. Les paramètres d'imprimante et de processus restent inchangés. Les noms de menus suivent l'interface anglaise de Creality Print.",
      [
        {
          id: "what",
          heading: "Ce qu'OpenFilament exporte",
          blocks: [
            {
              type: "p",
              text: "Un JSON de préréglage filament utilisateur au format Creality Print, avec des overrides en tableaux de chaînes et une chaîne d'héritage (base Generic/HP pour votre imprimante et buse).",
            },
            {
              type: "ul",
              items: [
                "Fabricant, type, couleur, densité et diamètre du filament",
                "Températures de buse et de plateau (y compris première couche si connues)",
                "Ratio de débit, pressure advance, débit volumétrique max.",
                "Overrides de refroidissement et de rétraction si présents",
                "Température de chambre et retrait si présents",
                "Notes de provenance dans filament_notes",
              ],
            },
            {
              type: "p",
              text: "N'inclut pas le firmware imprimante, un préréglage imprimante complet, un préréglage processus/impression, du G-code découpé ni de données RFID/CFS.",
            },
          ],
        },
        {
          id: "before",
          heading: "Avant de commencer",
          blocks: [
            {
              type: "ul",
              items: [
                "Creality Print 6.x ou 7.x (support Bêta)",
                "Ajoutez d'abord votre imprimante dans Creality Print",
                "Sélectionnez le diamètre de buse correspondant",
                "Aucun compte OpenFilament requis pour télécharger",
                "Facultatif : sauvegardez les préréglages utilisateur existants (File → Export → Export Presets)",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Télécharger depuis OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Trouvez le filament (Recherche / catalogue).",
                "Ouvrez la couleur / variante.",
                "Choisissez imprimante et buse.",
                "Choisissez un profil de calibration.",
                "Ouvrez Télécharger pour le slicer / Export et choisissez Creality Print.",
                "Créez le téléchargement et enregistrez le fichier .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importer dans Creality Print",
          blocks: [
            {
              type: "ol",
              items: [
                "Ouvrez Creality Print.",
                "Choisissez File → Import → Import Configs.",
                "Sélectionnez le fichier .json OpenFilament téléchargé.",
                "Confirmez si on vous demande à propos de préréglages existants.",
              ],
            },
            {
              type: "note",
              text: "Lors de mises à jour entre versions majeures, Creality peut aussi proposer « Import 5.x Presets » ou des invites de migration — ce chemin est pour migrer d'anciennes données utilisateur Creality, pas le téléchargement OpenFilament habituel.",
            },
          ],
        },
        {
          id: "select",
          heading: "Sélectionner le profil importé",
          blocks: [
            {
              type: "ul",
              items: [
                "Ouvrez la liste de filaments de votre projet.",
                "Trouvez le préréglage utilisateur nommé comme « Marque Produit Couleur @Creality … buse ».",
                "Vérifiez que l'imprimante et la buse actives correspondent au profil.",
                "Les préréglages système restent séparés des préréglages utilisateur.",
              ],
            },
          ],
        },
        {
          id: "cfs",
          heading: "Associer au filament physique (CFS)",
          blocks: [
            {
              type: "p",
              text: "Le préréglage importé est dans le slicer. L'identité du matériau du slot CFS est séparée.",
            },
            {
              type: "ol",
              items: [
                "Chargez ou éditez le slot CFS pour la bobine physique.",
                "Associez le slot au préréglage filament importé quand Creality Print demande un filament.",
                "Le RFID peut identifier le matériau et la couleur ; il ne contient pas le profil de calibration OpenFilament complet.",
              ],
            },
          ],
        },
        {
          id: "verify",
          heading: "Vérifier l'importation",
          blocks: [
            {
              type: "ul",
              items: [
                "Le préréglage apparaît dans la liste de filaments",
                "Imprimante correcte sélectionnée",
                "Diamètre de buse correct sélectionné",
                "Les températures correspondent au profil OpenFilament",
                "Le débit et le débit volumétrique max. sont présents",
                "Le projet découpé utilise le filament importé",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Dépannage",
          blocks: [
            {
              type: "ul",
              items: [
                "Fichier rejeté — vérifiez qu'il s'agit du préréglage utilisateur .json OpenFilament, pas du JSON d'échange OpenFilamentProfile.",
                "Non visible — effacez les filtres ; vérifiez que la base d'héritage existe pour votre imprimante/buse.",
                "Mauvaise buse — ré-exportez avec la bonne buse, ou changez de buse dans Creality Print puis re-sélectionnez le filament.",
                "Nom en double — renommez ou supprimez l'ancien préréglage utilisateur avant de ré-importer.",
                "Ancienne version — mettez à jour vers Creality Print 6.x/7.x.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Supprimer ou remplacer le profil",
          blocks: [
            {
              type: "p",
              text: "Supprimez le préréglage utilisateur de la liste de filaments de Creality Print, ou importez une révision OpenFilament plus récente (préférez un nom de fichier distinct lors d'un nouveau téléchargement). Évitez de garder plusieurs révisions quasi-identiques.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitations connues",
          blocks: [
            {
              type: "ul",
              items: [
                "Bêta : les tests structurels passent ; vérification manuelle élargie en cours.",
                "Filament uniquement — pas d'export imprimante/processus.",
                "Les matériaux exotiques peuvent hériter d'une base Generic incomplète pour ce type.",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Sources et compatibilité",
          blocks: [
            {
              type: "ul",
              items: [
                "Versions supportées : 6.x, 7.x (Bêta)",
                "Dernière vérification structurelle : 2026-08-10",
                "Adaptateur : @open-filament/slicer-creality",
                "Notes de recherche : docs/SLICER_IMPORT_SOURCES.md",
              ],
            },
          ],
        },
      ],
    ),
    orcaslicer: guide(
      "OrcaSlicer — instructions d'importation",
      "Téléchargez un préréglage filament JSON OpenFilament et importez-le avec File → Import → Import Configs. Les noms de menus suivent l'interface anglaise d'OrcaSlicer / wiki.",
      [
        {
          id: "what",
          heading: "Ce qu'OpenFilament exporte",
          blocks: [
            {
              type: "p",
              text: "Un préréglage filament utilisateur OrcaSlicer en JSON (type: filament) avec héritage tel que Generic ASA @K2 Plus-all, plus températures, débit, PA, limite volumétrique, refroidissement et rétraction si connus.",
            },
            {
              type: "p",
              text: "N'inclut pas de préréglages imprimante ou processus, de G-code ni de données RFID.",
            },
          ],
        },
        {
          id: "before",
          heading: "Avant de commencer",
          blocks: [
            {
              type: "ul",
              items: [
                "OrcaSlicer 2.0+ recommandé (Bêta)",
                "Installez/sélectionnez d'abord votre profil imprimante",
                "Sauvegarde facultative : File → Export → Export Preset Bundle",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Télécharger depuis OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Trouvez filament → variante → imprimante/buse → profil.",
                "Choisissez OrcaSlicer sur la page Export / Télécharger pour le slicer.",
                "Créez le téléchargement et enregistrez le fichier .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importer dans OrcaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Ouvrez OrcaSlicer.",
                "Choisissez File → Import → Import Configs (wiki : Preset Configs).",
                "Sélectionnez le préréglage filament .json OpenFilament.",
                "Confirmez l'écrasement si un préréglage du même nom existe.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Sélectionner le profil importé",
          blocks: [
            {
              type: "ul",
              items: [
                "Ouvrez le menu déroulant Filament.",
                "Repérez le préréglage utilisateur (marque / produit / couleur).",
                "S'il est absent : Filament settings → Dependencies — activez votre imprimante/buse.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Associer au filament physique",
          blocks: [
            {
              type: "p",
              text: "Pour une bobine externe, sélectionnez le filament importé dans l'onglet de préparation. Pour le mapping AMS/CFS dans Orca, mappez le slot vers ce filament utilisateur uniquement là où votre profil imprimante le supporte — OpenFilament n'écrit pas automatiquement le RFID.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Vérifier l'importation",
          blocks: [
            {
              type: "ul",
              items: [
                "Préréglage listé sous filaments utilisateur",
                "Imprimante et buse actives",
                "Températures / débit / volumétrique max. correspondent",
                "Le projet se découpe avec ce filament",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Dépannage",
          blocks: [
            {
              type: "ul",
              items: [
                "Configuration invalide — vérifiez que c'est du JSON (pas un .ini Prusa).",
                "Caché après import — corrigez compatible_printers / Dependencies.",
                "Mauvaise base d'héritage — ré-exportez après avoir choisi un modèle d'imprimante plus proche.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Supprimer ou remplacer le profil",
          blocks: [
            {
              type: "p",
              text: "Supprimez le préréglage filament utilisateur dans OrcaSlicer, ou importez un téléchargement OpenFilament plus récent. Préférez des noms de fichiers de révision distincts depuis OpenFilament.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitations connues",
          blocks: [
            {
              type: "ul",
              items: [
                "Support bêta",
                "Export filament uniquement",
                "Hérite de bases de style Generic @printer-all",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Sources et compatibilité",
          blocks: [
            {
              type: "ul",
              items: [
                "Wiki OrcaSlicer import_export",
                "Dernière vérification structurelle : 2026-08-10",
                "Adaptateur : @open-filament/slicer-orca",
              ],
            },
          ],
        },
      ],
    ),
    prusaslicer: guide(
      "PrusaSlicer — instructions d'importation",
      "Téléchargez un bundle de configuration filament OpenFilament (.ini) et importez-le avec File → Import → Import Config Bundle…. Les noms de menus suivent l'interface anglaise de PrusaSlicer / Prusa Knowledge Base.",
      [
        {
          id: "what",
          heading: "Ce qu'OpenFilament exporte",
          blocks: [
            {
              type: "p",
              text: "Un bundle de configuration PrusaSlicer contenant une section [filament:…] avec héritage (*PLA*, *PET*, *ABS*, *FLEX*), températures, multiplicateur d'extrusion, limite volumétrique, ventilateurs et notes. Le pressure advance est une indication dans start_filament_gcode.",
            },
            {
              type: "p",
              text: "Pas de préréglage imprimante, préréglage impression/processus, G-code ni données RFID.",
            },
          ],
        },
        {
          id: "before",
          heading: "Avant de commencer",
          blocks: [
            {
              type: "ul",
              items: [
                "PrusaSlicer 2.7+ (Bêta ; testé structurellement jusqu'aux champs 2.9.x)",
                "Configurez d'abord votre imprimante dans PrusaSlicer",
                "Facultatif : File → Export → Export Config Bundle pour sauvegarde",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Télécharger depuis OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Trouvez filament → variante → imprimante/buse → profil.",
                "Choisissez PrusaSlicer sur Export / Télécharger pour le slicer.",
                "Créez le téléchargement et enregistrez le fichier .ini.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importer dans PrusaSlicer",
          blocks: [
            {
              type: "ol",
              items: [
                "Ouvrez PrusaSlicer.",
                "Choisissez File → Import → Import Config Bundle…",
                "Sélectionnez le fichier .ini OpenFilament.",
              ],
            },
            {
              type: "note",
              text: "Utilisez Import Config Bundle pour ce fichier (c'est un petit bundle avec une section filament). Import Config est pour un profil combiné unique / G-code — pas le chemin OpenFilament habituel.",
            },
          ],
        },
        {
          id: "select",
          heading: "Sélectionner le profil importé",
          blocks: [
            {
              type: "ul",
              items: [
                "Ouvrez Filament Settings.",
                "Sélectionnez le préréglage personnalisé (marque / produit / couleur).",
                "Vérifiez imprimante et buse sur le plateau avant de découper.",
              ],
            },
          ],
        },
        {
          id: "physical",
          heading: "Associer au filament physique",
          blocks: [
            {
              type: "p",
              text: "PrusaSlicer ne mappe pas automatiquement les RFID tiers. Sélectionnez le préréglage filament importé sur le plateau pour la bobine chargée. Il n'y a pas d'intégration automatique du système de matériaux OpenFilament.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Vérifier l'importation",
          blocks: [
            {
              type: "ul",
              items: [
                "Le filament personnalisé apparaît dans la liste",
                "Températures et multiplicateur d'extrusion correspondent",
                "Le découpage utilise le filament sélectionné",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Dépannage",
          blocks: [
            {
              type: "ul",
              items: [
                "Rien importé — utilisez Import Config Bundle, pas Import Config.",
                "Mauvaise extension — gardez .ini (ne laissez pas en .txt).",
                "L'ASA utilise l'héritage *ABS* — attendu pour les modèles standard.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Supprimer ou remplacer le profil",
          blocks: [
            {
              type: "p",
              text: "Supprimez le préréglage filament personnalisé dans PrusaSlicer, ou importez un .ini OpenFilament plus récent. Renommez localement si vous avez personnalisé des valeurs que vous souhaitez conserver.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitations connues",
          blocks: [
            {
              type: "ul",
              items: [
                "Support bêta",
                "Bundle filament uniquement",
                "PA via indication gcode",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Sources et compatibilité",
          blocks: [
            {
              type: "ul",
              items: [
                "Article Prusa Knowledge Base 382766",
                "Dernière vérification structurelle : 2026-08-10",
                "Adaptateur : @open-filament/slicer-prusa",
              ],
            },
          ],
        },
      ],
    ),
    "bambu-studio": guide(
      "Bambu Studio — instructions d'importation",
      "Téléchargez un préréglage filament utilisateur JSON OpenFilament et importez-le avec File → Import → Import Configs. Les noms de menus suivent l'interface anglaise actuelle de Bambu Studio.",
      [
        {
          id: "what",
          heading: "Ce qu'OpenFilament exporte",
          blocks: [
            {
              type: "p",
              text: "Un préréglage filament utilisateur JSON Bambu Studio / famille SoftFever avec héritage (Generic {material} [@printer]), températures, débit, PA, limite volumétrique, refroidissement, rétraction et notes.",
            },
            {
              type: "p",
              text: "Pas de préréglages imprimante/processus, de G-code ni de support d'écriture RFID Bambu depuis OpenFilament.",
            },
          ],
        },
        {
          id: "before",
          heading: "Avant de commencer",
          blocks: [
            {
              type: "ul",
              items: [
                "Bambu Studio 1.9+ / 2.0+ (Bêta)",
                "Sélectionnez d'abord votre imprimante et buse dans Studio",
                "Facultatif : exportez une sauvegarde des préréglages utilisateur",
              ],
            },
          ],
        },
        {
          id: "download",
          heading: "Télécharger depuis OpenFilament",
          blocks: [
            {
              type: "ol",
              items: [
                "Trouvez filament → variante → imprimante/buse → profil.",
                "Choisissez Bambu Studio sur Export / Télécharger pour le slicer.",
                "Créez le téléchargement et enregistrez le fichier .json.",
              ],
            },
          ],
        },
        {
          id: "import",
          heading: "Importer dans Bambu Studio",
          blocks: [
            {
              type: "ol",
              items: [
                "Ouvrez Bambu Studio.",
                "Choisissez File → Import → Import Configs.",
                "Sélectionnez le préréglage filament .json OpenFilament.",
              ],
            },
          ],
        },
        {
          id: "select",
          heading: "Sélectionner le profil importé",
          blocks: [
            {
              type: "ul",
              items: [
                "Ouvrez la sélection de filament → Filaments utilisateur / personnalisés.",
                "Effacez les filtres imprimante/buse si le préréglage est caché.",
                "Sélectionnez le préréglage importé pour la plaque.",
              ],
            },
          ],
        },
        {
          id: "ams",
          heading: "Associer au filament physique (AMS)",
          blocks: [
            {
              type: "p",
              text: "L'identité du matériau AMS est séparée du préréglage slicer. Mappez le slot AMS vers le filament utilisateur importé dans l'interface AMS / mapping filament de Studio. OpenFilament ne prétend pas écrire les RFID tiers dans les tags Bambu.",
            },
          ],
        },
        {
          id: "verify",
          heading: "Vérifier l'importation",
          blocks: [
            {
              type: "ul",
              items: [
                "Filament utilisateur listé",
                "Imprimante/buse corrects",
                "Températures / débit / volumétrique correspondent",
                "Le découpage utilise le filament importé",
              ],
            },
          ],
        },
        {
          id: "troubleshoot",
          heading: "Dépannage",
          blocks: [
            {
              type: "ul",
              items: [
                "Non visible — effacez les filtres ; confirmez que la base d'héritage existe.",
                "Rejeté — n'utilisez pas le JSON d'échange OpenFilamentProfile.",
                "Incohérence AMS — mappez le slot manuellement vers le préréglage utilisateur.",
              ],
            },
          ],
        },
        {
          id: "remove",
          heading: "Supprimer ou remplacer le profil",
          blocks: [
            {
              type: "p",
              text: "Supprimez le filament utilisateur dans Bambu Studio ou importez un téléchargement OpenFilament plus récent avec un nom de fichier distinct.",
            },
          ],
        },
        {
          id: "limits",
          heading: "Limitations connues",
          blocks: [
            {
              type: "ul",
              items: [
                "Support bêta",
                "Filament uniquement",
                "Pas d'écriture RFID Bambu",
              ],
            },
          ],
        },
        {
          id: "sources",
          heading: "Sources et compatibilité",
          blocks: [
            {
              type: "ul",
              items: [
                "File → Import → Import Configs (Studio actuel)",
                "Dernière vérification structurelle : 2026-08-10",
                "Adaptateur : @open-filament/slicer-bambu",
              ],
            },
          ],
        },
      ],
    ),
  },
};
