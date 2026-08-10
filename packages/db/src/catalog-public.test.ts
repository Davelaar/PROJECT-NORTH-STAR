import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import * as schema from "./schema.js";
import {
  getCatalogPreview,
  isPlaceholderIdentifier,
  searchCatalogProducts,
} from "./catalog-public.js";

const tempDbs: string[] = [];

function tempDbPath(): string {
  const p = path.join(
    os.tmpdir(),
    `of-catalog-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`,
  );
  tempDbs.push(p);
  return p;
}

afterEach(() => {
  for (const p of tempDbs.splice(0)) {
    try {
      fs.unlinkSync(p);
    } catch {
      /* ignore */
    }
    try {
      fs.unlinkSync(`${p}-wal`);
    } catch {
      /* ignore */
    }
    try {
      fs.unlinkSync(`${p}-shm`);
    } catch {
      /* ignore */
    }
  }
});

function seedCatalog(dbPath: string) {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);

  const [mfr] = db
    .insert(schema.manufacturers)
    .values({
      uuid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "Flashforge",
      slug: "flashforge",
      isSyntheticFixture: false,
    })
    .returning()
    .all();

  const [mat] = db
    .insert(schema.materialFamilies)
    .values({
      uuid: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      code: "ASA",
      name: "ASA",
      category: "engineering",
    })
    .returning()
    .all();

  // Duplicate ASA: fixture + OFD — public search must keep one
  db.insert(schema.filamentProducts)
    .values({
      uuid: "22222222-2222-4222-8222-222222222201",
      manufacturerId: mfr!.id,
      materialFamilyId: mat!.id,
      productName: "ASA",
      slug: "flashforge-asa-fixture",
      description: "fixture",
      isSyntheticFixture: true,
      sourceType: "synthetic_fixture",
    })
    .run();

  const [ofd] = db
    .insert(schema.filamentProducts)
    .values({
      uuid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      manufacturerId: mfr!.id,
      materialFamilyId: mat!.id,
      productName: "ASA",
      slug: "flashforge-asa",
      description: "ofd",
      isSyntheticFixture: false,
      sourceType: "open_filament_database",
      mfrNozzleTempMinC: 240,
      mfrNozzleTempMaxC: 260,
      mfrBedTempMinC: 90,
      mfrBedTempMaxC: 110,
    })
    .returning()
    .all();

  db.insert(schema.filamentVariants)
    .values({
      uuid: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      filamentProductId: ofd!.id,
      variantName: "Burnt Titanium",
      slug: "burnt-titanium",
      colorName: "Burnt Titanium",
      primaryColorHex: "#6B5E54",
      ean: "0000000000000",
      isSyntheticFixture: false,
    })
    .run();

  // Another public product for preview bounds
  for (let i = 0; i < 20; i++) {
    db.insert(schema.filamentProducts)
      .values({
        uuid: `dddddddd-dddd-4ddd-8ddd-${String(i).padStart(12, "0")}`,
        manufacturerId: mfr!.id,
        materialFamilyId: mat!.id,
        productName: `PLA Extra ${i}`,
        slug: `pla-extra-${i}`,
        isSyntheticFixture: false,
        sourceType: "open_filament_database",
      })
      .run();
  }

  return db;
}

describe("catalog-public", () => {
  it("bounds homepage preview to 12 items", () => {
    const dbPath = tempDbPath();
    const db = seedCatalog(dbPath);
    const preview = getCatalogPreview(db, { limit: 12 });
    const count = preview.sections.reduce((n, s) => n + s.items.length, 0);
    expect(count).toBeLessThanOrEqual(12);
    expect(preview.totalLimit).toBe(12);
    expect(
      preview.sections.flatMap((s) => s.items).every((i) => i.uuid !== "22222222-2222-4222-8222-222222222201"),
    ).toBe(true);
  });

  it("dedupes Flashforge ASA and excludes fixtures", () => {
    const dbPath = tempDbPath();
    const db = seedCatalog(dbPath);
    const result = searchCatalogProducts(db, { q: "Flashforge ASA", pageSize: 24 });
    const asa = result.results.filter(
      (r) =>
        r.manufacturerName === "Flashforge" &&
        r.productName.toLowerCase() === "asa",
    );
    expect(asa).toHaveLength(1);
    expect(asa[0]!.uuid).toBe("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    expect(asa[0]!.provenance).toBe("catalog");
  });

  it("paginates search results", () => {
    const dbPath = tempDbPath();
    const db = seedCatalog(dbPath);
    const page1 = searchCatalogProducts(db, { page: 1, pageSize: 5 });
    const page2 = searchCatalogProducts(db, { page: 2, pageSize: 5 });
    expect(page1.results).toHaveLength(5);
    expect(page2.results.length).toBeGreaterThan(0);
    expect(page1.results[0]!.uuid).not.toBe(page2.results[0]!.uuid);
    expect(page1.total).toBeGreaterThan(5);
  });

  it("detects placeholder identifiers", () => {
    expect(isPlaceholderIdentifier("0000000000000")).toBe(true);
    expect(isPlaceholderIdentifier("8712345678901")).toBe(false);
    expect(isPlaceholderIdentifier(null)).toBe(true);
  });
});
