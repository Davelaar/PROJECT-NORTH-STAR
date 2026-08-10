"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { getApiBase } from "@/lib/api";
import { detectBrowserCapabilities } from "@/lib/capabilities";
import {
  buildMinimalPdfFromJpegDataUrl,
  buildSpoolLabelSvg,
  downloadBlob,
  downloadDataUrl,
  downloadTextFile,
  svgToJpegDataUrl,
} from "@/lib/qr-label";
import { getBrowserOrigin, publicAbsoluteUrl } from "@/lib/site-url";
import { useMessages } from "@/app/components/messages-provider";

type LabelMeta = {
  path: string;
  identityUri: string;
  label: {
    brand: string;
    manufacturer: string;
    material: string;
    variant: string;
    product: string;
    colorHex: string | null;
    shortId: string;
    variantUuid: string;
  };
};

export function QrLabelPanel({ variantUuid }: { variantUuid: string }) {
  const m = useMessages();
  const l = m.label;
  const [meta, setMeta] = useState<LabelMeta | null>(null);
  const [qrSvg, setQrSvg] = useState("");
  const [qrPng, setQrPng] = useState("");
  const [scanUrl, setScanUrl] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [canPrint, setCanPrint] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanPrint(detectBrowserCapabilities().print);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError("");
    setMeta(null);
    setQrSvg("");
    setQrPng("");
    (async () => {
      try {
        const res = await fetch(
          `${getApiBase()}/api/v1/variants/${variantUuid}/qr`,
        );
        const text = await res.text();
        if (!res.ok) throw new Error(text);
        const json = JSON.parse(text) as LabelMeta;
        const url = publicAbsoluteUrl(json.path, getBrowserOrigin());
        const [svg, png] = await Promise.all([
          QRCode.toString(url, { type: "svg", margin: 1, width: 256 }),
          QRCode.toDataURL(url, { margin: 1, width: 256 }),
        ]);
        if (cancelled) return;
        setMeta(json);
        setScanUrl(url);
        setQrSvg(svg);
        setQrPng(png);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : l.loadError);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [variantUuid, l.loadError]);

  const labelSvg = useMemo(() => {
    if (!meta || !qrSvg) return "";
    return buildSpoolLabelSvg({
      qrSvg,
      manufacturer: meta.label.manufacturer,
      material: meta.label.material,
      variant: meta.label.variant,
      shortId: meta.label.shortId,
      url: scanUrl,
    });
  }, [meta, qrSvg, scanUrl]);

  async function downloadPdf() {
    if (!labelSvg || !meta) return;
    setStatus("");
    try {
      const { dataUrl, width, height } = await svgToJpegDataUrl(labelSvg);
      const pdf = buildMinimalPdfFromJpegDataUrl(dataUrl, width, height);
      downloadBlob(`${meta.label.shortId}.pdf`, pdf);
      setStatus(l.pdfDownloaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : l.pdfFailed);
    }
  }

  if (error) return <div className="banner-warn">{error}</div>;
  if (!meta || !labelSvg) return <p className="muted">{l.generating}</p>;

  return (
    <div className="stack">
      <div className="panel qr-label-preview" ref={printRef}>
        <div
          className="qr-label-svg"
          dangerouslySetInnerHTML={{ __html: labelSvg }}
        />
        <p className="muted">
          {l.scansTo} <code>{meta.path}</code> on this site (
          <code>{scanUrl}</code>). {l.identity}: <code>{meta.identityUri}</code>
        </p>
      </div>
      <div className="home-cta-links">
        <button
          type="button"
          onClick={() => downloadDataUrl(`${meta.label.shortId}-qr.png`, qrPng)}
        >
          {l.downloadPng}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() =>
            downloadTextFile(
              `${meta.label.shortId}-label.svg`,
              labelSvg,
              "image/svg+xml",
            )
          }
        >
          {l.downloadSvg}
        </button>
        <button type="button" className="secondary" onClick={downloadPdf}>
          {l.downloadPdf}
        </button>
        {canPrint ? (
          <button
            type="button"
            className="secondary"
            onClick={() => window.print()}
          >
            {l.printLabel}
          </button>
        ) : null}
      </div>
      {status ? <div className="panel">{status}</div> : null}
    </div>
  );
}
