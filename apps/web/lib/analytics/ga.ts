/**
 * GA4 loader — opt-out analytics.
 * Loads unless the visitor has explicitly refused analytics.
 * No cookieless / Advanced Consent Mode pings after refusal.
 */

import { analyticsAllowed, readConsent } from "../consent/store";
import type { ConsentRecord } from "../consent/types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __ofGaInitialized?: boolean;
  }
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export function getMeasurementId(): string {
  if (process.env.NODE_ENV === "test") return "";
  if (process.env.NEXT_PUBLIC_ENABLE_GA_IN_DEV !== "true" && process.env.NODE_ENV === "development") {
    return "";
  }
  return MEASUREMENT_ID.trim();
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(getMeasurementId());
}

function ensureGtagStub() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
}

function debugModeEnabled(): boolean {
  try {
    return new URLSearchParams(window.location.search).has("ga_debug");
  } catch {
    return false;
  }
}

function configureGa(id: string) {
  ensureGtagStub();
  window.gtag!("js", new Date());
  window.gtag!("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag!("config", id, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: true,
    ...(debugModeEnabled() ? { debug_mode: true } : {}),
  });
}

/** Load GA4 when analytics is allowed (default on until refused). Idempotent. */
export function initAnalyticsIfAllowed(consent?: ConsentRecord | null): boolean {
  const record = consent === undefined ? readConsent() : consent;
  if (!analyticsAllowed(record)) return false;
  const id = getMeasurementId();
  if (!id) return false;
  if (window.__ofGaInitialized) return true;

  ensureGtagStub();
  window.__ofGaInitialized = true;

  const existing = document.querySelector(
    'script[data-of-analytics="1"]',
  ) as HTMLScriptElement | null;
  if (existing) {
    configureGa(id);
    return true;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.ofAnalytics = "1";
  script.onload = () => configureGa(id);
  script.onerror = () => {
    window.__ofGaInitialized = false;
  };
  // Queue consent + config before/while the script loads (official gtag pattern).
  configureGa(id);
  document.head.appendChild(script);
  return true;
}

export function disableAnalytics(): void {
  if (typeof window === "undefined") return;
  window.__ofGaInitialized = false;
  ensureGtagStub();
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  document
    .querySelectorAll('script[data-of-analytics="1"]')
    .forEach((el) => el.remove());
}

/** Privacy-safe product events — no PII, UUIDs, query text, or RFID/QR payloads. */
export type SafeAnalyticsEvent =
  | "catalog_search_submitted"
  | "filter_selected"
  | "filament_viewed"
  | "profile_download_started"
  | "profile_download_completed"
  | "slicer_format_selected"
  | "qr_label_generated"
  | "rfid_workflow_opened"
  | "local_spool_created"
  | "cloud_sync_enabled"
  | "cloud_checkout_started"
  | "cloud_payment_confirmed"
  | "contribution_started"
  | "contribution_completed";

export function trackEvent(
  name: SafeAnalyticsEvent,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  if (!analyticsAllowed(readConsent())) return;
  if (!window.__ofGaInitialized) {
    initAnalyticsIfAllowed();
  }
  if (!window.__ofGaInitialized) return;
  const safe: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (/uuid|email|note|query|search|rfid|qr|token|id$/i.test(k)) continue;
      safe[k] = v;
    }
  }
  window.gtag?.("event", name, safe);
}
