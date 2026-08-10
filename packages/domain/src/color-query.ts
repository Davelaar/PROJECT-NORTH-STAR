/**
 * Resolve free-text color queries (hex, RAL, CMYK, RGB, colour names)
 * to a target `#RRGGBB` for approximate filament matching.
 */

import { normalizeHexColor } from "./color.js";

/** RAL Classic → approximate sRGB hex (common filament / industrial set). */
export const RAL_TO_HEX: Record<string, string> = {
  "1000": "#BEBD7F",
  "1001": "#C2B078",
  "1002": "#C6A664",
  "1003": "#E5BE01",
  "1004": "#CDA434",
  "1005": "#A98307",
  "1006": "#E4A010",
  "1007": "#DC9D00",
  "1011": "#8A6642",
  "1013": "#EAE6CA",
  "1014": "#E1CC4F",
  "1015": "#E6D690",
  "1016": "#EDFF21",
  "1017": "#F5D033",
  "1018": "#F8F32B",
  "1019": "#9E9764",
  "1020": "#999950",
  "1021": "#F3DA0B",
  "1023": "#FAD201",
  "1024": "#AEA04B",
  "1026": "#FFFF00",
  "1027": "#9D9101",
  "1028": "#F4A900",
  "1032": "#D6AE01",
  "1033": "#F3A505",
  "1034": "#EFA94A",
  "1035": "#6A5F31",
  "1037": "#F3A505",
  "2000": "#ED760E",
  "2001": "#C93C20",
  "2002": "#CB2821",
  "2003": "#FF7514",
  "2004": "#F44611",
  "2005": "#FF2301",
  "2007": "#FFA420",
  "2008": "#F75E25",
  "2009": "#F54021",
  "2010": "#D84B20",
  "2011": "#EC7C26",
  "2012": "#E55137",
  "2013": "#C35831",
  "3000": "#AF2B1E",
  "3001": "#A52019",
  "3002": "#A2231D",
  "3003": "#9B111E",
  "3004": "#75151E",
  "3005": "#5E2129",
  "3007": "#412227",
  "3009": "#642424",
  "3011": "#781F19",
  "3012": "#C1876B",
  "3013": "#A12312",
  "3014": "#D36E70",
  "3015": "#EA899A",
  "3016": "#B32821",
  "3017": "#E63244",
  "3018": "#D53032",
  "3020": "#CC0605",
  "3022": "#D95030",
  "3024": "#F80000",
  "3026": "#FE0000",
  "3027": "#C51D34",
  "3028": "#CB3234",
  "3031": "#B32428",
  "3032": "#721422",
  "3033": "#B44C43",
  "4001": "#6D3F5B",
  "4002": "#922B3E",
  "4003": "#DE4C8A",
  "4004": "#641C34",
  "4005": "#6C4675",
  "4006": "#A52019",
  "4007": "#4A192C",
  "4008": "#924E7D",
  "4009": "#A18594",
  "4010": "#CF3476",
  "4011": "#8673A1",
  "4012": "#6C6874",
  "5000": "#354D73",
  "5001": "#1F3438",
  "5002": "#20214F",
  "5003": "#1D1E33",
  "5004": "#18171C",
  "5005": "#1E2460",
  "5007": "#3E5F8A",
  "5008": "#26252D",
  "5009": "#025669",
  "5010": "#0E294B",
  "5011": "#231A24",
  "5012": "#3B83BD",
  "5013": "#1E213D",
  "5014": "#606E8C",
  "5015": "#2271B3",
  "5017": "#063971",
  "5018": "#3F888F",
  "5019": "#1B5583",
  "5020": "#1D334A",
  "5021": "#256D7B",
  "5022": "#252850",
  "5023": "#49678D",
  "5024": "#5D9B9B",
  "5025": "#2A6478",
  "5026": "#102C54",
  "6000": "#316650",
  "6001": "#287233",
  "6002": "#2D572C",
  "6003": "#424632",
  "6004": "#1F3A3D",
  "6005": "#2F4538",
  "6006": "#3E3B32",
  "6007": "#343B29",
  "6008": "#39352A",
  "6009": "#31372B",
  "6010": "#35682D",
  "6011": "#587246",
  "6012": "#343E40",
  "6013": "#6C7059",
  "6014": "#47402E",
  "6015": "#3B3C36",
  "6016": "#1E5945",
  "6017": "#4C9141",
  "6018": "#57A639",
  "6019": "#BDECB6",
  "6020": "#2E3A23",
  "6021": "#89AC76",
  "6022": "#25221B",
  "6024": "#308446",
  "6025": "#3D642D",
  "6026": "#015D52",
  "6027": "#84C3BE",
  "6028": "#2C5545",
  "6029": "#20603D",
  "6032": "#317F43",
  "6033": "#497E76",
  "6034": "#7FB5B5",
  "6035": "#1C542D",
  "6036": "#193737",
  "6037": "#008F39",
  "6038": "#00BB2D",
  "7000": "#78858B",
  "7001": "#8A9597",
  "7002": "#7E7B52",
  "7003": "#6C7059",
  "7004": "#969992",
  "7005": "#646B63",
  "7006": "#6D6552",
  "7008": "#6A5F31",
  "7009": "#4D5645",
  "7010": "#4C514A",
  "7011": "#434B4D",
  "7012": "#4E5754",
  "7013": "#464531",
  "7015": "#434750",
  "7016": "#293133",
  "7021": "#23282B",
  "7022": "#332F2C",
  "7023": "#686C6B",
  "7024": "#474A50",
  "7026": "#2F353B",
  "7030": "#8B8C7A",
  "7031": "#474B4E",
  "7032": "#B8B799",
  "7033": "#7D8471",
  "7034": "#8F8B66",
  "7035": "#D7D7D7",
  "7036": "#7F7679",
  "7037": "#7D7F7D",
  "7038": "#B5B8B1",
  "7039": "#6C6960",
  "7040": "#9DA1AA",
  "7042": "#8D948D",
  "7043": "#4E5452",
  "7044": "#CAC4B0",
  "7045": "#909090",
  "7046": "#82898F",
  "7047": "#D0D0D0",
  "7048": "#898176",
  "8000": "#826C34",
  "8001": "#955F20",
  "8002": "#6C3B2A",
  "8003": "#734222",
  "8004": "#8E402A",
  "8007": "#59351F",
  "8008": "#6F4F28",
  "8011": "#5B3A29",
  "8012": "#592321",
  "8014": "#382C1E",
  "8015": "#633A34",
  "8016": "#4C2F27",
  "8017": "#45322E",
  "8019": "#403A3A",
  "8022": "#212121",
  "8023": "#A65E2E",
  "8024": "#79553D",
  "8025": "#755C48",
  "8028": "#4E3B31",
  "8029": "#763C28",
  "9001": "#FDF4E3",
  "9002": "#E7EBDA",
  "9003": "#F4F4F4",
  "9004": "#282828",
  "9005": "#0A0A0A",
  "9006": "#A5A5A5",
  "9007": "#8F8F8F",
  "9010": "#FFFFFF",
  "9011": "#1C1C1C",
  "9016": "#F6F6F6",
  "9017": "#1E1E1E",
  "9018": "#D7D7D7",
  "9022": "#9C9C9C",
  "9023": "#828282",
};

