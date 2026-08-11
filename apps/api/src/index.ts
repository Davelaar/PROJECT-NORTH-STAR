import Fastify from "fastify";
import cors from "@fastify/cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import {
  createDb,
  ensureMigrated,
  importOfdCatalog,
  schema,
  seed,
  type AppDb,
} from "@open-filament/db";
import { CSRF_COOKIE, CSRF_HEADER, getCookieValue, SESSION_COOKIE } from "./auth.js";
import { registerRoutes } from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function ensureCatalog(dbPath: string | undefined, database: AppDb) {
  const manufacturers = database.select().from(schema.manufacturers).all();
  if (manufacturers.length === 0) {
    await seed(dbPath);
    return;
  }

  // Production often seeds fixtures first without the OFD dump present.
  // If the dump appears later (or is mounted), import once automatically.
  const ofdProducts = database
    .select({ id: schema.filamentProducts.id })
    .from(schema.filamentProducts)
    .where(eq(schema.filamentProducts.sourceType, "open_filament_database"))
    .all();
  if (ofdProducts.length > 0) return;

  const candidates = [
    process.env.OFD_DATASET_PATH,
    "/data/external/ofd-all.json",
    path.resolve(__dirname, "../../../data/external/ofd-all.json"),
  ].filter(Boolean) as string[];
  const hit = candidates.find((p) => fs.existsSync(p));
  if (!hit) return;

  console.log(`Importing Open Filament Database catalog from ${hit}`);
  await importOfdCatalog(dbPath, hit);
}

export async function buildServer(options?: { dbPath?: string }) {
  const dbPath = options?.dbPath;
  ensureMigrated(dbPath);
  const database = createDb(dbPath);
  await ensureCatalog(dbPath, database);

  const app = Fastify({ logger: true });
  app.decorate("db", database as AppDb);

  // Preserve raw JSON body for Stripe webhook signature verification.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      const buf = body as Buffer;
      (req as { rawBody?: Buffer }).rawBody = buf;
      try {
        done(null, JSON.parse(buf.toString("utf8")));
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  const webOrigin = process.env.WEB_ORIGIN ?? "http://127.0.0.1:3000";
  await app.register(cors, {
    origin: webOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  });

  app.addHook("preHandler", async (req, reply) => {
    const method = req.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
    const url = req.url.split("?")[0] ?? req.url;
    if (
      url === "/api/v1/auth/login" ||
      url === "/api/v1/auth/register" ||
      url === "/api/v1/auth/forgot-password" ||
      url === "/api/v1/auth/reset-password" ||
      url === "/api/v1/billing/webhooks/stripe"
    ) {
      return;
    }
    // API clients using Bearer tokens are not protected by cookies and do not need CSRF.
    if (String(req.headers.authorization ?? "").startsWith("Bearer ")) return;
    const session = getCookieValue(req.headers.cookie, SESSION_COOKIE);
    if (!session) return;
    const cookieToken = getCookieValue(req.headers.cookie, CSRF_COOKIE);
    const headerToken = String(req.headers[CSRF_HEADER] ?? "");
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return reply.status(403).send({
        error: {
          code: "csrf_required",
          message: "CSRF token is required for cookie-authenticated writes",
        },
      });
    }
  });

  await app.register(import("@fastify/rate-limit"), {
    max: Number(process.env.API_RATE_LIMIT_MAX ?? 300),
    timeWindow: "1 minute",
  });

  await registerRoutes(app);
  const { registerExtraRoutes } = await import("./routes-extra.js");
  await registerExtraRoutes(app);
  const { registerPrivacySpoolRoutes } = await import(
    "./routes-privacy-spools.js"
  );
  await registerPrivacySpoolRoutes(app);
  const { registerCloudBillingRoutes } = await import("./routes-cloud.js");
  await registerCloudBillingRoutes(app);

  // Friendly root — browsers often open the API port and hit Fastify's bare 404.
  app.get("/", async (req, reply) => {
    const web = process.env.WEB_ORIGIN ?? "http://127.0.0.1:3000";
    const accept = String(req.headers.accept ?? "");
    if (accept.includes("text/html")) {
      return reply.redirect(web);
    }
    return {
      service: "open-filament-api",
      message: `This is the API. Open the web UI at ${web} (run: pnpm dev).`,
      health: "/api/v1/health",
      openapi: "/api/v1/openapi.json",
      docs: "See README.md and docs/",
    };
  });

  return app;
}

async function main() {
  const host = process.env.API_HOST ?? "127.0.0.1";
  const port = Number(process.env.API_PORT ?? "8787");
  const app = await buildServer();
  await app.listen({ host, port });
  app.log.info(`Open Filament API listening on http://${host}:${port}`);
}

const isDirect =
  process.argv[1] &&
  (process.argv[1].endsWith("index.ts") || process.argv[1].endsWith("index.js"));

if (isDirect) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
