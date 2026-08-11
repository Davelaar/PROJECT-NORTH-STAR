"use client";

import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export function RegisterForm() {
  const messages = useMessages();
  const m = messages.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    if (password !== password2) {
      setError(m.passwordMismatch);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        user?: { uuid: string; username: string; role: string };
        error?: { message: string };
      };
      if (!res.ok) throw new Error(data.error?.message ?? messages.common.error);
      if (data.user) {
        saveAuth({ user: data.user });
        setStatus(m.registeredOk);
        const next = new URLSearchParams(window.location.search).get("next");
        window.location.assign(
          next && next.startsWith("/") && !next.startsWith("//")
            ? next
            : "/my-spools/cloud",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <form className="stack panel" onSubmit={onSubmit}>
        <p className="muted">{m.registerLead}</p>
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
        <label>
          {m.password}
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label>
          {m.passwordConfirm}
          <input
            type="password"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <p className="muted">{m.privacyMinimal}</p>
        <button type="submit" disabled={busy}>
          {m.registerSubmit}
        </button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {status ? <div className="panel">{status}</div> : null}
      <p>
        <Link href="/login">{m.haveAccount}</Link>
      </p>
    </div>
  );
}
