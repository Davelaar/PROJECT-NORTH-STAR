"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useMessages, useLocale } from "./messages-provider";
import {
  acceptAll,
  analyticsAllowed,
  readConsent,
  rejectNonEssential,
  writeConsent,
} from "@/lib/consent/store";
import { isConsentCurrent, type ConsentRecord } from "@/lib/consent/types";
import { CONSENT_VERSION } from "@/lib/legal/config";
import {
  disableAnalytics,
  initAnalyticsIfAllowed,
} from "@/lib/analytics/ga";

export function ConsentManager() {
  const m = useMessages();
  const locale = useLocale();
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    preferences: false,
    analytics: true,
    marketing: false,
  });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const current = readConsent();
    setRecord(current);
    if (!isConsentCurrent(current, CONSENT_VERSION)) {
      setShowBanner(true);
    }

    // Opt-out: load GA when no refusal is stored (including first visit).
    let timeout: number | undefined;
    if (analyticsAllowed(current) || !isConsentCurrent(current, CONSENT_VERSION)) {
      timeout = window.setTimeout(
        () =>
          initAnalyticsIfAllowed(
            isConsentCurrent(current, CONSENT_VERSION) ? current : null,
          ),
        0,
      );
    }

    function onOpenPrefs() {
      const c = readConsent();
      setPrefs({
        preferences: c?.categories.preferences ?? false,
        analytics: c?.categories.analytics ?? true,
        marketing: false,
      });
      setShowPrefs(true);
    }
    window.addEventListener("of:open-cookie-settings", onOpenPrefs);
    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      window.removeEventListener("of:open-cookie-settings", onOpenPrefs);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showPrefs && !dialog.open) dialog.showModal();
    if (!showPrefs && dialog.open) dialog.close();
  }, [showPrefs]);

  function afterDecision(next: ConsentRecord) {
    setRecord(next);
    setShowBanner(false);
    setShowPrefs(false);
    if (analyticsAllowed(next)) {
      window.setTimeout(() => initAnalyticsIfAllowed(next), 0);
    } else {
      disableAnalytics();
    }
  }

  return (
    <>
      {showBanner ? (
        <div
          className="consent-banner"
          role="region"
          aria-label={m.consent.bannerAria}
        >
          <div className="consent-banner-inner">
            <p>
              {m.consent.bannerText}{" "}
              <Link href="/cookies">{m.consent.cookiePolicy}</Link>
              {" · "}
              <Link href="/privacy-policy">{m.consent.privacyPolicy}</Link>
              {" · "}
              <Link href="/support">{m.footer.support}</Link>
            </p>
            <div className="consent-actions">
              <button
                type="button"
                className="btn"
                onClick={() => afterDecision(acceptAll(locale))}
              >
                {m.consent.acceptAll}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => afterDecision(rejectNonEssential(locale))}
              >
                {m.consent.rejectNonEssential}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPrefs({ preferences: false, analytics: true, marketing: false });
                  setShowPrefs(true);
                }}
              >
                {m.consent.manage}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        className="consent-dialog"
        aria-labelledby={titleId}
        onClose={() => setShowPrefs(false)}
        onCancel={(e) => {
          e.preventDefault();
          setShowPrefs(false);
        }}
      >
        <h2 id={titleId}>{m.consent.prefsTitle}</h2>
        <p className="muted">{m.consent.prefsLead}</p>
        <fieldset className="consent-fieldset">
          <label>
            <input type="checkbox" checked disabled />
            {m.consent.necessary} — {m.consent.necessaryHelp}
          </label>
          <label>
            <input
              type="checkbox"
              checked={prefs.preferences}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, preferences: e.target.checked }))
              }
            />
            {m.consent.preferences} — {m.consent.preferencesHelp}
          </label>
          <label>
            <input
              type="checkbox"
              checked={prefs.analytics}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, analytics: e.target.checked }))
              }
            />
            {m.consent.analytics} — {m.consent.analyticsHelp}
          </label>
          <label>
            <input type="checkbox" checked={false} disabled />
            {m.consent.marketing} — {m.consent.marketingHelp}
          </label>
        </fieldset>
        <div className="consent-actions">
          <button
            type="button"
            className="btn"
            onClick={() => afterDecision(writeConsent(prefs, locale))}
          >
            {m.consent.savePrefs}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowPrefs(false)}
          >
            {m.consent.cancel}
          </button>
        </div>
      </dialog>

      {/* Expose current state for tests */}
      <span
        hidden
        data-consent-version={record?.version ?? ""}
        data-analytics={String(analyticsAllowed(record))}
      />
    </>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("of:open-cookie-settings"));
}
