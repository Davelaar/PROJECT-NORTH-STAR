/**
 * Merge duplicate manufacturer rows (same brand, different casing/UUID)
 * and canonicalize printer brand names.
 */
import { eq } from "drizzle-orm";
import {
  matchNormalizedName,
  normalizeNameKey,
} from "@open-filament/domain";
import { createDb, resolveDbPath } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import * as schema from "./schema.js";
import { rebuildSearchIndex } from "./search.js";

/** Canonical printer OEM names + spelling variants. */
export const PRINTER_BRAND_CANONICAL: Array<{
  canonical: string;
  keys: string[];
}> = [
  { canonical: "Creality", keys: ["creality", "creality 3d", "creality3d", "creality k1"] },
  { canonical: "Bambu Lab", keys: ["bambu", "bambu lab", "bambulab", "bbl"] },
  { canonical: "Prusa Research", keys: ["prusa", "prusa research", "prusa3d"] },
  { canonical: "Elegoo", keys: ["elegoo", "elegoo neptune"] },
  { canonical: "Flashforge", keys: ["flashforge", "flash forge"] },
  { canonical: "Flsun", keys: ["flsun"] },
  { canonical: "Qidi", keys: ["qidi", "qidi tech"] },
  { canonical: "Anycubic", keys: ["anycubic", "any cubic"] },
  { canonical: "RatRig", keys: ["ratrig", "rat rig"] },
  { canonical: "Voron Design", keys: ["voron", "voron design"] },
  { canonical: "Raise3D", keys: ["raise3d", "raise 3d"] },
  { canonical: "Ultimaker", keys: ["ultimaker"] },
  { canonical: "AnkerMake", keys: ["ankermake", "anker make", "anker"] },
  { canonical: "Uniformation", keys: ["uniformation", "uni formation"] },
  { canonical: "Sovol", keys: ["sovol"] },
  { canonical: "Snapmaker", keys: ["snapmaker"] },
  { canonical: "Formlabs", keys: ["formlabs"] },
];

export function canonicalPrinterBrand(name: string): string {
  const matched = matchNormalizedName(name, PRINTER_BRAND_CANONICAL);
  return matched.canonical ?? name.trim();
}

function preferManufacturer(
  a: typeof schema.manufacturers.$inferSelect,
  b: typeof schema.manufacturers.$inferSelect,
  productCounts: Map<number, number>,
): typeof schema.manufacturers.$inferSelect {
  const ca = productCounts.get(a.id) ?? 0;
  const cb = productCounts.get(b.id) ?? 0;
  // Prefer the row with more products
  if (ca !== cb) return ca > cb ? a : b;
  // Prefer non-fixture (real OFD import)
  if (a.isSyntheticFixture !== b.isSyntheticFixture) {
    return a.isSyntheticFixture ? b : a;
  }
  // Prefer stable shorter slug without uuid suffix
  if (a.slug.includes("-") !== b.slug.includes("-")) {
    return a.slug.includes("-") ? b : a;
  }
  return a.id < b.id ? a : b;
}

export function dedupeManufacturers(dbPath?: string): {
  merged: number;
  kept: number;
} {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);
  const all = db.select().from(schema.manufacturers).all();
  const productCounts = new Map<number, number>();
  for (const p of db.select().from(schema.filamentProducts).all()) {
    productCounts.set(
      p.manufacturerId,
      (productCounts.get(p.manufacturerId) ?? 0) + 1,
    );
  }

  const groups = new Map<string, typeof all>();
  for (const row of all) {
    const key = normalizeNameKey(row.name);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  let merged = 0;
  let kept = 0;

  for (const [, rows] of groups) {
    if (rows.length < 2) {
      kept += rows.length;
      continue;
    }
    let winner = rows[0]!;
    for (const r of rows.slice(1)) {
      winner = preferManufacturer(winner, r, productCounts);
    }
    kept += 1;
    const losers = rows.filter((r) => r.id !== winner.id);
    for (const loser of losers) {
      // Move products — resolve slug collisions under the winner
      const loserProducts = db
        .select()
        .from(schema.filamentProducts)
        .where(eq(schema.filamentProducts.manufacturerId, loser.id))
        .all();
      const winnerSlugs = new Set(
        db
          .select()
          .from(schema.filamentProducts)
          .where(eq(schema.filamentProducts.manufacturerId, winner.id))
          .all()
          .map((p) => p.slug),
      );
      for (const product of loserProducts) {
        let slug = product.slug;
        if (winnerSlugs.has(slug)) {
          slug = `${slug}-${product.uuid.slice(0, 8)}`;
        }
        winnerSlugs.add(slug);
        db.update(schema.filamentProducts)
          .set({ manufacturerId: winner.id, slug })
          .where(eq(schema.filamentProducts.id, product.id))
          .run();
      }
      // Move aliases
      const aliases = db
        .select()
        .from(schema.manufacturerAliases)
        .where(eq(schema.manufacturerAliases.manufacturerId, loser.id))
        .all();
      for (const alias of aliases) {
        const exists = db
          .select()
          .from(schema.manufacturerAliases)
          .where(eq(schema.manufacturerAliases.normalizedAlias, alias.normalizedAlias))
          .get();
        if (!exists) {
          db.update(schema.manufacturerAliases)
            .set({ manufacturerId: winner.id })
            .where(eq(schema.manufacturerAliases.id, alias.id))
            .run();
        } else {
          db.delete(schema.manufacturerAliases)
            .where(eq(schema.manufacturerAliases.id, alias.id))
            .run();
        }
      }
      // Ensure loser name is an alias of winner
      const loserKey = normalizeNameKey(loser.name);
      const aliasExists = db
        .select()
        .from(schema.manufacturerAliases)
        .where(eq(schema.manufacturerAliases.normalizedAlias, loserKey))
        .get();
      if (!aliasExists && loserKey !== normalizeNameKey(winner.name)) {
        db.insert(schema.manufacturerAliases)
          .values({
            manufacturerId: winner.id,
            alias: loser.name,
            normalizedAlias: loserKey,
          })
          .run();
      }
      db.delete(schema.manufacturers)
        .where(eq(schema.manufacturers.id, loser.id))
        .run();
      merged += 1;
    }
    // Normalize winner display name to title-ish canonical from first non-ALLCAPS
    const nice = rows.find((r) => r.name !== r.name.toUpperCase())?.name ?? winner.name;
    if (winner.name !== nice) {
      db.update(schema.manufacturers)
        .set({ name: nice })
        .where(eq(schema.manufacturers.id, winner.id))
        .run();
    }
  }

  rebuildSearchIndex(db);
  console.log(
    `Manufacturer dedupe: merged=${merged}, kept=${kept} → ${resolveDbPath(dbPath)}`,
  );
  return { merged, kept };
}

