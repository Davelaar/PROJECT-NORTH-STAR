/** Generic Creality CFS material codes (prefix `1` + 5-digit generic). */

export type MaterialEntry = {
  name: string;
  genericCode: string;
  payloadCode: string;
};

const ENTRIES: MaterialEntry[] = [
  { name: "PLA", genericCode: "00001", payloadCode: "100001" },
  { name: "PLA-Silk", genericCode: "00002", payloadCode: "100002" },
  { name: "PETG", genericCode: "00003", payloadCode: "100003" },
  { name: "ABS", genericCode: "00004", payloadCode: "100004" },
  { name: "TPU", genericCode: "00005", payloadCode: "100005" },
  { name: "PLA-CF", genericCode: "00006", payloadCode: "100006" },
  { name: "ASA", genericCode: "00007", payloadCode: "100007" },
  { name: "PA", genericCode: "00008", payloadCode: "100008" },
  { name: "PA-CF", genericCode: "00009", payloadCode: "100009" },
  { name: "BVOH", genericCode: "00010", payloadCode: "100010" },
  { name: "PVA", genericCode: "00011", payloadCode: "100011" },
  { name: "HIPS", genericCode: "00012", payloadCode: "100012" },
  { name: "PET-CF", genericCode: "00013", payloadCode: "100013" },
  { name: "PETG-CF", genericCode: "00014", payloadCode: "100014" },
  { name: "PA6-CF", genericCode: "00015", payloadCode: "100015" },
  { name: "PAHT-CF", genericCode: "00016", payloadCode: "100016" },
  { name: "PPS", genericCode: "00017", payloadCode: "100017" },
  { name: "PPS-CF", genericCode: "00018", payloadCode: "100018" },
  { name: "PP", genericCode: "00019", payloadCode: "100019" },
  { name: "PET", genericCode: "00020", payloadCode: "100020" },
  { name: "PC", genericCode: "00021", payloadCode: "100021" },
];

const BY_NAME = new Map(
  ENTRIES.flatMap((e) => [
    [e.name.toUpperCase(), e],
    [e.name.replace(/-/g, "").toUpperCase(), e],
  ]),
);

const BY_PAYLOAD = new Map(ENTRIES.map((e) => [e.payloadCode, e]));

export const MATERIAL_CATALOG: readonly MaterialEntry[] = ENTRIES;

export function resolveMaterialCode(input: string): string {
  const raw = (input ?? "").trim();
  if (/^\d{6}$/.test(raw)) return raw;
  if (/^\d{5}$/.test(raw)) return `1${raw}`;
  const hit = BY_NAME.get(raw.toUpperCase());
  if (hit) return hit.payloadCode;
  throw new Error(
    `Unknown material "${input}". Use a catalog name (e.g. ASA) or 6-digit CFS code.`,
  );
}

export function materialNameForCode(payloadCode: string): string | undefined {
  return BY_PAYLOAD.get(payloadCode)?.name;
}

/** Spool weight → CFS length code. */
export const WEIGHT_LENGTH_CODES: Record<string, string> = {
  "1000": "0330",
  "1kg": "0330",
  "1KG": "0330",
  "750": "0247",
  "750g": "0247",
  "600": "0198",
  "600g": "0198",
  "500": "0165",
  "500g": "0165",
  "250": "0082",
  "250g": "0082",
};

export function resolveLengthCode(weightOrCode: string | number): string {
  if (typeof weightOrCode === "number") {
    return resolveLengthCode(String(weightOrCode));
  }
  const raw = weightOrCode.trim();
  if (/^\d{4}$/.test(raw)) return raw;
  const hit = WEIGHT_LENGTH_CODES[raw] ?? WEIGHT_LENGTH_CODES[raw.toLowerCase()];
  if (hit) return hit;
  throw new Error(
    `Unknown weight/length "${weightOrCode}". Use 0330 (1kg), 0165 (500g), etc.`,
  );
}
