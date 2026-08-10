"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { messages } from "@/lib/messages/en";

export function LoginForm() {
  const m = messages.login;
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin-change-me");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setToken("");
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as {
        token?: string;
        error?: { message: string };
      };
      if (!res.ok) throw new Error(data.error?.message ?? "Login failed");
      setToken(data.token ?? "");
      if (data.token) {
        window.localStorage.setItem("of_token", data.token);
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
      {token ? (
        <div className="panel">
          <p>Bearer token stored in localStorage (`of_token`):</p>
          <pre>{token}</pre>
        </div>
      ) : null}
    </div>
  );
}
