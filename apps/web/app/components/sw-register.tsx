"use client";

import { useEffect } from "react";

/** Register the app-shell service worker (production / HTTPS or localhost). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (window.location.protocol !== "https:" && !isLocal) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore registration failures in unsupported contexts */
    });
  }, []);
  return null;
}
