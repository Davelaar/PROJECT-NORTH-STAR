/**
 * Printable SVG spool label (SUPVAN T50M 40×30 mm) + download helpers + JPEG→PDF.
 */

/** Label size matching common SUPVAN T50M stock (width × height). */
export const LABEL_WIDTH_MM = 40;
export const LABEL_HEIGHT_MM = 30;

/** Internal SVG units: 1 unit = 0.1 mm → 400×300 for 40×30 mm. */
export const LABEL_VB_W = 400;
export const LABEL_VB_H = 300;

/** QR must occupy at least this fraction of label height. */
export const QR_HEIGHT_RATIO = 0.75;

export function labelPageSizePt(): { widthPt: number; heightPt: number } {
  return {
    widthPt: (LABEL_WIDTH_MM / 25.4) * 72,
    heightPt: (LABEL_HEIGHT_MM / 25.4) * 72,
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(1, max - 1))}…`;
}

function extractQrInner(qrSvg: string): { inner: string; size: number } {
  const cleaned = qrSvg
    .replace(/<\?xml[^>]*>/i, "")
    .replace(/<!DOCTYPE[^>]*>/i, "");
  const vb = cleaned.match(/viewBox\s*=\s*"([^"]+)"/i);
  let size = 256;
  if (vb) {
    const parts = vb[1]!.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && Number.isFinite(parts[2]) && parts[2]! > 0) {
      size = parts[2]!;
    }
  } else {
    const w = cleaned.match(/\bwidth\s*=\s*"(\d+(?:\.\d+)?)"/i);
    if (w) size = Number(w[1]);
  }
  const inner = cleaned
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");
  return { inner, size };
}

/**
 * Compact thermal-friendly label: 40×30 mm, QR ≥ 75% of height.
 * Pure black/white for SUPVAN-class thermal printers.
 */
export function buildSpoolLabelSvg(opts: {
  qrSvg: string;
  manufacturer: string;
  material: string;
  variant: string;
  shortId: string;
  url: string;
}): string {
  const { inner, size } = extractQrInner(opts.qrSvg);
  const qrBox = Math.round(LABEL_VB_H * QR_HEIGHT_RATIO); // 225 = 75% of 300
  const qrY = Math.round((LABEL_VB_H - qrBox) / 2);
  const pad = 8;
  const qrX = pad;
  const textX = qrX + qrBox + 10;
  const textW = LABEL_VB_W - textX - pad;
  const scale = qrBox / size;

  const brand = escapeXml(truncate(opts.manufacturer, 18));
  const material = escapeXml(truncate(opts.material, 12));
  const variant = escapeXml(truncate(opts.variant, 18));
  const shortId = escapeXml(truncate(opts.shortId, 14));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LABEL_WIDTH_MM}mm" height="${LABEL_HEIGHT_MM}mm" viewBox="0 0 ${LABEL_VB_W} ${LABEL_VB_H}">
  <rect width="${LABEL_VB_W}" height="${LABEL_VB_H}" fill="#ffffff"/>
  <g transform="translate(${qrX}, ${qrY}) scale(${scale})">
    ${inner}
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" fill="#000000">
    <text x="${textX}" y="48" font-size="22" font-weight="700">${material}</text>
    <text x="${textX}" y="88" font-size="16" font-weight="600">${brand}</text>
    <text x="${textX}" y="126" font-size="15">${variant}</text>
    <text x="${textX}" y="168" font-family="ui-monospace, monospace" font-size="13">${shortId}</text>
    <text x="${textX}" y="270" font-size="11" font-weight="700" fill="#000000">OF</text>
  </g>
  <!-- keep text column usable: ${textW} units wide -->
</svg>`;
}

export function downloadTextFile(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/** Minimal single-page PDF embedding a JPEG (DCTDecode). */
export function buildMinimalPdfFromJpegDataUrl(
  jpegDataUrl: string,
  imgWidthPx: number,
  imgHeightPx: number,
  pageWidthPt = labelPageSizePt().widthPt,
  pageHeightPt = labelPageSizePt().heightPt,
): Blob {
  const base64 = jpegDataUrl.replace(/^data:image\/jpeg;base64,/, "");
  const binary = atob(base64);
  const jpg = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) jpg[i] = binary.charCodeAt(i);

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let offset = 0;
  const push = (data: Uint8Array | string) => {
    const bytes = typeof data === "string" ? encoder.encode(data) : data;
    chunks.push(bytes);
    offset += bytes.length;
  };
  const markObjectStart = () => {
    offsets.push(offset);
  };

  const w = Number(pageWidthPt.toFixed(2));
  const h = Number(pageHeightPt.toFixed(2));

  push("%PDF-1.4\n");
  markObjectStart();
  push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  markObjectStart();
  push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  markObjectStart();
  push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`,
  );
  const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q\n`;
  markObjectStart();
  push(
    `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`,
  );
  markObjectStart();
  push(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidthPx} /Height ${imgHeightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`,
  );
  push(jpg);
  push("\nendstream\nendobj\n");

  const xrefStart = offset;
  push(`xref\n0 ${offsets.length}\n`);
  push("0000000000 65535 f \n");
  for (let i = 1; i < offsets.length; i++) {
    push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  }
  push(
    `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
  );

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return new Blob([out], { type: "application/pdf" });
}

/** Rasterize at ~406 DPI (2× 203 DPI thermal) for crisp QR on 40×30 mm. */
export async function svgToJpegDataUrl(
  svg: string,
  width = Math.round((LABEL_WIDTH_MM / 25.4) * 406),
  height = Math.round((LABEL_HEIGHT_MM / 25.4) * 406),
): Promise<{ dataUrl: string; width: number; height: number }> {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Failed to rasterize SVG"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.95), width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