/**
 * Colour name → hex. Keys are NFKD-lowercased, punctuation stripped.
 * Covers NL/EN/DE/FR/ES/PT/RU/UK/ZH basics + common filament labels.
 */
const COLOR_NAME_HEX: Record<string, string> = {
  // Neutrals
  black: "#000000",
  zwart: "#000000",
  schwarz: "#000000",
  noir: "#000000",
  negro: "#000000",
  preto: "#000000",
  nero: "#000000",
  черный: "#000000",
  чорний: "#000000",
  黑: "#000000",
  黑色: "#000000",
  white: "#FFFFFF",
  wit: "#FFFFFF",
  weiß: "#FFFFFF",
  weiss: "#FFFFFF",
  blanc: "#FFFFFF",
  blanco: "#FFFFFF",
  branco: "#FFFFFF",
  bianco: "#FFFFFF",
  белый: "#FFFFFF",
  білий: "#FFFFFF",
  白: "#FFFFFF",
  白色: "#FFFFFF",
  grey: "#808080",
  gray: "#808080",
  grijs: "#808080",
  grau: "#808080",
  gris: "#808080",
  cinza: "#808080",
  grigio: "#808080",
  серый: "#808080",
  сірий: "#808080",
  灰: "#808080",
  灰色: "#808080",
  silver: "#C0C0C0",
  zilver: "#C0C0C0",
  silber: "#C0C0C0",
  argent: "#C0C0C0",
  plata: "#C0C0C0",
  prata: "#C0C0C0",
  银: "#C0C0C0",
  银色: "#C0C0C0",
  // Primaries / secondaries
  red: "#E53935",
  rood: "#E53935",
  rot: "#E53935",
  rouge: "#E53935",
  rojo: "#E53935",
  vermelho: "#E53935",
  rosso: "#E53935",
  красный: "#E53935",
  червоний: "#E53935",
  红: "#E53935",
  红色: "#E53935",
  blue: "#1E88E5",
  blauw: "#1E88E5",
  blau: "#1E88E5",
  bleu: "#1E88E5",
  azul: "#1E88E5",
  blu: "#1E88E5",
  синий: "#1E88E5",
  синій: "#1E88E5",
  蓝: "#1E88E5",
  蓝色: "#1E88E5",
  green: "#43A047",
  groen: "#43A047",
  grun: "#43A047",
  grün: "#43A047",
  vert: "#43A047",
  verde: "#43A047",
  зеленый: "#43A047",
  зелений: "#43A047",
  绿: "#43A047",
  绿色: "#43A047",
  yellow: "#FDD835",
  geel: "#FDD835",
  gelb: "#FDD835",
  jaune: "#FDD835",
  amarillo: "#FDD835",
  amarelo: "#FDD835",
  giallo: "#FDD835",
  желтый: "#FDD835",
  жовтий: "#FDD835",
  黄: "#FDD835",
  黄色: "#FDD835",
  orange: "#FB8C00",
  oranje: "#FB8C00",
  naranja: "#FB8C00",
  laranja: "#FB8C00",
  arancione: "#FB8C00",
  оранжевый: "#FB8C00",
  помаранчевий: "#FB8C00",
  橙: "#FB8C00",
  橙色: "#FB8C00",
  purple: "#8E24AA",
  paars: "#8E24AA",
  lila: "#8E24AA",
  violet: "#8E24AA",
  morado: "#8E24AA",
  roxo: "#8E24AA",
  viola: "#8E24AA",
  фиолетовый: "#8E24AA",
  фіолетовий: "#8E24AA",
  紫: "#8E24AA",
  紫色: "#8E24AA",
  pink: "#EC407A",
  roze: "#EC407A",
  rosa: "#EC407A",
  rose: "#EC407A",
  розовый: "#EC407A",
  рожевий: "#EC407A",
  粉: "#EC407A",
  粉色: "#EC407A",
  brown: "#6D4C41",
  bruin: "#6D4C41",
  braun: "#6D4C41",
  brun: "#6D4C41",
  marron: "#6D4C41",
  marrom: "#6D4C41",
  marrone: "#6D4C41",
  коричневый: "#6D4C41",
  коричневий: "#6D4C41",
  棕: "#6D4C41",
  棕色: "#6D4C41",
  cyan: "#00BCD4",
  cyaan: "#00BCD4",
  turkoois: "#00BCD4",
  turquoise: "#00BCD4",
  teal: "#00897B",
  magenta: "#D81B60",
  gold: "#D4AF37",
  goud: "#D4AF37",
  goldgelb: "#D4AF37",
  beige: "#D7CCC8",
  ivory: "#FFFFF0",
  ivoire: "#FFFFF0",
  cream: "#FFFDD0",
  crème: "#FFFDD0",
  creme: "#FFFDD0",
  navy: "#0D1B4C",
  marineblauw: "#0D1B4C",
  clear: "#E8F4FC",
  transparent: "#E8F4FC",
  naturel: "#F5E6C8",
  natural: "#F5E6C8",
  nature: "#F5E6C8",
  naturell: "#F5E6C8",
};

