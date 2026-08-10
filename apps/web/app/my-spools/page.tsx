"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { loadAuth } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { trackEvent } from "@/lib/analytics/ga";
import {
  clearAllLocalSpools,
  deleteLocalSpool,
  duplicateLocalSpool,
  exportLocalSpoolsJson,
  importLocalSpoolsJson,
  listLocalSpools,
  saveLocalSpool,
  type LocalSpool,
  type LocalSpoolStatus,
} from "@/lib/spools/local-db";

const STATUSES: LocalSpoolStatus[] = [
  "sealed",
  "open",
  "active",
  "drying",
  "stored",
  "low",
  "empty",
  "archived",
];

export default function MySpoolsPage() {
  const m = useMessages();
  const [spools, setSpools] = useState<LocalSpool[]>([]);
  const [editing, setEditing] = useState<Partial<LocalSpool> | null>(null);
  const [auth, setAuth] = useState<ReturnType<typeof loadAuth>>(null);
  const [syncPreview, setSyncPreview] = useState<LocalSpool[] | null>(null);
  const [message, setMessage] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const refresh = useCallback(async () => {
    setSpools(await listLocalSpools({ includeArchived: showArchived }));
  }, [showArchived]);

  useEffect(() => {
    setAuth(loadAuth());
    void refresh();
  }, [refresh]);

  async function onSave() {
    if (!editing) return;
    const saved = await saveLocalSpool(editing);
    trackEvent("local_spool_created", { status: saved.status });
    setEditing(null);
    setMessage(m.spools.save);
    await refresh();
  }

  async function onExport() {
    const json = await exportLocalSpoolsJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openfilament-spools-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(file: File) {
    const text = await file.text();
    const result = await importLocalSpoolsJson(text);
    setMessage(`Imported ${result.imported}, skipped ${result.skipped}`);
    await refresh();
  }

  async function onClear() {
    if (!window.confirm(m.spools.clearConfirm)) return;
    await clearAllLocalSpools();
    await refresh();
  }

  async function runSync(removeLocal: boolean) {
    if (!auth || !syncPreview) return;
    await apiPost(
      "/api/v1/spools/sync",
      { spools: syncPreview },
      auth.token,
    );
    trackEvent("cloud_sync_enabled");
    if (removeLocal) {
      for (const s of syncPreview) {
        await deleteLocalSpool(s.uuid, true);
      }
    }
    setSyncPreview(null);
    setMessage(m.spools.syncConfirm);
    await refresh();
  }

  return (
    <div className="my-spools">
      <h1>{m.spools.heading}</h1>
      <p>{m.spools.lead}</p>
      <p className="muted">{m.spools.localWarn}</p>
      <p className="muted">{m.spools.syncNeverAuto}</p>
      <p>
        <Link href="/my-spools/cloud">{m.cloud.pageTitle}</Link>
        {" · "}
        <Link href="/my-spools/billing">{m.cloud.billingLink}</Link>
      </p>
      <p className="muted">{m.cloud.syncRequiresCloud}</p>

      <div className="row gap">
        <button type="button" className="btn" onClick={() => setEditing({ status: "sealed" })}>
          {m.spools.create}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => void onExport()}>
          {m.spools.export}
        </button>
        <label className="btn btn-secondary">
          {m.spools.import}
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImport(f);
            }}
          />
        </label>
        <button type="button" className="btn btn-secondary" onClick={() => void onClear()}>
          {m.spools.clearAll}
        </button>
        <label>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />{" "}
          Archived
        </label>
      </div>

      {auth ? (
        <div className="panel">
          <h2>{m.spools.cloudMode}</h2>
          <p className="muted">{m.spools.conflictPolicy}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              setSyncPreview(await listLocalSpools({ includeArchived: true }));
            }}
          >
            {m.spools.syncPreview}
          </button>
          {syncPreview ? (
            <div>
              <p>
                {syncPreview.length} spool(s) ready to upload. Confirm to sync —
                nothing uploads until you confirm.
              </p>
              <button type="button" className="btn" onClick={() => void runSync(false)}>
                {m.spools.syncConfirm} ({m.spools.syncKeepLocal})
              </button>{" "}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void runSync(true)}
              >
                {m.spools.syncConfirm} ({m.spools.syncRemoveLocal})
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setSyncPreview(null)}>
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <p>
          <Link href="/login">{m.nav.login}</Link> /{" "}
          <Link href="/account">{m.account.register}</Link> {m.spools.cloudMode}
        </p>
      )}

      {message ? <p role="status">{message}</p> : null}

      {editing ? (
        <form
          className="spool-form panel"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave();
          }}
        >
          <h2>{editing.uuid ? "Edit spool" : m.spools.create}</h2>
          <label>
            {m.fields.manufacturer}
            <input
              value={editing.manufacturerName ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, manufacturerName: e.target.value }))
              }
            />
          </label>
          <label>
            {m.fields.product}
            <input
              value={editing.productName ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, productName: e.target.value }))
              }
            />
          </label>
          <label>
            {m.fields.variant}
            <input
              value={editing.variantName ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, variantName: e.target.value }))
              }
            />
          </label>
          <label>
            {m.spools.status}
            <select
              value={editing.status ?? "sealed"}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  status: e.target.value as LocalSpoolStatus,
                }))
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            {m.spools.initial}
            <input
              type="number"
              value={editing.initialNetWeightG ?? ""}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  initialNetWeightG: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
          </label>
          <label>
            {m.spools.weight}
            <input
              type="number"
              value={editing.currentWeightG ?? ""}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  currentWeightG: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
          </label>
          <label>
            {m.spools.tare}
            <input
              type="number"
              value={editing.tareWeightG ?? ""}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  tareWeightG: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
          </label>
          <label>
            {m.spools.remaining}
            <input
              type="number"
              value={editing.remainingPercent ?? ""}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  remainingPercent: e.target.value ? Number(e.target.value) : null,
                }))
              }
            />
          </label>
          <label>
            {m.spools.location}
            <input
              value={editing.storageLocation ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, storageLocation: e.target.value }))
              }
            />
          </label>
          <label>
            {m.spools.batch}
            <input
              value={editing.batchLot ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, batchLot: e.target.value }))
              }
            />
          </label>
          <label>
            {m.spools.purchase}
            <input
              type="date"
              value={editing.purchaseDate ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, purchaseDate: e.target.value }))
              }
            />
          </label>
          <label>
            {m.spools.opened}
            <input
              type="date"
              value={editing.openedDate ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, openedDate: e.target.value }))
              }
            />
          </label>
          <label>
            {m.spools.notes}
            <textarea
              value={editing.notes ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, notes: e.target.value }))
              }
            />
          </label>
          <label>
            {m.spools.qr}
            <input
              placeholder="openfilament://spool/…"
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (!value) return;
                setEditing((s) => ({
                  ...s,
                  identities: [
                    ...(s?.identities ?? []).filter((i) => i.kind !== "qr"),
                    {
                      uuid: crypto.randomUUID(),
                      kind: "qr" as const,
                      value,
                    },
                  ],
                }));
              }}
            />
          </label>
          <div className="row gap">
            <button type="submit" className="btn">
              {m.spools.save}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {spools.length === 0 ? (
        <p>{m.spools.empty}</p>
      ) : (
        <ul className="spool-list">
          {spools.map((s) => (
            <li key={s.uuid} className="spool-card">
              <h3>
                {s.manufacturerName || "—"} {s.productName || ""}{" "}
                {s.variantName || ""}
              </h3>
              <p className="muted">
                {s.status}
                {s.remainingPercent != null ? ` · ${s.remainingPercent}%` : ""}
                {s.currentWeightG != null ? ` · ${s.currentWeightG}g` : ""}
              </p>
              <p className="muted mono">{s.uuid}</p>
              <div className="row gap">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(s)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    await duplicateLocalSpool(s.uuid);
                    await refresh();
                  }}
                >
                  {m.spools.duplicate}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    await saveLocalSpool({
                      ...s,
                      archivedAt: s.archivedAt ? null : new Date().toISOString(),
                      status: s.archivedAt ? "stored" : "archived",
                    });
                    await refresh();
                  }}
                >
                  {s.archivedAt ? m.spools.restore : m.spools.archive}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={async () => {
                    if (!window.confirm(m.spools.delete + "?")) return;
                    await deleteLocalSpool(s.uuid, true);
                    await refresh();
                  }}
                >
                  {m.spools.delete}
                </button>
                <Link href={`/label/${s.variantUuid || s.uuid}`}>{m.nav.label}</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
