import {
  getCloudEntitlementView,
  loadCloudConfigFromEnv,
  type AppDb,
} from "@open-filament/db";

/** Cloud write access for spool mutations. Local IndexedDB is unaffected. */
export function assertCloudWriteAccess(
  database: AppDb,
  userId: number,
): { ok: true } | { ok: false; status: number; message: string } {
  const config = loadCloudConfigFromEnv();
  const view = getCloudEntitlementView(database, userId, config);
  if (view.canWriteCloud) return { ok: true };
  if (view.accessMode === "read_only") {
    return {
      ok: false,
      status: 403,
      message:
        "My Spools Cloud is read-only. Export your data or purchase another 12 months (one-time, no automatic renewal).",
    };
  }
  return {
    ok: false,
    status: 402,
    message:
      "My Spools Cloud access required. Buy 12 months for a one-time payment — no automatic renewal.",
  };
}
