"use client";

import { useMessages } from "@/app/components/messages-provider";
import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export function LoginForm() {
  const messages = useMessages();
  const m = messages.login;
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin-change-me");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as {
        user?: { uuid: string; username: string; role: string };
        error?: { message: string };
      };
      if (!res.ok) throw new Error(data.error?.message ?? "Login failed");
      if (data.user) {
        saveAuth({ user: data.user });
        setStatus(m.signedIn);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  return (
    <div className="stack">
      <form className="stack panel" onSubmit={onSubmit}>
        <label>
          {m.username}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          {m.password}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">{m.submit}</button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {status ? (
        <div className="panel">
          <p>{status}</p>
        </div>
      ) : null}
    </div>
  );
}
