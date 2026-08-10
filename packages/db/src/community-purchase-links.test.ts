import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDb } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import {
  addPurchaseLinkToVariant,
  resolveOrCreateFilamentProduct,
  resolveOrCreateFilamentVariant,
  resolveOrCreateManufacturer,
} from "./community-catalog.js";
import * as schema from "./schema.js";

describe("addPurchaseLinkToVariant", () => {
  let dbPath: string;

  beforeEach(() => {
    dbPath = path.join(
      os.tmpdir(),
      `of-buy-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`,
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

  it("appends community shop links and dedupes by URL", () => {
    const db = createDb(dbPath);
    db.insert(schema.materialFamilies)
      .values({
        uuid: "11111111-1111-4111-8111-111111111111",
        code: "PLA",
        name: "PLA",
      })
      .run();
    const mfr = resolveOrCreateManufacturer(db, "TestBrand Buy");
    const product = resolveOrCreateFilamentProduct(db, {
      manufacturerUuid: mfr.uuid,
      materialCode: "PLA",
      productName: "Basic",
    });
    const variant = resolveOrCreateFilamentVariant(db, {
      filamentProductUuid: product.uuid,
      variantName: "Black",
    });

    const first = addPurchaseLinkToVariant(db, {
      variantUuid: variant.uuid,
      storeName: "Brand shop",
      url: "https://example.com/shop/black",
    });
    expect(first.created).toBe(true);
    expect(first.purchaseLinks).toHaveLength(1);
    expect(first.purchaseLinks[0]?.source).toBe("community");

    const again = addPurchaseLinkToVariant(db, {
      variantUuid: variant.uuid,
      storeName: "Same URL",
      url: "https://example.com/shop/black/",
    });
    expect(again.created).toBe(false);
    expect(again.purchaseLinks).toHaveLength(1);

    const second = addPurchaseLinkToVariant(db, {
      variantUuid: variant.uuid,
      storeName: "Reseller",
      url: "https://reseller.example/item/1",
    });
    expect(second.created).toBe(true);
    expect(second.purchaseLinks).toHaveLength(2);
  });
});
