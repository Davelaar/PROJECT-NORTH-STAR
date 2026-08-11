"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { apiGet, isUnauthorizedError } from "@/lib/api";
import { clearAuth, loadAuth } from "@/lib/auth";

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

function paymentStatusLabel(
  status: string,
  cloud: ReturnType<typeof useMessages>["cloud"],
) {
  const map: Record<string, string> = {
    created: cloud.paymentStatusCreated,
    pending: cloud.paymentStatusPending,
    paid: cloud.paymentStatusPaid,
    failed: cloud.paymentStatusFailed,
    expired: cloud.paymentStatusExpired,
    refunded: cloud.paymentStatusRefunded,
    partial_refund: cloud.paymentStatusPartialRefund,
    disputed: cloud.paymentStatusDisputed,
    cancelled: cloud.paymentStatusCancelled,
  };
  return map[status] ?? status;
}

export default function CloudBillingPage() {
  const m = useMessages();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    setLocale(document.documentElement.lang || "en");
    const auth = loadAuth();
    if (!auth) {
      setError(m.cloud.loginRequired);
      return;
    }
    apiGet<{ payments: PaymentRow[] }>(
      "/api/v1/billing/cloud/payments",
    )
      .then((r) => setRows(r.payments))
      .catch((e) => {
        if (isUnauthorizedError(e)) {
          clearAuth();
          setError(m.cloud.loginRequired);
          return;
        }
        setError(String(e));
      });
  }, [m.cloud.loginRequired]);

  return (
    <article className="prose billing-page">
      <h1>{m.cloud.billingTitle}</h1>
      <p>{m.cloud.billingLead}</p>
      <p>
        <strong>{m.cloud.noAutoRenewal}</strong>
      </p>
      {error ? (
        <p role="alert">
          {error}{" "}
          {error === m.cloud.loginRequired ? (
            <Link href="/login?next=/my-spools/billing">{m.nav.login}</Link>
          ) : null}
        </p>
      ) : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">{m.cloud.billingColDate}</th>
              <th scope="col">{m.cloud.billingColAmount}</th>
              <th scope="col">{m.cloud.billingColStatus}</th>
              <th scope="col">{m.cloud.accessPeriod}</th>
              <th scope="col">{m.cloud.receipt}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.uuid}>
                <td>
                  {r.paidAt
                    ? new Date(r.paidAt).toLocaleDateString(locale)
                    : "—"}
                </td>
                <td>
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: (r.currency || "eur").toUpperCase(),
                  }).format(r.amountCents / 100)}
                </td>
                <td>{paymentStatusLabel(r.status, m.cloud)}</td>
                <td>
                  {r.accessStartsAt && r.accessEndsAt
                    ? `${new Date(r.accessStartsAt).toLocaleDateString(locale)} → ${new Date(r.accessEndsAt).toLocaleDateString(locale)}`
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
