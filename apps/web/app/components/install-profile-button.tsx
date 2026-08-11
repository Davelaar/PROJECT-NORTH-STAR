"use client";

import Link from "next/link";
import { listSlicerPresets } from "@open-filament/domain";
import { useMessages } from "@/app/components/messages-provider";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  detectBrowserCapabilities,
  slicerSaveMode,
} from "@/lib/capabilities";

type Format = "orca" | "creality" | "prusaslicer" | "bambu";

function downloadBlob(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download for slicer — primary path is browser download + manual import.
 * Optional File System Access; optional experimental helper is collapsed.
 */
export function InstallProfileButton({ profileUuid }: { profileUuid: string }) {
  const messages = useMessages();
  const mp = messages.profile;
  const me = messages.export;
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [format, setFormat] = useState<Format>("creality");
  const [canFs, setCanFs] = useState(false);
  const slicers = listSlicerPresets();

  useEffect(() => {
    setCanFs(slicerSaveMode(detectBrowserCapabilities()) === "save_to_folder");
  }, []);

  async function exportPayload() {
    const res = await apiFetch(`/api/v1/exports/${format}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileUuid }),
    });
    const data = (await res.json()) as Record<string, unknown> & {
      error?: { message: string };
      suggestedFileName?: string;
      presetText?: string;
      preset?: unknown;
    };
    if (!res.ok) throw new Error(data.error?.message ?? JSON.stringify(data));
    return data;
  }

  async function download() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const data = await exportPayload();
      const name = String(
        data.suggestedFileName ??
          (format === "prusaslicer"
            ? "openfilament-filament.ini"
            : "openfilament-profile.json"),
      );
      if (format === "prusaslicer") {
        downloadBlob(name, String(data.presetText ?? ""), "text/plain;charset=utf-8");
      } else {
        downloadBlob(
          name,
          JSON.stringify(data.preset ?? data, null, 2),
          "application/json",
        );
      }
      setMsg(`${me.readyToImport} — ${me.noInstallClaim}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : mp.downloadFailed);
    } finally {
      setBusy(false);
    }
  }

  async function saveWithPicker() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const data = await exportPayload();
      const w = window as Window & {
        showSaveFilePicker?: (opts: unknown) => Promise<FileSystemFileHandle>;
      };
      if (!w.showSaveFilePicker) {
        throw new Error(mp.savePickerUnavailable);
      }
      const name = String(
        data.suggestedFileName ??
          (format === "prusaslicer"
            ? "openfilament-filament.ini"
            : "openfilament-profile.json"),
      );
      const contents =
        format === "prusaslicer"
          ? String(data.presetText ?? "")
          : JSON.stringify(data.preset ?? data, null, 2);
      const handle = await w.showSaveFilePicker({
        suggestedName: name,
        types: [
          {
            description: mp.slicerPresetDesc,
            accept: {
              "application/json": [".json"],
              "text/plain": [".ini"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(contents);
      await writable.close();
      setMsg(`${me.readyToImport} — ${me.noInstallClaim}`);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setErr(e instanceof Error ? e.message : mp.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  const selected = slicers.find((s) => s.id === format);

  return (
    <div className="stack">
      <label>
        {me.downloadForSlicer}
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as Format)}
          disabled={busy}
          aria-label={me.downloadForSlicer}
        >
          {slicers.map((s) => (
            <option key={s.id} value={s.id} disabled={!s.downloadEnabled}>
              {me.formats[s.id]} ({s.status})
            </option>
          ))}
        </select>
      </label>
      {selected?.docsPath ? (
        <p className="muted">
          <Link href={selected.docsPath}>
            {me.viewInstructionsNamed.replace("{name}", selected.name)}
          </Link>
          {" · "}
          <span className={`badge badge-status-${selected.status}`}>
            {selected.status}
          </span>{" "}
          {selected.supportedVersions.join(", ")} · {selected.extension}
        </p>
      ) : null}
      <button type="button" onClick={download} disabled={busy}>
        {busy ? mp.working : `${me.downloadForSlicer} — ${me.formats[format]}`}
      </button>
      {canFs ? (
        <button
          type="button"
          className="secondary"
          onClick={saveWithPicker}
          disabled={busy}
        >
          {me.savePicker}
        </button>
      ) : null}
      <p className="muted">
        {me.banner}{" "}
        <Link href={`/export?profileUuid=${profileUuid}&format=${format}`}>
          {mp.exportPageLink}
        </Link>
      </p>
      <div aria-live="polite">{msg ? <div className="panel">{msg}</div> : null}</div>
      {err ? <div className="banner-warn">{err}</div> : null}
    </div>
  );
}
