import { and, desc, eq, isNull } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import type { AppDb } from "./client.js";
import * as schema from "./schema.js";
import type { SpoolStatus } from "./schema.js";

export type SpoolDryingEventInput = {
  uuid?: string;
  startedAt: string;
  endedAt?: string | null;
  tempC?: number | null;
  durationHours?: number | null;
  notes?: string | null;
};

export type SpoolIdentityInput = {
  uuid?: string;
  kind: "qr" | "rfid";
  value: string;
  label?: string | null;
};

export type SpoolWriteInput = {
  uuid?: string;
  clientId?: string | null;
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
  status?: SpoolStatus;
  preferredPrinterUuid?: string | null;
  preferredNozzleMm?: number | null;
  archivedAt?: string | null;
  syncVersion?: number;
  dryingEvents?: SpoolDryingEventInput[];
  identities?: SpoolIdentityInput[];
};

export type PublicSpoolProjection = {
  uuid: string;
  manufacturerName: string | null;
  productName: string | null;
  variantName: string | null;
  colorHex: string | null;
  materialCode: string | null;
  status: string;
  preferredNozzleMm: number | null;
};

function nowIso() {
  return new Date().toISOString();
}

function mapSpool(
  row: typeof schema.userSpools.$inferSelect,
  drying: typeof schema.userSpoolDryingEvents.$inferSelect[],
  identities: typeof schema.userSpoolIdentities.$inferSelect[],
) {
  return {
    uuid: row.uuid,
    clientId: row.clientId,
    manufacturerUuid: row.manufacturerUuid,
    manufacturerName: row.manufacturerName,
    productUuid: row.productUuid,
    productName: row.productName,
    variantUuid: row.variantUuid,
    variantName: row.variantName,
    colorHex: row.colorHex,
    materialCode: row.materialCode,
    initialNetWeightG: row.initialNetWeightG,
    currentWeightG: row.currentWeightG,
    tareWeightG: row.tareWeightG,
    remainingPercent: row.remainingPercent,
    purchaseDate: row.purchaseDate,
    openedDate: row.openedDate,
    batchLot: row.batchLot,
    notes: row.notes,
    storageLocation: row.storageLocation,
    status: row.status,
    preferredPrinterUuid: row.preferredPrinterUuid,
    preferredNozzleMm: row.preferredNozzleMm,
    archivedAt: row.archivedAt,
    syncVersion: row.syncVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    dryingEvents: drying.map((d) => ({
      uuid: d.uuid,
      startedAt: d.startedAt,
      endedAt: d.endedAt,
      tempC: d.tempC,
      durationHours: d.durationHours,
      notes: d.notes,
    })),
    identities: identities.map((i) => ({
      uuid: i.uuid,
      kind: i.kind,
      value: i.value,
      label: i.label,
    })),
  };
}

export function listUserSpools(
  db: AppDb,
  userId: number,
  opts?: { includeArchived?: boolean; page?: number; pageSize?: number },
) {
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 50));
  const rows = db
    .select()
    .from(schema.userSpools)
    .where(
      and(
        eq(schema.userSpools.userId, userId),
        isNull(schema.userSpools.deletedAt),
      ),
    )
    .orderBy(desc(schema.userSpools.updatedAt))
    .all()
    .filter((r) => (opts?.includeArchived ? true : !r.archivedAt));

  const total = rows.length;
  const slice = rows.slice((page - 1) * pageSize, page * pageSize);
  const items = slice.map((row) => {
    const drying = db
      .select()
      .from(schema.userSpoolDryingEvents)
      .where(eq(schema.userSpoolDryingEvents.spoolId, row.id))
      .all();
    const identities = db
      .select()
      .from(schema.userSpoolIdentities)
      .where(eq(schema.userSpoolIdentities.spoolId, row.id))
      .all();
    return mapSpool(row, drying, identities);
  });
  return { total, page, pageSize, items };
}

export function getOwnedSpool(db: AppDb, userId: number, spoolUuid: string) {
  const row = db
    .select()
    .from(schema.userSpools)
    .where(
      and(
        eq(schema.userSpools.uuid, spoolUuid),
        eq(schema.userSpools.userId, userId),
        isNull(schema.userSpools.deletedAt),
      ),
    )
    .get();
  if (!row) return null;
  const drying = db
    .select()
    .from(schema.userSpoolDryingEvents)
    .where(eq(schema.userSpoolDryingEvents.spoolId, row.id))
    .all();
  const identities = db
    .select()
    .from(schema.userSpoolIdentities)
    .where(eq(schema.userSpoolIdentities.spoolId, row.id))
    .all();
  return mapSpool(row, drying, identities);
}

