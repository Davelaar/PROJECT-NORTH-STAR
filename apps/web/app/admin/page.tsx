"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { loadAuth } from "@/lib/auth";
import { messages } from "@/lib/messages/en";

export default function AdminPage() {
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const auth = loadAuth();
    if (!auth) {
      setError("Login required");
      return;
    }
    apiGet<Record<string, number>>("/api/v1/admin/summary", auth.token)
      .then(setSummary)
      .catch((e) => setError(String(e)));
  }, []);
  if (error) {
    return (
      <div>
        <p>{error}</p>
        <Link href="/login">{messages.nav.login}</Link>
      </div>
    );
  }
  if (!summary) return <p>{messages.common.loading}</p>;
  return (
    <div>
      <h1>Admin</h1>
      <dl className="kv">
        {Object.entries(summary).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
