/**
 * Curated FFF printer brands + common models for the community catalog.
 * Idempotent seed — resolve/create still accepts any brand via "Other".
 */
export type PrinterCatalogBrand = {
  name: string;
  aliases?: string[];
  models: string[];
};

export const PRINTER_CATALOG: PrinterCatalogBrand[] = [
  {
    name: "Bambu Lab",
    aliases: ["Bambu", "BambuLab", "Bambu Labs", "BBL"],
    models: ["A1", "A1 mini", "P1P", "P1S", "X1", "X1 Carbon", "X1E", "H2D"],
  },
  {
    name: "Prusa Research",
    aliases: ["Prusa", "Průša", "Prusa3D"],
    models: ["MK3S+", "MK4", "MK4S", "Mini+", "XL", "CORE One"],
  },
  {
    name: "Creality",
    aliases: ["Creality 3D", "Creality3D"],
    models: [
      "Ender 3",
      "Ender 3 V2",
      "Ender 3 V3",
      "Ender 3 V3 KE",
      "Ender 3 V3 SE",
      "Ender 5",
      "CR-10",
      "K1",
      "K1 Max",
      "K1C",
      "K1 SE",
      "K2 Plus",
      "Sermoon D1",
    ],
  },
  {
    name: "Anycubic",
    aliases: ["Any Cubic"],
    models: ["Kobra 2", "Kobra 2 Pro", "Kobra 2 Max", "Kobra 3", "Kobra S1", "Vyper"],
  },
  {
    name: "Elegoo",
    aliases: ["ELEGOO"],
    models: ["Neptune 3", "Neptune 4", "Neptune 4 Pro", "Neptune 4 Max", "Neptune 4 Plus"],
  },
  {
    name: "Voron Design",
    aliases: ["Voron", "VoronDesign"],
    models: ["0.1", "0.2", "2.4", "Trident", "Switchwire"],
  },
  {
    name: "RatRig",
    aliases: ["Rat Rig", "RatRig V-Core"],
    models: ["V-Core 3", "V-Core 4", "V-Minion"],
  },
  {
    name: "Flashforge",
    aliases: ["FlashForge", "Flash Forge"],
    models: ["Adventurer 5M", "Adventurer 5M Pro", "Guider 3", "Creator 4"],
  },
  {
    name: "Sovol",
    models: ["SV06", "SV07", "SV08", "Zero"],
  },
  {
    name: "Qidi",
    aliases: ["QIDI", "Qidi Tech"],
    models: ["X-Max 3", "X-Plus 3", "X-Plus 4", "Q1 Pro", "Plus4"],
  },
  {
    name: "Ultimaker",
    aliases: ["UltiMaker"],
    models: ["S3", "S5", "S7", "Factor 4"],
  },
  {
    name: "Raise3D",
    aliases: ["Raise 3D"],
    models: ["Pro3", "Pro3 Plus", "E2", "RMF500"],
  },
  {
    name: "Artillery",
    models: ["Sidewinder X2", "Sidewinder X3", "Genius Pro", "Hornet"],
  },
  {
    name: "BIQU",
    aliases: ["Biqu", "BTT"],
    models: ["B1", "BX", "Hurakan"],
  },
  {
    name: "Snapmaker",
    models: ["Artisan", "J1", "U1"],
  },
  {
    name: "AnkerMake",
    aliases: ["Anker Make", "Anker"],
    models: ["M5", "M5C"],
  },
  {
    name: "Kingroon",
    models: ["KP3S", "KLP1", "KP5L"],
  },
  {
    name: "TwoTrees",
    aliases: ["Twotrees", "Two Trees"],
    models: ["SP-5", "SK1", "Bluer"],
  },
  {
    name: "Flsun",
    aliases: ["FLSUN"],
    models: ["V400", "T1", "S1"],
  },
  {
    name: "Tronxy",
    models: ["X5SA", "XY-2 Pro", "VEHO 600"],
  },
  {
    name: "Geeetech",
    aliases: ["Geetech"],
    models: ["A10", "A20", "Mizar S"],
  },
  {
    name: "Wanhao",
    models: ["Duplicator i3", "D12"],
  },
  {
    name: "LulzBot",
    aliases: ["Lulzbot"],
    models: ["Taz Pro", "Mini 2", "SideKick"],
  },
  {
    name: "MakerBot",
    aliases: ["Makerbot"],
    models: ["Replicator+", "Method", "Sketch"],
  },
  {
    name: "Markforged",
    models: ["Onyx Pro", "X7", "Mark Two"],
  },
  {
    name: "Generic",
    aliases: ["Generic FFF", "Other", "DIY", "Custom", "Unknown"],
    models: ["FFF", "CoreXY", "Bedslinger", "Custom"],
  },
];

/** Standard nozzle sizes offered when creating a printer toolhead. */
export const DEFAULT_NOZZLE_DIAMETERS_MM = [0.2, 0.25, 0.4, 0.6, 0.8, 1.0] as const;
