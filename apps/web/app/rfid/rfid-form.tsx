"use client";

import { useMessages } from "@/app/components/messages-provider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, getApiBase } from "@/lib/api";
import { detectBrowserCapabilities } from "@/lib/capabilities";
import {
  MemoryBrowserTransport,
  WebSerialBrowserTransport,
  WebUsbBrowserTransport,
  browserWriteAndVerify,
} from "@/lib/rfid/browser-transport";
import { ColorField } from "@/app/components/color-field";
import { normalizeHex } from "@/lib/color";

const BRIDGE = "http://127.0.0.1:8788";
const BRIDGE_TOKEN =
  process.env.NEXT_PUBLIC_OF_BRIDGE_TOKEN ?? "local-dev-token";

const CFS_MATERIALS = [
  { name: "PLA", code: "100001" },
  { name: "PLA-Silk", code: "100002" },
  { name: "PETG", code: "100003" },
  { name: "ABS", code: "100004" },
  { name: "TPU", code: "100005" },
  { name: "PLA-CF", code: "100006" },
  { name: "ASA", code: "100007" },
  { name: "PA", code: "100008" },
  { name: "PA-CF", code: "100009" },
  { name: "PC", code: "100021" },
] as const;

const WEIGHT_OPTIONS = [
  { label: "1 kg", value: "1kg" },
  { label: "750 g", value: "750g" },
  { label: "600 g", value: "600g" },
  { label: "500 g", value: "500g" },
  { label: "250 g", value: "250g" },
] as const;

