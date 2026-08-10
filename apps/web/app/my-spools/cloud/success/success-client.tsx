"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMessages } from "@/app/components/messages-provider";
import { apiGet } from "@/lib/api";
import { loadAuth } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics/ga";

type PaymentView = {
  uuid: string;
  status: string;
  amountCents: number;
  currency: string;
  paidAt: string | null;
  automaticRenewal: boolean;
  entitlement: {
    status: string;
    paidUntil: string | null;
  };
};

export default function CloudCheckoutSuccessClient() {
  const m = useMessages();
  const params = useSearchParams();
  const paymentUuid = params.get("payment");
  const [state, setState] = useState<
    "verifying" | "paid" | "pending" | "failed" | "missing"
  >("verifying");
  const [payment, setPayment] = useState<PaymentView | null>(null);
  const [ticks, setTicks] = useState(0);

  const auth = useMemo(() => loadAuth(), []);

  useEffect(() => {
    if (!paymentUuid || !auth) {
      setState("missing");
      return;
    }
    let cancelled = false;
    const maxTicks = 20;
    async function poll() {
      try {
        const p = await apiGet<PaymentView>(
          `/api/v1/billing/cloud/payments/${paymentUuid}`,
        );
        if (cancelled) return;
        setPayment(p);
        if (p.status === "paid") {
          setState("paid");
          trackEvent("cloud_payment_confirmed");
          return;
        }
        if (
          p.status === "failed" ||
          p.status === "expired" ||
          p.status === "cancelled"
        ) {
          setState("failed");
          return;
        }
        setState("pending");
      } catch {
        if (!cancelled) setState("verifying");
      }
    }
    void poll();
    const id = window.setInterval(() => {
      setTicks((t) => {
        const next = t + 1;
        if (next >= maxTicks) {
          window.clearInterval(id);
          return next;
        }
        void poll();
        return next;
      });
    }, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [paymentUuid, auth]);

  const timedOut = ticks >= 20 && state !== "paid" && state !== "failed";

  return (
    <article className="prose cloud-success" aria-live="polite">
      <h1>{m.cloud.successTitle}</h1>
      {state === "missing" ? <p>{m.cloud.loginRequired}</p> : null}
      {state === "verifying" || (state === "pending" && !timedOut) ? (
        <p>{state === "pending" ? m.cloud.pendingPayment : m.cloud.verifying}</p>
      ) : null}
      {state === "paid" && payment ? (
        <>
          <h2>{m.cloud.activatedTitle}</h2>
          <p>
            {m.cloud.paidOnce}: €{(payment.amountCents / 100).toFixed(2)}
          </p>
          <p>
            {m.cloud.validUntil}:{" "}
            {payment.entitlement.paidUntil
              ? new Date(payment.entitlement.paidUntil).toLocaleString()
              : "—"}
          </p>
          <p>
            <strong>{m.cloud.autoRenewalOff}</strong>
          </p>
        </>
      ) : null}
      {state === "failed" || timedOut ? (
        <p role="alert">{m.cloud.failedPayment}</p>
      ) : null}
      <p>
        <Link href="/my-spools/cloud">{m.cloud.pageTitle}</Link> ·{" "}
        <Link href="/my-spools">{m.cloud.backToSpools}</Link>
      </p>
    </article>
  );
}
