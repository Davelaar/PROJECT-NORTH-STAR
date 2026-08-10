import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  createDb,
  ensureMigrated,
  schema,
  seed,
  type AppDb,
} from "@open-filament/db";
import { registerRoutes } from "./routes.js";

export async function buildServer(options?: { dbPath?: string }) {
  const dbPath = options?.dbPath;
  ensureMigrated(dbPath);
  const database = createDb(dbPath);

  const manufacturers = database.select().from(schema.manufacturers).all();
  if (manufacturers.length === 0) {
    await seed(dbPath);
  }

  const app = Fastify({ logger: true });
  app.decorate("db", database as AppDb);

  const webOrigin = process.env.WEB_ORIGIN ?? "http://127.0.0.1:3000";
  await app.register(cors, {
    origin: webOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  });

  await app.register(import("@fastify/rate-limit"), {
    max: Number(process.env.API_RATE_LIMIT_MAX ?? 300),
    timeWindow: "1 minute",
  });

  await registerRoutes(app);
  const { registerExtraRoutes } = await import("./routes-extra.js");
  await registerExtraRoutes(app);

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