function normalizeColorKey(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff\u4e00-\u9fff]+/gi, "")
    .trim();
}

export function cmykToHex(
  c: number,
  m: number,
  y: number,
  k: number,
): string | null {
  if (![c, m, y, k].every((v) => Number.isFinite(v) && v >= 0 && v <= 100)) {
    return null;
  }
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const r = clamp(255 * (1 - c / 100) * (1 - k / 100));
  const g = clamp(255 * (1 - m / 100) * (1 - k / 100));
  const b = clamp(255 * (1 - y / 100) * (1 - k / 100));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}

export function rgbChannelsToHex(r: number, g: number, b: number): string | null {
  if (![r, g, b].every((v) => Number.isFinite(v) && v >= 0 && v <= 255)) {
    return null;
  }
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`.toUpperCase();
}

export type ParsedColorQuery = {
  hex: string;
  kind: "hex" | "ral" | "cmyk" | "rgb" | "name";
  label: string;
};

/** Try to interpret a search string as a colour target. */
export function parseColorQuery(raw: string): ParsedColorQuery | null {
  const input = raw.trim();
  if (!input) return null;

  // #RGB / #RRGGBB / bare hex
  const asHex = normalizeHexColor(input);
  if (asHex && (/^#?[0-9a-fA-F]{3}$/.test(input.trim()) || /^#?[0-9a-fA-F]{6}$/.test(input.trim()))) {
    return { hex: asHex, kind: "hex", label: asHex };
  }

  // RAL 9011 / RAL9017 / ral-9005
  const ral = input.match(/^ral[\s\-.:]*([0-9]{4})$/i);
  if (ral?.[1]) {
    const code = ral[1];
    const hex = RAL_TO_HEX[code];
    if (hex) return { hex, kind: "ral", label: `RAL ${code}` };
  }

  // cmyk(0,0,0,100) or 0,0,0,100 with optional %
  const cmykFn = input.match(
    /^cmyk\s*\(\s*([0-9.]+)\s*%?\s*,\s*([0-9.]+)\s*%?\s*,\s*([0-9.]+)\s*%?\s*,\s*([0-9.]+)\s*%?\s*\)$/i,
  );
  if (cmykFn) {
    const hex = cmykToHex(+cmykFn[1]!, +cmykFn[2]!, +cmykFn[3]!, +cmykFn[4]!);
    if (hex) {
      return {
        hex,
        kind: "cmyk",
        label: `CMYK(${cmykFn[1]},${cmykFn[2]},${cmykFn[3]},${cmykFn[4]})`,
      };
    }
  }
  const cmykCsv = input.match(
    /^([0-9.]+)\s*%?\s*,\s*([0-9.]+)\s*%?\s*,\s*([0-9.]+)\s*%?\s*,\s*([0-9.]+)\s*%?$/,
  );
  if (cmykCsv) {
    const hex = cmykToHex(+cmykCsv[1]!, +cmykCsv[2]!, +cmykCsv[3]!, +cmykCsv[4]!);
    if (hex) {
      return {
        hex,
        kind: "cmyk",
        label: `CMYK(${cmykCsv[1]},${cmykCsv[2]},${cmykCsv[3]},${cmykCsv[4]})`,
      };
    }
  }

  // rgb(0,0,0)
  const rgbFn = input.match(
    /^rgba?\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/i,
  );
  if (rgbFn) {
    const hex = rgbChannelsToHex(+rgbFn[1]!, +rgbFn[2]!, +rgbFn[3]!);
    if (hex) return { hex, kind: "rgb", label: `RGB(${rgbFn[1]},${rgbFn[2]},${rgbFn[3]})` };
  }

  // Colour name (whole query)
  const key = normalizeColorKey(input);
  const named = COLOR_NAME_HEX[key];
  if (named) return { hex: named, kind: "name", label: input.trim() };

  return null;
}

/**
 * Popularity rank for material codes — lower = more common / preferred first.
 * PLA / PETG / ABS beat niche engineering plastics like PEEK.
 */
export function materialPopularityRank(code: string): number {
  const c = code.trim().toUpperCase();
  const exact: Record<string, number> = {
    PLA: 10,
    "PLA+": 12,
    PETG: 20,
    ABS: 30,
    ASA: 35,
    TPU: 40,
    TPE: 45,
    HIPS: 50,
    PVA: 55,
    PET: 60,
    PCTG: 65,
    PP: 70,
    PC: 80,
    PA6: 90,
    PA12: 95,
    PA: 92,
    CPE: 100,
    PVB: 110,
    BVOH: 115,
    PHA: 120,
    PEBA: 125,
    PPA: 140,
    PPS: 150,
    PPSU: 155,
    PEI: 160,
    PEEK: 200,
    PEKK: 210,
  };
  if (exact[c] != null) return exact[c];
  if (c.startsWith("PLA")) return 14;
  if (c.startsWith("PETG")) return 22;
  if (c.startsWith("ABS")) return 32;
  if (c.startsWith("ASA")) return 36;
  if (c.startsWith("TPU")) return 42;
  if (c.startsWith("PA")) return 93;
  if (c.startsWith("PC")) return 82;
  if (c.includes("RESIN") || c.includes("LCD") || c.includes("SLA")) return 25;
  return 500;
}
