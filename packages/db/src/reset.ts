import fs from "node:fs";
import { resolveDbPath } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import { seed } from "./seed.js";

export async function reset(dbPath?: string) {
  const resolved = resolveDbPath(dbPath);
  for (const suffix of ["", "-wal", "-shm"]) {
    const p = `${resolved}${suffix}`;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  ensureMigrated(resolved);
  await seed(resolved);
}

const isDirect =
  process.argv[1]?.endsWith("reset.ts") || process.argv[1]?.endsWith("reset.js");
if (isDirect) {
  reset().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
