"use client";

import { openCookieSettings } from "@/app/components/consent-manager";

export function CookieSettingsButton({
  label,
  className = "button secondary",
}: {
  label: string;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={() => openCookieSettings()}>
      {label}
    </button>
  );
}
