"use client";

import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getApiBase } from "@/lib/api";

function ResetPasswordFormInner() {
  const messages = useMessages();
  const m = messages.login;
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    if (!token) {
      setError(m.resetInvalid);
      return;
    }
    if (password !== password2) {
      setError(m.passwordMismatch);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        throw new Error(data.error?.message ?? m.resetInvalid);
      }
      setStatus(m.resetOk);
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <form className="stack panel" onSubmit={onSubmit}>
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
        <button type="submit" disabled={busy || !token}>
          {m.resetSubmit}
        </button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {status ? (
        <div className="panel">
          <p>{status}</p>
          <Link href="/login">{m.backToLogin}</Link>
        </div>
      ) : null}
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
