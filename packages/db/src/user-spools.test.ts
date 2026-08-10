import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { v4 as uuid } from "uuid";
import {
  createDb,
  deleteUserAccount,
  ensureMigrated,
  exportUserData,
  getOwnedSpool,
  hashPassword,
  resolvePublicSpoolByIdentity,
  schema,
  softDeleteUserSpool,
  upsertUserSpool,
} from "./index.js";

describe("user spools privacy", () => {
  let dbPath: string;

  beforeEach(() => {
    dbPath = path.join(
      os.tmpdir(),
      `of-spool-test-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`,
    );
    ensureMigrated(dbPath);
  });

  afterEach(() => {
    try {
      fs.unlinkSync(dbPath);
    } catch {
      // ignore
    }
  });

  async function seedUsers() {
    const db = createDb(dbPath);
    db.insert(schema.users)
      .values({
        uuid: uuid(),
        username: "alice",
        displayName: "Alice",
        email: "alice@example.com",
        passwordHash: await hashPassword("password-alice"),
        role: "registered",
      })
      .run();
    db.insert(schema.users)
      .values({
        uuid: uuid(),
        username: "bob",
        displayName: "Bob",
        email: "bob@example.com",
        passwordHash: await hashPassword("password-bob"),
        role: "registered",
      })
      .run();
    const alice = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, "alice"))
      .get()!;
    const bob = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, "bob"))
      .get()!;
    return { db, alice, bob };
  }

  it("enforces ownership and hides private fields on public QR", async () => {
    const { db, alice, bob } = await seedUsers();
    const qrValue = `openfilament://spool/${uuid()}`;
    const spool = upsertUserSpool(db, alice.id, {
      clientId: uuid(),
      manufacturerName: "TestBrand",
      productName: "PLA",
      variantName: "Black",
      notes: "secret shelf notes",
      storageLocation: "Garage A",
      identities: [{ kind: "qr", value: qrValue }],
    });
    expect(spool?.notes).toBe("secret shelf notes");
    expect(getOwnedSpool(db, bob.id, spool!.uuid)).toBeNull();

    const pub = resolvePublicSpoolByIdentity(db, "qr", qrValue);
    expect(pub?.manufacturerName).toBe("TestBrand");
    expect(JSON.stringify(pub)).not.toMatch(/secret|Garage|alice@/i);
  });

  it("exports and deletes account private data", async () => {
    const { db, alice } = await seedUsers();
    upsertUserSpool(db, alice.id, {
      clientId: uuid(),
      manufacturerName: "Brand",
      notes: "private",
    });
    const exported = exportUserData(db, alice.id);
    expect(exported?.spools.length).toBe(1);
    expect(exported?.account.email).toBe("alice@example.com");

    deleteUserAccount(db, alice.id);
    const after = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, alice.id))
      .get()!;
    expect(after.status).toBe("deleted");
    expect(after.email).toMatch(/deleted\.invalid$/);
    expect(exportUserData(db, alice.id)?.spools.length).toBe(0);
  });

  it("soft-deletes spools for the owner only", async () => {
    const { db, alice, bob } = await seedUsers();
    const spool = upsertUserSpool(db, alice.id, {
      clientId: uuid(),
      manufacturerName: "X",
    });
    expect(softDeleteUserSpool(db, bob.id, spool!.uuid)).toBe(false);
    expect(softDeleteUserSpool(db, alice.id, spool!.uuid)).toBe(true);
    expect(getOwnedSpool(db, alice.id, spool!.uuid)).toBeNull();
  });

  it("syncs usage transactions owner-scoped and includes them in export", async () => {
    const { db, alice, bob } = await seedUsers();
    const txUuid = uuid();
    const spool = upsertUserSpool(db, alice.id, {
      clientId: uuid(),
      manufacturerName: "Brand",
      currentWeightG: 800,
      initialNetWeightG: 1000,
      tareWeightG: 150,
      usageTransactions: [
        {
          uuid: txUuid,
          spoolId: "client-spool",
          printJobId: "job-1",
          eventId: "event-1",
          slicer: "OrcaSlicer",
          slicerVersion: "2.2",
          printerIntegrationType: "manual",
          status: "completed",
          predicted: { weightG: 42, lengthMm: 14000, volumeMm3: 34000 },
          printerReported: {},
          deducted: { weightG: 42 },
          materialDensityGcm3: 1.24,
          filamentDiameterMm: 1.75,
          usageSource: "completed_print_estimate",
          confidence: "completed_print_estimate",
          recordedAt: "2026-08-10T00:00:00.000Z",
          automaticallyGenerated: false,
          manuallyConfirmed: true,
          originalValues: { predictedWeightG: 42 },
        },
      ],
    });
    const owned = getOwnedSpool(db, alice.id, spool!.uuid)!;
    expect(owned.usageTransactions).toHaveLength(1);
    expect(owned.usageTransactions[0]?.spoolId).toBe(spool!.uuid);
    expect(getOwnedSpool(db, bob.id, spool!.uuid)).toBeNull();

    const exported = exportUserData(db, alice.id)!;
    expect(exported.spools[0]?.usageTransactions).toHaveLength(1);
    expect(JSON.stringify(exported.spools[0])).toContain("completed_print_estimate");
  });

  it("purges usage transactions when an account is deleted", async () => {
    const { db, alice } = await seedUsers();
    upsertUserSpool(db, alice.id, {
      clientId: uuid(),
      usageTransactions: [
        {
          uuid: uuid(),
          spoolId: "client-spool",
          status: "unknown",
          predicted: {},
          printerReported: {},
          deducted: { weightG: 25 },
          materialDensityGcm3: 1.24,
          filamentDiameterMm: 1.75,
          usageSource: "manual_correction",
          confidence: "manual",
          recordedAt: "2026-08-10T00:00:00.000Z",
          automaticallyGenerated: false,
          manuallyConfirmed: true,
          originalValues: { amountG: 25, mode: "used" },
        },
      ],
    });
    expect(db.select().from(schema.userSpoolUsageTransactions).all()).toHaveLength(1);
    deleteUserAccount(db, alice.id);
    expect(db.select().from(schema.userSpoolUsageTransactions).all()).toHaveLength(0);
  });
});
