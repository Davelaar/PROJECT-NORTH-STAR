import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildServer } from "./index.js";
import type { FastifyInstance } from "fastify";
import { schema } from "@open-filament/db";

describe("API health", () => {
  let app: FastifyInstance;
  let dbPath: string;

  beforeAll(async () => {
    dbPath = path.join(os.tmpdir(), `of-api-test-${Date.now()}.sqlite`);
    app = await buildServer({ dbPath });
  });

  afterAll(async () => {
    await app.close();
    for (const suffix of ["", "-wal", "-shm"]) {
      const p = `${dbPath}${suffix}`;
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  });

  it("GET /api/v1/health", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json().ok).toBe(true);
  });

  it("GET /api/v1/manufacturers returns seeded data", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/manufacturers" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as Array<{ name: string }>;
    expect(body.some((m) => m.name === "Flashforge")).toBe(true);
  });

  it("GET /api/v1/variants/:uuid/exports/starter supports non-Creality printer contexts", async () => {
    app.db
      .insert(schema.printerModels)
      .values({
        uuid: "55555555-5555-4555-8555-555555555501",
        manufacturerName: "Flashforge",
        model: "Adventurer 5M Pro",
        slug: "flashforge-adventurer-5m-pro-test",
        technology: "fff",
        kinematics: "corexy",
        maxNozzleTempC: 280,
        maxBedTempC: 110,
        chamberCapable: true,
        extruderType: "direct_drive",
        maxSpeedMmS: 600,
        isSyntheticFixture: true,
      })
      .run();

    const baseUrl =
      "/api/v1/variants/33333333-3333-4333-8333-333333333301/exports/starter" +
      "?printerUuid=55555555-5555-4555-8555-555555555501&nozzleDiameterMm=0.4";
    const canonical = await app.inject({
      method: "GET",
      url: `${baseUrl}&format=openfilamentprofile`,
    });
    expect(canonical.statusCode).toBe(200);
    const profile = canonical.json();
    expect(profile.context.printerManufacturer).toBe("Flashforge");
    expect(profile.context.printerModel).toBe("Adventurer 5M Pro");
    expect(profile.provenance.sourceNotes).toContain("Calculated, untested");

    const orca = await app.inject({
      method: "GET",
      url: `${baseUrl}&format=orca`,
    });
    expect(orca.statusCode).toBe(200);
    expect(orca.headers["content-disposition"]).toContain("orca");
    expect(orca.headers["content-disposition"]).toContain("flashforge");
  });
});
