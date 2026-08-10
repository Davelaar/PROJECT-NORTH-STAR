"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { apiGet, apiPost } from "@/lib/api";
import { clearAuth, loadAuth } from "@/lib/auth";
import { openCookieSettings } from "@/app/components/consent-manager";

export default function AccountPage() {
  const m = useMessages();
  const [auth, setAuth] = useState<ReturnType<typeof loadAuth>>(null);
  const [sessions, setSessions] = useState<
    Array<{ uuid: string; name: string; createdAt: string; lastUsedAt?: string | null }>
  >([]);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const a = loadAuth();
    setAuth(a);
    if (!a) return;
    apiGet<{ sessions: typeof sessions }>("/api/v1/me/sessions", a.token)
      .then((r) => setSessions(r.sessions))
      .catch(() => setStatus("Could not load sessions"));
  }, []);

  if (!auth) {
    return (
      <div>
        <h1>{m.account.heading}</h1>
        <p>
          <Link href="/login">{m.nav.login}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="account-page">
      <h1>{m.account.heading}</h1>
      <p>
        {auth.user.username} · <span className="muted">{auth.user.uuid}</span>
      </p>

      <section>
        <h2>{m.account.sessions}</h2>
        <ul>
          {sessions.map((s) => (
            <li key={s.uuid}>
              {s.name} · {s.createdAt}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => {
                  await apiPost(`/api/v1/me/sessions/${s.uuid}/revoke`, {}, auth.token);
                  setSessions((prev) => prev.filter((x) => x.uuid !== s.uuid));
                }}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={async () => {
            await apiPost("/api/v1/me/sessions/revoke-others", {}, auth.token);
            setStatus(m.account.revokeOthers);
          }}
        >
          {m.account.revokeOthers}
        </button>
      </section>

      <section>
        <h2>{m.account.exportData}</h2>
        <button
          type="button"
          className="btn"
          onClick={async () => {
            const data = await apiGet<unknown>("/api/v1/me/export", auth.token);
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `openfilament-account-${auth.user.uuid}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          {m.account.exportData}
        </button>
      </section>

      <section>
        <h2>{m.account.privacyPrefs}</h2>
        <button type="button" className="btn btn-secondary" onClick={() => openCookieSettings()}>
          {m.footer.cookieSettings}
        </button>
      </section>

      <section>
        <h2>{m.account.deleteAccount}</h2>
        <p className="muted">{m.account.deleteWarn}</p>
        <label>
          {m.account.deleteConfirmLabel}
          <input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn"
          disabled={deleteConfirm !== "DELETE"}
          onClick={async () => {
            await apiPost(
              "/api/v1/me/delete",
              { confirm: "DELETE", password },
              auth.token,
            );
            clearAuth();
            window.location.href = "/";
          }}
        >
          {m.account.deleteAccount}
        </button>
      </section>

      {status ? <p role="status">{status}</p> : null}
      <p>
        <Link href="/my-spools">{m.nav.mySpools}</Link> ·{" "}
        <Link href="/me">{m.nav.me}</Link>
      </p>
    </div>
  );
}
