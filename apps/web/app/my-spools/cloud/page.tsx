"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { apiGet, apiPost, isUnauthorizedError } from "@/lib/api";
import { clearAuth, loadAuth } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics/ga";
import { getUsageTrackingCopy } from "@/lib/usage-tracking-copy";
import type { Locale } from "@/lib/messages";

type Offer = {
  priceCents: number;
  currency: string;
  accessMonths: number;
  graceDays: number;
  retentionDays: number;
  priceDisplayMode: string;
  checkoutAvailable: boolean;
  automaticRenewal: boolean;
  livePaymentsEnabled?: boolean;
  stripeMode?: "test" | "live" | null;
};

type Entitlement = {
  status: string;
  accessMode: string;
  paidUntil: string | null;
  graceUntil: string | null;
  readOnlyFrom: string | null;
  deletionScheduledAt: string | null;
  canWriteCloud: boolean;
};

function formatDate(iso: string | null, locale: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function MySpoolsCloudPage() {
  const m = useMessages();
  const [auth, setAuth] = useState<ReturnType<typeof loadAuth>>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [locale, setLocale] = useState("en");

  const statusLabel = useCallback(
    (status: string) => {
      const map: Record<string, string> = {
        inactive: m.cloud.statusInactive,
        pending: m.cloud.statusPending,
        active: m.cloud.statusActive,
        grace_period: m.cloud.statusGrace,
        read_only: m.cloud.statusReadOnly,
        expired: m.cloud.statusExpired,
        refunded: m.cloud.statusRefunded,
        disputed: m.cloud.statusDisputed,
        revoked: m.cloud.statusRevoked,
      };
      return map[status] ?? status;
    },
    [m.cloud],
  );

  const refresh = useCallback(async () => {
    const a = loadAuth();
    setAuth(a);
    setLocale(document.documentElement.lang || "en");
    setError("");
    try {
      const o = await apiGet<Offer>("/api/v1/billing/cloud/offer");
      setOffer(o);
      if (a) {
        try {
          const e = await apiGet<Entitlement>(
            "/api/v1/billing/cloud/entitlement",
          );
          setEntitlement(e);
        } catch (e) {
          if (isUnauthorizedError(e)) {
            clearAuth();
            setAuth(null);
            setEntitlement(null);
            return;
          }
          throw e;
        }
      } else {
        setEntitlement(null);
      }
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function startCheckout() {
    if (!auth) return;
    setBusy(true);
    setError("");
    try {
      const res = await apiPost<{ checkoutUrl: string }>(
        "/api/v1/billing/cloud/checkout",
        {},
      );
      trackEvent("cloud_checkout_started");
      window.location.href = res.checkoutUrl;
    } catch (e) {
      if (isUnauthorizedError(e)) {
        clearAuth();
        setAuth(null);
        setError("");
      } else {
        setError(String(e));
      }
      setBusy(false);
    }
  }

  const active =
    entitlement &&
    (entitlement.status === "active" || entitlement.accessMode === "full");
  const usage = getUsageTrackingCopy(locale as Locale);
  const checkoutStatusMessage = !offer
    ? null
    : offer.stripeMode === "test"
      ? m.cloud.checkoutTestMode
      : !offer.checkoutAvailable &&
          offer.stripeMode === "live" &&
          offer.livePaymentsEnabled === false
        ? m.cloud.checkoutLiveBlocked
        : !offer.checkoutAvailable
          ? m.cloud.checkoutMissingConfig
          : null;

  return (
    <article className="prose cloud-page">
      <h1>{m.cloud.pageTitle}</h1>
      <p>
        <strong>{m.cloud.optionalBadge}</strong>
      </p>
      <p>{m.cloud.pageLead}</p>

      <section aria-labelledby="local-heading">
        <h2 id="local-heading">{m.cloud.localTitle}</h2>
        <p>{m.cloud.localBody}</p>
        <p>
          <Link href="/my-spools">{m.cloud.backToSpools}</Link>
        </p>
      </section>

      <section aria-labelledby="cloud-heading">
        <h2 id="cloud-heading">{m.cloud.cloudTitle}</h2>
        <h3>{m.cloud.cloudWhyTitle}</h3>
        <p>{m.cloud.cloudWhyBody}</p>
        <p>
          <strong>{m.cloud.priceLine}</strong>
        </p>
        <p>
          <strong>{m.cloud.oneTime}</strong>
        </p>
        <p>
          <strong>{m.cloud.noAutoRenewal}</strong>
        </p>
        <p>{m.cloud.neverCharge}</p>
        {offer?.priceDisplayMode === "not_applicable" ? (
          <p className="muted" role="note">
            {m.cloud.vatNotApplicable}
          </p>
        ) : offer?.priceDisplayMode === "unspecified" ? (
          <p className="muted" role="note">
            {m.cloud.vatUnspecified}
          </p>
        ) : null}

        <h3>{m.cloud.includesTitle}</h3>
        <ul>
          <li>{m.cloud.includeSync}</li>
          <li>{m.cloud.includeBackup}</li>
          <li>{m.cloud.includeRecovery}</li>
          <li>{m.cloud.includeExport}</li>
        </ul>
        <h3>{m.cloud.notIncludedTitle}</h3>
        <p>{m.cloud.notIncludedBody}</p>
        <p>{m.cloud.retentionHint}</p>

        <div className="panel" role="note" aria-labelledby="cloud-compat-heading">
          <h3 id="cloud-compat-heading">{usage.cloudDisclosureTitle}</h3>
          <p className="banner-warn">{usage.centralRule}</p>
          <ul>
            {usage.cloudDisclosures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            <Link href="/compatibility">{usage.checkSetup}</Link>
            {" · "}
            <Link href="/docs/usage-tracking">{usage.title}</Link>
          </p>
        </div>

        {entitlement ? (
          <div className="panel" aria-live="polite">
            <p>
              {m.cloud.statusLabel}:{" "}
              <strong>{statusLabel(entitlement.status)}</strong>
            </p>
            {entitlement.paidUntil ? (
              <p>
                {m.cloud.validUntil}:{" "}
                <time dateTime={entitlement.paidUntil}>
                  {formatDate(entitlement.paidUntil, locale)}
                </time>
              </p>
            ) : null}
            {entitlement.graceUntil ? (
              <p>
                {m.cloud.graceUntil}:{" "}
                <time dateTime={entitlement.graceUntil}>
                  {formatDate(entitlement.graceUntil, locale)}
                </time>
              </p>
            ) : null}
            {active ? <p>{m.cloud.extendHint}</p> : null}
          </div>
        ) : null}

        {!auth ? (
          <p>
            {m.cloud.loginRequired}{" "}
            <Link href="/login?next=/my-spools/cloud">{m.nav.login}</Link>
            {" · "}
            <Link href="/register?next=/my-spools/cloud">{m.account.register}</Link>
          </p>
        ) : (
          <div className="row gap">
            <button
              type="button"
              className="btn"
              disabled={busy || !offer?.checkoutAvailable}
              aria-label={active ? m.cloud.extendCta : m.cloud.buyCta}
              onClick={() => void startCheckout()}
            >
              {active ? m.cloud.extendCta : m.cloud.buyCta}
            </button>
            <Link className="btn btn-secondary" href="/my-spools/billing">
              {m.cloud.billingLink}
            </Link>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={async () => {
                if (!auth) return;
                const blob = await fetch("/api/v1/billing/cloud/export", {
                  credentials: "include",
                }).then((r) => r.blob());
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "openfilament-cloud-export.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              {m.cloud.exportCloud}
            </button>
          </div>
        )}
        {!offer ? (
          <p className="muted">{m.common.loading}</p>
        ) : checkoutStatusMessage ? (
          <p className="muted" role="note">
            {checkoutStatusMessage}
          </p>
        ) : null}
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <p>
        <Link href="/terms">{m.cloud.termsLink}</Link> ·{" "}
        <Link href="/privacy">{m.cloud.privacyLink}</Link>
      </p>
    </article>
  );
}
