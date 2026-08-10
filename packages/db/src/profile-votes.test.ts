import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { v4 as uuid } from "uuid";
import { createDb } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import {
  COMMUNITY_VERIFIED_THRESHOLD,
  castProfileVote,
  getProfileVoteSummary,
  voterKeyForAnon,
  voterKeyForUser,
} from "./profile-votes.js";
import * as schema from "./schema.js";

describe("profile community votes", () => {
  let dbPath: string;

  beforeEach(() => {
    dbPath = path.join(
      os.tmpdir(),
      `of-votes-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`,
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

  function seedProfile() {
    const db = createDb(dbPath);
    db.insert(schema.materialFamilies)
      .values({
        uuid: uuid(),
        code: "PLA",
        name: "PLA",
      })
      .run();
    const mat = db.select().from(schema.materialFamilies).all()[0]!;
    const mfrUuid = uuid();
    db.insert(schema.manufacturers)
      .values({ uuid: mfrUuid, name: "VoteBrand", slug: `vb-${mfrUuid.slice(0, 8)}` })
      .run();
    const mfr = db.select().from(schema.manufacturers).all()[0]!;
    const productUuid = uuid();
    db.insert(schema.filamentProducts)
      .values({
        uuid: productUuid,
        manufacturerId: mfr.id,
        materialFamilyId: mat.id,
        productName: "Basic",
        slug: `basic-${productUuid.slice(0, 8)}`,
      })
      .run();
    const product = db.select().from(schema.filamentProducts).all()[0]!;
    const variantUuid = uuid();
    db.insert(schema.filamentVariants)
      .values({
        uuid: variantUuid,
        filamentProductId: product.id,
        variantName: "Black",
        slug: `black-${variantUuid.slice(0, 8)}`,
      })
      .run();
    const variant = db.select().from(schema.filamentVariants).all()[0]!;
    const printerUuid = uuid();
    db.insert(schema.printerModels)
      .values({
        uuid: printerUuid,
        manufacturerName: "Test",
        model: "Printer",
        slug: `tp-${printerUuid.slice(0, 8)}`,
      })
      .run();
    const printer = db.select().from(schema.printerModels).all()[0]!;
    const toolUuid = uuid();
    db.insert(schema.toolheadConfigs)
      .values({
        uuid: toolUuid,
        printerModelId: printer.id,
        hotendName: "Stock",
        nozzleDiameterMm: 0.4,
      })
      .run();
    const tool = db.select().from(schema.toolheadConfigs).all()[0]!;
    const userUuid = uuid();
    db.insert(schema.users)
      .values({
        uuid: userUuid,
        username: "voter",
        displayName: "Voter",
        email: "v@example.com",
        passwordHash: "x",
        role: "registered",
      })
      .run();
    const user = db.select().from(schema.users).all()[0]!;
    const profileUuid = uuid();
    db.insert(schema.calibrationProfiles)
      .values({
        uuid: profileUuid,
        filamentVariantId: variant.id,
        printerModelId: printer.id,
        toolheadConfigId: tool.id,
        createdByUserId: user.id,
        title: "Vote test profile",
      })
      .run();
    return { db, profileUuid, userId: user.id };
  }

  it("verifies at net +5 and un-verifies after downvotes", () => {
    const { db, profileUuid } = seedProfile();
    for (let i = 0; i < COMMUNITY_VERIFIED_THRESHOLD; i++) {
      castProfileVote(db, {
        profileUuid,
        voterKey: voterKeyForAnon(`finger-${i}`),
        value: 1,
      });
    }
    let summary = getProfileVoteSummary(db, profileUuid)!;
    expect(summary.voteScore).toBe(5);
    expect(summary.communityVerified).toBe(true);

    castProfileVote(db, {
      profileUuid,
      voterKey: voterKeyForAnon("finger-0"),
      value: -1,
    });
    summary = getProfileVoteSummary(db, profileUuid)!;
    expect(summary.voteScore).toBe(3); // 4 up, 1 down after flip of one from +1 to -1
    expect(summary.communityVerified).toBe(false);
  });

  it("allows flipping and clearing a logged-in vote", () => {
    const { db, profileUuid, userId } = seedProfile();
    const key = voterKeyForUser(userId);
    castProfileVote(db, { profileUuid, voterKey: key, userId, value: 1 });
    let s = getProfileVoteSummary(db, profileUuid, key)!;
    expect(s.myVote).toBe(1);
    castProfileVote(db, { profileUuid, voterKey: key, userId, value: -1 });
    s = getProfileVoteSummary(db, profileUuid, key)!;
    expect(s.myVote).toBe(-1);
    expect(s.voteScore).toBe(-1);
    castProfileVote(db, { profileUuid, voterKey: key, userId, value: 0 });
    s = getProfileVoteSummary(db, profileUuid, key)!;
    expect(s.myVote).toBeNull();
    expect(s.voteScore).toBe(0);
  });
});
