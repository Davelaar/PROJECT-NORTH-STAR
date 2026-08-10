/**
 * Printable SVG spool label + download helpers + minimal JPEG→PDF builder.
 */

export function buildSpoolLabelSvg(opts: {
  qrSvg: string;
  manufacturer: string;
  material: string;
  variant: string;
  shortId: string;
  url: string;
}): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const inner = opts.qrSvg
    .replace(/<\?xml[^>]*>/i, "")
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">
  <rect width="360" height="240" fill="#faf7f1" stroke="#1c1a17" stroke-width="2"/>
  <text x="16" y="28" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#0f5c4c">OPENFILAMENT</text>
  <text x="16" y="56" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#1c1a17">${escape(opts.manufacturer)}</text>
  <text x="16" y="82" font-family="system-ui, sans-serif" font-size="16" fill="#1c1a17">${escape(opts.material)}</text>
  <text x="16" y="108" font-family="system-ui, sans-serif" font-size="16" fill="#1c1a17">${escape(opts.variant)}</text>
  <text x="16" y="140" font-family="ui-monospace, monospace" font-size="12" fill="#5c564c">${escape(opts.shortId)}</text>
  <g transform="translate(200, 28) scale(0.72)">
    ${inner}
  </g>
  <text x="16" y="220" font-family="ui-monospace, monospace" font-size="8" fill="#5c564c">${escape(opts.url)}</text>
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
  pageWidthPt = 288,
  pageHeightPt = 192,
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

  push("%PDF-1.4\n");
  markObjectStart();
  push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  markObjectStart();
  push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  markObjectStart();
  push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`,
  );
  const content = `q ${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm /Im0 Do Q\n`;
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

export async function svgToJpegDataUrl(
  svg: string,
  width = 720,
  height = 480,
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
    ctx.fillStyle = "#faf7f1";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