function replaceChildren(
  db: AppDb,
  spoolId: number,
  dryingEvents: SpoolDryingEventInput[] | undefined,
  identities: SpoolIdentityInput[] | undefined,
) {
  if (dryingEvents) {
    db.delete(schema.userSpoolDryingEvents)
      .where(eq(schema.userSpoolDryingEvents.spoolId, spoolId))
      .run();
    for (const d of dryingEvents) {
      db.insert(schema.userSpoolDryingEvents)
        .values({
          uuid: d.uuid ?? uuid(),
          spoolId,
          startedAt: d.startedAt,
          endedAt: d.endedAt ?? null,
          tempC: d.tempC ?? null,
          durationHours: d.durationHours ?? null,
          notes: d.notes ?? null,
        })
        .run();
    }
  }
  if (identities) {
    db.delete(schema.userSpoolIdentities)
      .where(eq(schema.userSpoolIdentities.spoolId, spoolId))
      .run();
    for (const i of identities) {
      db.insert(schema.userSpoolIdentities)
        .values({
          uuid: i.uuid ?? uuid(),
          spoolId,
          kind: i.kind,
          value: i.value.trim(),
          label: i.label ?? null,
        })
        .run();
    }
  }
}

/** Idempotent upsert by uuid (owner) or clientId. Last-write-wins by syncVersion. */
export function upsertUserSpool(db: AppDb, userId: number, input: SpoolWriteInput) {
  const existingByUuid = input.uuid
    ? db
        .select()
        .from(schema.userSpools)
        .where(
          and(
            eq(schema.userSpools.uuid, input.uuid),
            eq(schema.userSpools.userId, userId),
          ),
        )
        .get()
    : null;
  const existingByClient =
    !existingByUuid && input.clientId
      ? db
          .select()
          .from(schema.userSpools)
          .where(
            and(
              eq(schema.userSpools.userId, userId),
              eq(schema.userSpools.clientId, input.clientId),
            ),
          )
          .get()
      : null;
  const existing = existingByUuid ?? existingByClient;
  const incomingVersion = input.syncVersion ?? 1;

  if (existing) {
    if (incomingVersion < existing.syncVersion) {
      return getOwnedSpool(db, userId, existing.uuid);
    }
    db.update(schema.userSpools)
      .set({
        clientId: input.clientId ?? existing.clientId,
        manufacturerUuid: input.manufacturerUuid ?? existing.manufacturerUuid,
        manufacturerName: input.manufacturerName ?? existing.manufacturerName,
        productUuid: input.productUuid ?? existing.productUuid,
        productName: input.productName ?? existing.productName,
        variantUuid: input.variantUuid ?? existing.variantUuid,
        variantName: input.variantName ?? existing.variantName,
        colorHex: input.colorHex ?? existing.colorHex,
        materialCode: input.materialCode ?? existing.materialCode,
        initialNetWeightG:
          input.initialNetWeightG ?? existing.initialNetWeightG,
        currentWeightG: input.currentWeightG ?? existing.currentWeightG,
        tareWeightG: input.tareWeightG ?? existing.tareWeightG,
        remainingPercent: input.remainingPercent ?? existing.remainingPercent,
        purchaseDate: input.purchaseDate ?? existing.purchaseDate,
        openedDate: input.openedDate ?? existing.openedDate,
        batchLot: input.batchLot ?? existing.batchLot,
        notes: input.notes ?? existing.notes,
        storageLocation: input.storageLocation ?? existing.storageLocation,
        status: input.status ?? existing.status,
        preferredPrinterUuid:
          input.preferredPrinterUuid ?? existing.preferredPrinterUuid,
        preferredNozzleMm: input.preferredNozzleMm ?? existing.preferredNozzleMm,
        archivedAt:
          input.archivedAt !== undefined
            ? input.archivedAt
            : existing.archivedAt,
        deletedAt: null,
        syncVersion: Math.max(incomingVersion, existing.syncVersion + 1),
        updatedAt: nowIso(),
      })
      .where(eq(schema.userSpools.id, existing.id))
      .run();
    replaceChildren(db, existing.id, input.dryingEvents, input.identities);
    return getOwnedSpool(db, userId, existing.uuid);
  }

  const spoolUuid = input.uuid ?? uuid();
  db.insert(schema.userSpools)
    .values({
      uuid: spoolUuid,
      userId,
      clientId: input.clientId ?? null,
      manufacturerUuid: input.manufacturerUuid ?? null,
      manufacturerName: input.manufacturerName ?? null,
      productUuid: input.productUuid ?? null,
      productName: input.productName ?? null,
      variantUuid: input.variantUuid ?? null,
      variantName: input.variantName ?? null,
      colorHex: input.colorHex ?? null,
      materialCode: input.materialCode ?? null,
      initialNetWeightG: input.initialNetWeightG ?? null,
      currentWeightG: input.currentWeightG ?? null,
      tareWeightG: input.tareWeightG ?? null,
      remainingPercent: input.remainingPercent ?? null,
      purchaseDate: input.purchaseDate ?? null,
      openedDate: input.openedDate ?? null,
      batchLot: input.batchLot ?? null,
      notes: input.notes ?? null,
      storageLocation: input.storageLocation ?? null,
      status: input.status ?? "sealed",
      preferredPrinterUuid: input.preferredPrinterUuid ?? null,
      preferredNozzleMm: input.preferredNozzleMm ?? null,
      archivedAt: input.archivedAt ?? null,
      syncVersion: incomingVersion,
    })
    .run();

  const inserted = db
    .select()
    .from(schema.userSpools)
    .where(eq(schema.userSpools.uuid, spoolUuid))
    .get()!;
  replaceChildren(db, inserted.id, input.dryingEvents, input.identities);
  return getOwnedSpool(db, userId, spoolUuid);
}

