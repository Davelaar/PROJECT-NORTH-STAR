"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

export default function AdminCloudPage() {
  const [payments, setPayments] = useState<unknown[]>([]);
  const [entitlements, setEntitlements] = useState<unknown[]>([]);
  const [error, setError] = useState("");
  const [grantUser, setGrantUser] = useState("");
  const [grantMonths, setGrantMonths] = useState(12);
  const [grantReason, setGrantReason] = useState("");

  useEffect(() => {
    const auth = loadAuth();
    if (!auth) {
      setError("Login required");
      return;
    }
    Promise.all([
      apiGet<{ payments: unknown[] }>("/api/v1/admin/cloud/payments"),
      apiGet<{ entitlements: unknown[] }>(
        "/api/v1/admin/cloud/entitlements",
      ),
    ])
      .then(([p, e]) => {
        setPayments(p.payments);
        setEntitlements(e.entitlements);
      })
      .catch((err) => setError(String(err)));
  }, []);

  async function manualGrant() {
    const auth = loadAuth();
    if (!auth) return;
    await apiPost(
      "/api/v1/admin/cloud/grants",
      {
        userUuid: grantUser,
        months: grantMonths,
        reason: grantReason,
      },
    );
    window.location.reload();
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <Link href="/login">Log in</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Admin · My Spools Cloud</h1>
      <p>
        Prepaid access only — no automatic renewals. Card data is never shown here.
      </p>
      <h2>Manual grant (support)</h2>
      <label>
        User UUID
        <input value={grantUser} onChange={(e) => setGrantUser(e.target.value)} />
      </label>
      <label>
        Months
        <input
          type="number"
          value={grantMonths}
          onChange={(e) => setGrantMonths(Number(e.target.value))}
        />
      </label>
      <label>
        Reason
        <input
          value={grantReason}
          onChange={(e) => setGrantReason(e.target.value)}
        />
      </label>
      <button type="button" className="btn" onClick={() => void manualGrant()}>
        Grant access
      </button>
      <h2>Payments</h2>
      <pre>{JSON.stringify(payments, null, 2)}</pre>
      <h2>Entitlements</h2>
      <pre>{JSON.stringify(entitlements, null, 2)}</pre>
      <p>
        <Link href="/admin">Back</Link>
      </p>
    </div>
  );
}