export function RfidForm() {
  const messages = useMessages();
  const m = messages.rfid;
  const [materialCode, setMaterialCode] = useState("100007");
  const [colorToken, setColorToken] = useState("#6B5E54");
  const [weight, setWeight] = useState("1kg");
  const [serial, setSerial] = useState("219722");
  const [uid, setUid] = useState("35B94A19");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [readers, setReaders] = useState("");
  const [resolveInfo, setResolveInfo] = useState("");
  const [capsLabel, setCapsLabel] = useState("");
  const [showHelper, setShowHelper] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasSerial, setHasSerial] = useState(false);
  const [hasUsb, setHasUsb] = useState(false);
  const [hasHid, setHasHid] = useState(false);
  const [hasWebNfc, setHasWebNfc] = useState(false);
  const [openPrintTagVariantUuid, setOpenPrintTagVariantUuid] = useState("");

  useEffect(() => {
    const caps = detectBrowserCapabilities();
    setHasSerial(caps.webSerial);
    setHasUsb(caps.webUsb);
    setHasHid(caps.webHid);
    setHasWebNfc(caps.webNfc);
    const bits: string[] = [];
    if (caps.webUsb) bits.push(m.capsWebUsb);
    if (caps.webSerial) bits.push(m.capsWebSerial);
    if (caps.webHid) bits.push(m.capsWebHid);
    if (caps.webNfc) {
      bits.push(m.capsWebNfc);
    }
    if (bits.length === 0) {
      bits.push(m.capsNone);
    }
    setCapsLabel(bits.join(" · "));
  }, []);

  function base64ToBytes(value: string): Uint8Array {
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }

  async function writeOpenPrintTag() {
    setBusy(true);
    setError("");
    setResult("");
    try {
      const NDEFReaderCtor = (
        window as unknown as {
          NDEFReader?: new () => {
            write: (message: {
              records: Array<{
                recordType: "mime";
                mediaType: string;
                data: Uint8Array;
              }>;
            }) => Promise<void>;
          };
        }
      ).NDEFReader;
      if (!NDEFReaderCtor) throw new Error(m.openPrintTagNoWebNfc);
      const uuid = openPrintTagVariantUuid.trim();
      if (!uuid) throw new Error(m.openPrintTagVariant);
      const encoded = await apiFetch(
        `/api/v1/variants/${encodeURIComponent(uuid)}/openprinttag/encode`,
        { method: "POST" },
      ).then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(text);
        return JSON.parse(text) as {
          mimeType: string;
          payloadBase64: string;
          ndefHex: string;
          fields: unknown;
        };
      });
      await new NDEFReaderCtor().write({
        records: [
          {
            recordType: "mime",
            mediaType: encoded.mimeType,
            data: base64ToBytes(encoded.payloadBase64),
          },
        ],
      });
      setResult(JSON.stringify({ ok: true, ...encoded }, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    } finally {
      setBusy(false);
    }
  }

  const payload = () => ({
    material: materialCode,
    color: normalizeHex(colorToken) ?? colorToken,
    weightOrLength: weight,
    serial,
    uid,
  });

  async function encodeApi() {
    const res = await apiFetch(`/api/v1/rfid/encode`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload()),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return JSON.parse(text) as { ciphertextHex: string };
  }

  async function verifyApi(ciphertextHex: string) {
    const res = await apiFetch(`/api/v1/rfid/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ciphertextHex }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return JSON.parse(text) as {
      ok: boolean;
      plaintextAscii: string;
      fields: unknown;
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult("");
    try {
      const encoded = await encodeApi();
      setResult(JSON.stringify(encoded, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  async function runBrowserWrite(
    kind: "memory" | "web-serial" | "web-usb",
  ) {
    setBusy(true);
    setError("");
    setResult("");
    try {
      const transport =
        kind === "memory"
          ? new MemoryBrowserTransport()
          : kind === "web-serial"
            ? new WebSerialBrowserTransport()
            : new WebUsbBrowserTransport();
      const out = await browserWriteAndVerify({
        transport,
        encode: encodeApi,
        verify: verifyApi,
      });
      setResult(JSON.stringify(out, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    } finally {
      setBusy(false);
    }
  }

  async function bridgePost(path: string) {
    setError("");
    setResult("");
    try {
      const res = await fetch(`${BRIDGE}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-OF-Bridge-Token": BRIDGE_TOKEN,
        },
        body: JSON.stringify(payload()),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setResult(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setError(
        err instanceof Error
          ? `${messages.export.installFail} ${err.message}`
          : messages.common.error,
      );
    }
  }

  async function listReaders() {
    setError("");
    try {
      const res = await fetch(`${BRIDGE}/v1/rfid/readers`, {
        headers: { "X-OF-Bridge-Token": BRIDGE_TOKEN },
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setReaders(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  async function resolveAndDownload() {
    setError("");
    setResolveInfo("");
    try {
      const resolved = await fetch(
        `${getApiBase()}/api/v1/rfid/resolve?material=${encodeURIComponent(materialCode)}&color=${encodeURIComponent(colorToken)}`,
      );
      const resolveJson = (await resolved.json()) as {
        filamentVariantUuid?: string;
        profiles?: { uuid: string; title: string }[];
        error?: { message: string };
      };
      if (!resolved.ok) {
        throw new Error(resolveJson.error?.message ?? JSON.stringify(resolveJson));
      }
      setResolveInfo(JSON.stringify(resolveJson, null, 2));
      const profileUuid = resolveJson.profiles?.[0]?.uuid;
      if (!profileUuid) throw new Error(m.noMappedProfile);
      setResult(
        `Mapped profile ${profileUuid}. Download it from Export — no helper required.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  async function resolveAndInstallHelper() {
    setError("");
    setResolveInfo("");
    try {
      const resolved = await fetch(
        `${getApiBase()}/api/v1/rfid/resolve?material=${encodeURIComponent(materialCode)}&color=${encodeURIComponent(colorToken)}`,
      );
      const resolveJson = (await resolved.json()) as {
        filamentVariantUuid?: string;
        profiles?: { uuid: string; title: string }[];
        error?: { message: string };
      };
      if (!resolved.ok) {
        throw new Error(resolveJson.error?.message ?? JSON.stringify(resolveJson));
      }
      setResolveInfo(JSON.stringify(resolveJson, null, 2));
      const profileUuid = resolveJson.profiles?.[0]?.uuid;
      if (!profileUuid) throw new Error(m.noMappedProfile);
      const exported = await apiFetch(`/api/v1/exports/creality`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileUuid }),
      });
      const exp = (await exported.json()) as {
        bridgeInstallPayload?: Record<string, unknown>;
      };
      if (!exported.ok || !exp.bridgeInstallPayload) {
        throw new Error(m.exportMappedFailed);
      }
      const install = await fetch(`${BRIDGE}/v1/rfid/map-install`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-OF-Bridge-Token": BRIDGE_TOKEN,
        },
        body: JSON.stringify({ bridgeInstallPayload: exp.bridgeInstallPayload }),
      });
      const text = await install.text();
      if (!install.ok) throw new Error(text);
      setResult(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  return (
    <div className="stack">
      <div className="banner-warn">
        <p>
          <strong>{messages.hardware.cfsHeading}:</strong> {m.browserBanner}
        </p>
        <p className="muted">{capsLabel}</p>
        <p className="muted">
          <strong>OpenPrintTag</strong> — {m.openPrintTagNote}{" "}
          <a href="https://specs.openprinttag.org/" target="_blank" rel="noreferrer">
            specs.openprinttag.org
          </a>{" "}
          /{" "}
          <a href="https://openfilamentdatabase.org" target="_blank" rel="noreferrer">
            openfilamentdatabase.org
          </a>
        </p>
        <p>
          {m.alternativesPrefix}{" "}
          <Link href="/scan">{m.altScanQr}</Link>,{" "}
          <Link href="/label">{m.altPrintQr}</Link>, {m.altManual}.
        </p>
      </div>
      <form className="stack panel" onSubmit={onSubmit}>
        <label>
          {m.materialCode}
          <select
            value={materialCode}
            onChange={(e) => setMaterialCode(e.target.value)}
            required
          >
            {CFS_MATERIALS.map((mat) => (
              <option key={mat.code} value={mat.code}>
                {mat.name} ({mat.code})
              </option>
            ))}
          </select>
        </label>
        <ColorField
          value={colorToken}
          onChange={setColorToken}
          label={m.colorToken}
        />
        <label>
          {m.weight}
          <select value={weight} onChange={(e) => setWeight(e.target.value)}>
            {WEIGHT_OPTIONS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {m.serial}
          <input
            value={serial}
            maxLength={6}
            onChange={(e) => setSerial(e.target.value)}
          />
        </label>
        <label>
          {m.uid}
          <input value={uid} onChange={(e) => setUid(e.target.value)} />
        </label>
        <button type="submit" disabled={busy}>
          {m.submit}
        </button>
        <button type="button" onClick={resolveAndDownload} disabled={busy}>
          {m.resolveMapped}
        </button>
      </form>

      <div className="stack panel">
        <h3>{m.writeHeading}</h3>
        <p className="muted">{m.writeIntro}</p>
        <button
          type="button"
          onClick={() => runBrowserWrite("memory")}
          disabled={busy}
        >
          {m.writeMemory}
        </button>
        {hasSerial ? (
          <button
            type="button"
            className="secondary"
            onClick={() => runBrowserWrite("web-serial")}
            disabled={busy}
          >
            {m.writeSerial}
          </button>
        ) : (
          <p className="muted">{m.noSerial}</p>
        )}
        {hasUsb ? (
          <button
            type="button"
            className="secondary"
            onClick={() => runBrowserWrite("web-usb")}
            disabled={busy}
          >
            {m.writeUsb}
          </button>
        ) : null}
        {hasHid ? (
          <p className="muted">{m.hidNote}</p>
        ) : null}
      </div>

      <div className="stack panel">
        <h3>{m.openPrintTagWriteHeading}</h3>
        <p className="muted">{m.openPrintTagWriteIntro}</p>
        <label>
          {m.openPrintTagVariant}
          <input
            value={openPrintTagVariantUuid}
            onChange={(e) => setOpenPrintTagVariantUuid(e.target.value)}
            placeholder="33333333-3333-4333-8333-333333333333"
          />
        </label>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy || !hasWebNfc}
          onClick={() => void writeOpenPrintTag()}
        >
          {m.openPrintTagWrite}
        </button>
        {!hasWebNfc ? <p className="muted">{m.openPrintTagNoWebNfc}</p> : null}
      </div>

      <button
        type="button"
        className="secondary"
        onClick={() => setShowHelper((v) => !v)}
      >
        {showHelper ? m.hideHelper : m.showHelper}
      </button>
      {showHelper ? (
        <div className="stack panel">
          <p className="muted">{m.helperBody}</p>
          <button type="button" onClick={() => bridgePost("/v1/rfid/simulate-write")}>
            {m.simulate}
          </button>
          <button type="button" onClick={() => bridgePost("/v1/rfid/write")}>
            {m.writeViaHelper}
          </button>
          <button type="button" onClick={listReaders}>
            {m.detectReaders}
          </button>
          <button type="button" onClick={resolveAndInstallHelper}>
            {m.resolveInstallHelper}
          </button>
        </div>
      ) : null}
      {error ? <div className="banner-warn">{error}</div> : null}
      {readers ? (
        <div className="panel">
          <h3>{m.readersHeading}</h3>
          <pre>{readers}</pre>
        </div>
      ) : null}
      {resolveInfo ? (
        <div className="panel">
          <h3>{m.resolveHeading}</h3>
          <pre>{resolveInfo}</pre>
        </div>
      ) : null}
      {result ? <pre>{result}</pre> : null}
    </div>
  );
}
