"use client";

import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { useState } from "react";
import { getApiBase } from "@/lib/api";

export function ForgotPasswordForm() {
  const messages = useMessages();
  const m = messages.login;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    setBusy(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        throw new Error(data.error?.message ?? messages.common.error);
      }
      setStatus(m.forgotSent);
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <form className="stack panel" onSubmit={onSubmit}>
        <p className="muted">{m.forgotLead}</p>
        <label>
          {m.email}
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={busy}>
          {m.forgotSubmit}
        </button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {status ? <div className="panel">{status}</div> : null}
      <p>
        <Link href="/login">{m.backToLogin}</Link>
      </p>
    </div>
  );
}
