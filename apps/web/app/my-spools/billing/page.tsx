"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { apiGet } from "@/lib/api";
import { loadAuth } from "@/lib/auth";

type PaymentRow = {
  uuid: string;
  status: string;
  amountCents: number;
  currency: string;
  paidAt: string | null;
  accessStartsAt: string | null;
  accessEndsAt: string | null;
  receiptUrl: string | null;
  automaticRenewal: false;
};

export default function CloudBillingPage() {
  const m = useMessages();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = loadAuth();
    if (!auth) {
      setError(m.cloud.loginRequired);
      return;
    }
    apiGet<{ payments: PaymentRow[] }>(
      "/api/v1/billing/cloud/payments",
      auth.token,
    )
      .then((r) => setRows(r.payments))
      .catch((e) => setError(String(e)));
  }, [m.cloud.loginRequired]);

  return (
    <article className="prose billing-page">
      <h1>{m.cloud.billingTitle}</h1>
      <p>{m.cloud.billingLead}</p>
      <p>
        <strong>{m.cloud.noAutoRenewal}</strong>
      </p>
      {error ? <p role="alert">{error}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">{m.cloud.accessPeriod}</th>
              <th scope="col">{m.cloud.receipt}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.uuid}>
                <td>
                  {r.paidAt
                    ? new Date(r.paidAt).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  €{(r.amountCents / 100).toFixed(2)} {r.currency.toUpperCase()}
                </td>
                <td>{r.status}</td>
                <td>
                  {r.accessStartsAt && r.accessEndsAt
                    ? `${new Date(r.accessStartsAt).toLocaleDateString()} → ${new Date(r.accessEndsAt).toLocaleDateString()}`
                    : "—"}
                </td>
                <td>
                  {r.receiptUrl ? (
                    <a href={r.receiptUrl} rel="noopener noreferrer">
                      {m.cloud.receipt}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <Link href="/my-spools/cloud">{m.cloud.pageTitle}</Link>
      </p>
    </article>
  );
}
