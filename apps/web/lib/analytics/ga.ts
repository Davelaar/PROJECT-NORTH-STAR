/**
 * GA4 loader — opt-out analytics.
 * Prefer the early <head> bootstrap in layout; this module is the client fallback
 * and the refuse/accept controller.
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

function setConsentGranted() {
  ensureGtagStub();
  window.gtag!("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag!("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function configureGa(id: string) {
  ensureGtagStub();
  setConsentGranted();
  window.gtag!("js", new Date());
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

  const existing = document.querySelector(
    'script[data-of-analytics="1"]',
  ) as HTMLScriptElement | null;
  if (window.__ofGaInitialized || existing) {
    window.__ofGaInitialized = true;
    // Ensure consent stays granted if head bootstrap already ran.
    setConsentGranted();
    return true;
  }

  ensureGtagStub();
  window.__ofGaInitialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.ofAnalytics = "1";
  script.onerror = () => {
    window.__ofGaInitialized = false;
  };
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

/** Inline <head> bootstrap (opt-out). Skips load if of_consent has analytics:false. */
export function gaHeadBootstrapInline(measurementId: string): string {
  const id = JSON.stringify(measurementId);
  return `(()=>{
  try {
    var allow=true;
    var m=document.cookie.match(/(?:^|; )of_consent=([^;]*)/);
    if(m){
      try{
        var c=JSON.parse(decodeURIComponent(m[1]));
        if(c&&c.categories&&c.categories.analytics===false) allow=false;
      }catch(e){}
    }
    window.dataLayer=window.dataLayer||[];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag=gtag;
    if(!allow){
      gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      return;
    }
    gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    gtag('js',new Date());
    gtag('config',${id},{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false,send_page_view:true});
    window.__ofGaInitialized=true;
    var s=document.createElement('script');
    s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(${id});
    s.setAttribute('data-of-analytics','1');
    document.head.appendChild(s);
  }catch(e){}
})();`;
}
