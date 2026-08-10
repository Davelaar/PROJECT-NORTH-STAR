"use client";

import { useMessages } from "@/app/components/messages-provider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

export default function MePage() {
  const messages = useMessages();

  const [data, setData] = useState<{
    user: { uuid: string; username: string; role: string };
    profiles: Array<{ uuid: string; title: string }>;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = loadAuth();
    if (!auth) {
      setError("Not logged in");
      return;
    }
    apiGet<typeof data>(`/api/v1/users/${auth.user.uuid}/contributions`, auth.token)
      .then(setData)
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
  if (!data) return <p>{messages.common.loading}</p>;
  return (
    <div>
      <h1>{data.user.username}</h1>
      <p className="muted">{data.user.role}</p>
      <h2>Contributions</h2>
      <ul className="list">
        {data.profiles.map((p) => (
          <li key={p.uuid}>
            <Link href={`/profiles/${p.uuid}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
