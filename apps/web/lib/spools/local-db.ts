/**
 * Local My Spools — IndexedDB with schema versioning.
 * Never uploads unless the user explicitly confirms cloud sync.
 */

function uuid(): string {
  return crypto.randomUUID();
}

export const SPOOL_DB_NAME = "openfilament-spools";
export const SPOOL_DB_VERSION = 1;
export const SPOOL_STORE = "spools";

export type LocalSpoolStatus =
  | "sealed"
  | "open"
  | "active"
  | "drying"
  | "stored"
  | "low"
  | "empty"
  | "archived";

export type LocalDryingEvent = {
  uuid: string;
  startedAt: string;
  endedAt?: string | null;
  tempC?: number | null;
  durationHours?: number | null;
  notes?: string | null;
};

export type LocalIdentity = {
  uuid: string;
  kind: "qr" | "rfid";
  value: string;
  label?: string | null;
};

export type LocalSpool = {
  uuid: string;
  clientId: string;
  manufacturerUuid?: string | null;
  manufacturerName?: string | null;
  productUuid?: string | null;
  productName?: string | null;
  variantUuid?: string | null;
  variantName?: string | null;
  colorHex?: string | null;
  materialCode?: string | null;
  initialNetWeightG?: number | null;
  currentWeightG?: number | null;
  tareWeightG?: number | null;
  remainingPercent?: number | null;
  purchaseDate?: string | null;
  openedDate?: string | null;
  batchLot?: string | null;
  notes?: string | null;
  storageLocation?: string | null;
  status: LocalSpoolStatus;
  preferredPrinterUuid?: string | null;
  preferredNozzleMm?: number | null;
  archivedAt?: string | null;
  deletedAt?: string | null;
  syncVersion: number;
  dryingEvents: LocalDryingEvent[];
  identities: LocalIdentity[];
  createdAt: string;
  updatedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SPOOL_DB_NAME, SPOOL_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(SPOOL_STORE)) {
        const store = db.createObjectStore(SPOOL_STORE, { keyPath: "uuid" });
        store.createIndex("clientId", "clientId", { unique: true });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function listLocalSpools(opts?: {
  includeArchived?: boolean;
}): Promise<LocalSpool[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SPOOL_STORE, "readonly");
    const req = tx.objectStore(SPOOL_STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as LocalSpool[])
        .filter((s) => !s.deletedAt)
        .filter((s) => (opts?.includeArchived ? true : !s.archivedAt))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getLocalSpool(uuid: string): Promise<LocalSpool | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SPOOL_STORE, "readonly");
    const req = tx.objectStore(SPOOL_STORE).get(uuid);
    req.onsuccess = () => resolve((req.result as LocalSpool) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLocalSpool(
  input: Partial<LocalSpool> & {
    manufacturerName?: string | null;
    productName?: string | null;
    variantName?: string | null;
  },
): Promise<LocalSpool> {
  const db = await openDb();
  const now = new Date().toISOString();
  const existing = input.uuid ? await getLocalSpool(input.uuid) : null;
  const spool: LocalSpool = {
    uuid: input.uuid ?? uuid(),
    clientId: input.clientId ?? existing?.clientId ?? uuid(),
    manufacturerUuid: input.manufacturerUuid ?? existing?.manufacturerUuid ?? null,
    manufacturerName: input.manufacturerName ?? existing?.manufacturerName ?? null,
    productUuid: input.productUuid ?? existing?.productUuid ?? null,
    productName: input.productName ?? existing?.productName ?? null,
    variantUuid: input.variantUuid ?? existing?.variantUuid ?? null,
    variantName: input.variantName ?? existing?.variantName ?? null,
    colorHex: input.colorHex ?? existing?.colorHex ?? null,
    materialCode: input.materialCode ?? existing?.materialCode ?? null,
    initialNetWeightG: input.initialNetWeightG ?? existing?.initialNetWeightG ?? null,
    currentWeightG: input.currentWeightG ?? existing?.currentWeightG ?? null,
    tareWeightG: input.tareWeightG ?? existing?.tareWeightG ?? null,
    remainingPercent: input.remainingPercent ?? existing?.remainingPercent ?? null,
    purchaseDate: input.purchaseDate ?? existing?.purchaseDate ?? null,
    openedDate: input.openedDate ?? existing?.openedDate ?? null,
    batchLot: input.batchLot ?? existing?.batchLot ?? null,
    notes: input.notes ?? existing?.notes ?? null,
    storageLocation: input.storageLocation ?? existing?.storageLocation ?? null,
    status: input.status ?? existing?.status ?? "sealed",
    preferredPrinterUuid:
      input.preferredPrinterUuid ?? existing?.preferredPrinterUuid ?? null,
    preferredNozzleMm: input.preferredNozzleMm ?? existing?.preferredNozzleMm ?? null,
    archivedAt: input.archivedAt !== undefined ? input.archivedAt : existing?.archivedAt ?? null,
    deletedAt: null,
    syncVersion: (existing?.syncVersion ?? 0) + 1,
    dryingEvents: input.dryingEvents ?? existing?.dryingEvents ?? [],
    identities: input.identities ?? existing?.identities ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const tx = db.transaction(SPOOL_STORE, "readwrite");
  tx.objectStore(SPOOL_STORE).put(spool);
  await txDone(tx);
  return spool;
}

export async function deleteLocalSpool(spoolUuid: string, hard = false) {
  const db = await openDb();
  if (hard) {
    const tx = db.transaction(SPOOL_STORE, "readwrite");
    tx.objectStore(SPOOL_STORE).delete(spoolUuid);
    await txDone(tx);
    return;
  }
  const existing = await getLocalSpool(spoolUuid);
  if (!existing) return;
  const tx = db.transaction(SPOOL_STORE, "readwrite");
  tx.objectStore(SPOOL_STORE).put({
    ...existing,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncVersion: existing.syncVersion + 1,
  });
  await txDone(tx);
}

export async function clearAllLocalSpools() {
  const db = await openDb();
  const tx = db.transaction(SPOOL_STORE, "readwrite");
  tx.objectStore(SPOOL_STORE).clear();
  await txDone(tx);
}

export async function exportLocalSpoolsJson(): Promise<string> {
  const spools = await listLocalSpools({ includeArchived: true });
  return JSON.stringify(
    {
      schemaVersion: SPOOL_DB_VERSION,
      exportedAt: new Date().toISOString(),
      mode: "local-only",
      spools,
    },
    null,
    2,
  );
}

export async function importLocalSpoolsJson(
  raw: string,
): Promise<{ imported: number; skipped: number }> {
  const parsed = JSON.parse(raw) as { spools?: LocalSpool[] };
  if (!Array.isArray(parsed.spools)) throw new Error("Invalid spool export");
  let imported = 0;
  let skipped = 0;
  for (const item of parsed.spools) {
    if (!item?.uuid || !item?.clientId) {
      skipped += 1;
      continue;
    }
    const existing = await getLocalSpool(item.uuid);
    if (existing && existing.syncVersion >= (item.syncVersion ?? 0)) {
      skipped += 1;
      continue;
    }
    await saveLocalSpool(item);
    imported += 1;
  }
  return { imported, skipped };
}

export async function duplicateLocalSpool(spoolUuid: string) {
  const src = await getLocalSpool(spoolUuid);
  if (!src) return null;
  return saveLocalSpool({
    ...src,
    uuid: undefined,
    clientId: uuid(),
    status: "sealed",
    openedDate: null,
    currentWeightG: src.initialNetWeightG,
    remainingPercent: 100,
    archivedAt: null,
    notes: src.notes ? `Copy of ${src.uuid.slice(0, 8)}. ${src.notes}` : `Copy of ${src.uuid.slice(0, 8)}`,
    dryingEvents: [],
    identities: [],
  });
}
