"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { authToken } from "@/lib/auth";

export function ConfirmFailButtons({ profileUuid }: { profileUuid: string }) {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function post(path: string, body: unknown) {
    setMsg("");
    setErr("");
    const token = authToken();
    if (!token) {
      setErr("Login required");
      return;
    }
    const res = await fetch(`${getApiBase()}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      setErr(text);
      return;
    }
    setMsg(text);
  }

  return (
    <div className="stack panel">
      <h3>Community feedback</h3>
      <div className="row" style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={() => post(`/api/v1/profiles/${profileUuid}/confirm`, {})}
        >
          Confirm works
        </button>
        <button
          type="button"
          onClick={() =>
            post(`/api/v1/profiles/${profileUuid}/failure`, {
              category: "other",
              notes: "Reported from profile page",
            })
          }
        >
          Report failure
        </button>
      </div>
      {msg ? <pre>{msg}</pre> : null}
      {err ? <div className="banner-warn">{err}</div> : null}
    </div>
  );
}