/** Clean printer OEM names + drop redundant/broken model labels. */
export function dedupePrinterBrands(dbPath?: string): {
  renamed: number;
  removedModels: number;
} {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);
  let renamed = 0;
  let removedModels = 0;

  const printers = db.select().from(schema.printerModels).all();
  for (const p of printers) {
    let brand = canonicalPrinterBrand(p.manufacturerName);
    let model = p.model.trim();

    // Strip duplicated brand tokens from model ("K1 Creality K1" → "K1")
    const brandKey = normalizeNameKey(brand);
    let modelKey = normalizeNameKey(model);
    if (modelKey.startsWith(`${brandKey} `)) {
      model = model.slice(brand.length).trim().replace(/^[-–—]\s*/, "");
    }
    // "K1 Creality K1" / "K1 Creality K1C"
    model = model
      .replace(new RegExp(`\\b${brand}\\b`, "gi"), " ")
      .replace(/\s+/g, " ")
      .trim();
    // Collapse "K1 K1" → "K1", and "K1 K1C" → "K1C" (prefix subsumed by next token)
    const parts = model.split(" ").filter(Boolean);
    const dedupedParts: string[] = [];
    for (const part of parts) {
      const prev = dedupedParts[dedupedParts.length - 1];
      if (prev && normalizeNameKey(prev) === normalizeNameKey(part)) {
        continue;
      }
      if (
        prev &&
        normalizeNameKey(part).startsWith(normalizeNameKey(prev)) &&
        normalizeNameKey(part).length > normalizeNameKey(prev).length
      ) {
        dedupedParts[dedupedParts.length - 1] = part;
        continue;
      }
      dedupedParts.push(part);
    }
    model = dedupedParts.join(" ") || p.model.trim();

    if (brand !== p.manufacturerName || model !== p.model) {
      // Collision on unique (manufacturer, model, revision)?
      const clash = db
        .select()
        .from(schema.printerModels)
        .where(eq(schema.printerModels.manufacturerName, brand))
        .all()
        .find(
          (o) =>
            o.id !== p.id &&
            normalizeNameKey(o.model) === normalizeNameKey(model) &&
            (o.revision ?? "1") === (p.revision ?? "1"),
        );
      if (clash) {
        // Move toolheads then delete duplicate
        db.update(schema.toolheadConfigs)
          .set({ printerModelId: clash.id })
          .where(eq(schema.toolheadConfigs.printerModelId, p.id))
          .run();
        // Profiles referencing this printer — retarget
        db.update(schema.calibrationProfiles)
          .set({ printerModelId: clash.id })
          .where(eq(schema.calibrationProfiles.printerModelId, p.id))
          .run();
        db.delete(schema.printerModels)
          .where(eq(schema.printerModels.id, p.id))
          .run();
        removedModels += 1;
        continue;
      }
      db.update(schema.printerModels)
        .set({ manufacturerName: brand, model })
        .where(eq(schema.printerModels.id, p.id))
        .run();
      renamed += 1;
    }
  }

  rebuildSearchIndex(db);
  console.log(
    `Printer brand cleanup: renamed=${renamed}, removedDuplicates=${removedModels} → ${resolveDbPath(dbPath)}`,
  );
  return { renamed, removedModels };
}

const isDirect =
  process.argv[1]?.endsWith("dedupe-brands.ts") ||
  process.argv[1]?.endsWith("dedupe-brands.js");
if (isDirect) {
  dedupeManufacturers();
  dedupePrinterBrands();
}