export function softDeleteUserSpool(db: AppDb, userId: number, spoolUuid: string) {
  const row = db
    .select()
    .from(schema.userSpools)
    .where(
      and(
        eq(schema.userSpools.uuid, spoolUuid),
        eq(schema.userSpools.userId, userId),
        isNull(schema.userSpools.deletedAt),
      ),
    )
    .get();
  if (!row) return false;
  db.update(schema.userSpools)
    .set({ deletedAt: nowIso(), updatedAt: nowIso() })
    .where(eq(schema.userSpools.id, row.id))
    .run();
  return true;
}

export function hardDeleteUserSpool(db: AppDb, userId: number, spoolUuid: string) {
  const row = db
    .select()
    .from(schema.userSpools)
    .where(
      and(
        eq(schema.userSpools.uuid, spoolUuid),
        eq(schema.userSpools.userId, userId),
      ),
    )
    .get();
  if (!row) return false;
  db.delete(schema.userSpools).where(eq(schema.userSpools.id, row.id)).run();
  return true;
}

/** Public QR resolution — never includes notes, location, email, or owner ids. */
export function resolvePublicSpoolByIdentity(
  db: AppDb,
  kind: "qr" | "rfid",
  value: string,
): PublicSpoolProjection | null {
  const identity = db
    .select()
    .from(schema.userSpoolIdentities)
    .where(
      and(
        eq(schema.userSpoolIdentities.kind, kind),
        eq(schema.userSpoolIdentities.value, value),
      ),
    )
    .get();
  if (!identity) return null;
  const spool = db
    .select()
    .from(schema.userSpools)
    .where(
      and(
        eq(schema.userSpools.id, identity.spoolId),
        isNull(schema.userSpools.deletedAt),
      ),
    )
    .get();
  if (!spool || spool.archivedAt) return null;
  return {
    uuid: spool.uuid,
    manufacturerName: spool.manufacturerName,
    productName: spool.productName,
    variantName: spool.variantName,
    colorHex: spool.colorHex,
    materialCode: spool.materialCode,
    status: spool.status === "archived" ? "stored" : spool.status,
    preferredNozzleMm: spool.preferredNozzleMm,
  };
}

export function purgeAllUserSpools(db: AppDb, userId: number) {
  const rows = db
    .select({ id: schema.userSpools.id })
    .from(schema.userSpools)
    .where(eq(schema.userSpools.userId, userId))
    .all();
  for (const r of rows) {
    db.delete(schema.userSpools).where(eq(schema.userSpools.id, r.id)).run();
  }
}
