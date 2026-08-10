import { describe, expect, it, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildServer } from "./index.js";
import type { FastifyInstance } from "fastify";

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
});
