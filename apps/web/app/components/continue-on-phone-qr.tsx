"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { useMessages } from "@/app/components/messages-provider";

/**
 * Desktop helper: show a QR that opens the scan page on a phone.
 * No session sync — after scanning the handoff QR you continue on the phone
 * (same idea as Stripe’s “continue on mobile” step).
 */
export function ContinueOnPhoneQr() {
  const m = useMessages().scan;
  const params = useSearchParams();
  const [dataUrl, setDataUrl] = useState("");
  const [scanUrl, setScanUrl] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (params.get("onPhone") === "1") {
      setShow(false);
      return;
    }
    const desktopLike =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine) and (hover: hover)").matches &&
      window.innerWidth >= 768;
    setShow(desktopLike);
    if (!desktopLike) return;

    const url = `${window.location.origin}/scan?onPhone=1`;
    setScanUrl(url);
    void QRCode.toDataURL(url, {
      margin: 1,
      width: 220,
      errorCorrectionLevel: "M",
    }).then(setDataUrl);
  }, [params]);

  if (!show || !dataUrl) return null;

  return (
    <aside className="panel continue-on-phone" aria-labelledby="continue-phone-title">
      <h2 id="continue-phone-title">{m.continueOnPhoneTitle}</h2>
      <p className="muted">{m.continueOnPhoneLead}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="continue-on-phone-qr"
        src={dataUrl}
        width={220}
        height={220}
        alt={m.continueOnPhoneAlt}
      />
      <p className="muted mono continue-on-phone-url">{scanUrl}</p>
      <p className="muted">{m.continueOnPhoneHint}</p>
    </aside>
  );
}
