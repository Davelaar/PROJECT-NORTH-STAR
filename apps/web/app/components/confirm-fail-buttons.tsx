"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

export function ConfirmFailButtons({ profileUuid }: { profileUuid: string }) {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function post(path: string, body: unknown) {
    setMsg("");
    setErr("");
    if (!loadAuth()) {
      setErr("Login required");
      return;
    }
    try {
      const result = await apiPost<unknown>(path, body);
      setMsg(JSON.stringify(result, null, 2));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
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
