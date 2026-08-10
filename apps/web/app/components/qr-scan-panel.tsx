"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { detectBrowserCapabilities } from "@/lib/capabilities";
import { parseOpenFilamentQrPayload } from "@/lib/qr-parse";
import { useMessages } from "@/app/components/messages-provider";

export function QrScanPanel() {
  const messages = useMessages();
  const s = messages.scan;
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setHasCamera(detectBrowserCapabilities().camera);
  }, []);

  const goToUuid = useCallback(
    (uuid: string) => {
      router.push(`/variants/${uuid}`);
    },
    [router],
  );

  const stop = useCallback(() => {
    setScanning(false);
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stop(), [stop]);

  async function startCamera() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(s.cameraUnavailable);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      const Detector = (
        window as unknown as {
          BarcodeDetector?: new (opts: { formats: string[] }) => {
            detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
          };
        }
      ).BarcodeDetector;

      const detector = Detector
        ? new Detector({ formats: ["qr_code"] })
        : null;

      const tick = async () => {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || v.readyState < 2) {
          rafRef.current = requestAnimationFrame(() => {
            void tick();
          });
          return;
        }
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(v, 0, 0, c.width, c.height);

        try {
          if (detector) {
            const codes = await detector.detect(c);
            const raw = codes[0]?.rawValue;
            const uuid = raw ? parseOpenFilamentQrPayload(raw) : null;
            if (uuid) {
              stop();
              goToUuid(uuid);
              return;
            }
          } else {
            const image = ctx.getImageData(0, 0, c.width, c.height);
            const code = jsQR(image.data, image.width, image.height, {
              inversionAttempts: "dontInvert",
            });
            const uuid = code ? parseOpenFilamentQrPayload(code.data) : null;
            if (uuid) {
              stop();
              goToUuid(uuid);
              return;
            }
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
      };
      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? `${s.cameraPermissionDenied}: ${e.message}`
          : s.cameraFailed,
      );
      stop();
    }
  }

  function onManual(e: React.FormEvent) {
    e.preventDefault();
    const uuid = parseOpenFilamentQrPayload(manual);
    if (!uuid) {
      setError(s.invalidInput);
      return;
    }
    goToUuid(uuid);
  }

  return (
    <div className="stack">
      <div className="banner-warn">{s.cameraBanner}</div>
      {hasCamera ? (
        <div className="stack panel">
          <video ref={videoRef} playsInline muted className="qr-video" />
          <canvas ref={canvasRef} hidden />
          {!scanning ? (
            <button type="button" onClick={startCamera}>
              {s.startCamera}
            </button>
          ) : (
            <button type="button" className="secondary" onClick={stop}>
              {s.stopCamera}
            </button>
          )}
        </div>
      ) : (
        <p className="muted">{messages.common.error}</p>
      )}
      <form className="stack panel" onSubmit={onManual}>
        <label>
          {s.manualLabel}
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="https://…/f/… or UUID"
            required
          />
        </label>
        <button type="submit">{s.openFilament}</button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
    </div>
  );
}
