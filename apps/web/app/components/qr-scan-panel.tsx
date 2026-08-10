"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { detectBrowserCapabilities } from "@/lib/capabilities";
import { parseOpenFilamentQrPayload } from "@/lib/qr-parse";
import { useMessages } from "@/app/components/messages-provider";

type Mode = "phone" | "camera";

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

function isDesktopLike(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: fine) and (hover: hover)").matches &&
    window.innerWidth >= 768
  );
}

/** Safari/iOS BarcodeDetector is unreliable on canvas frames and can stall the loop. */
function createBarcodeDetector(): BarcodeDetectorLike | null {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return null;
  if (/Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|Firefox|FxiOS/i.test(ua)) {
    return null;
  }
  const Detector = (
    window as unknown as {
      BarcodeDetector?: new (opts: { formats: string[] }) => BarcodeDetectorLike;
    }
  ).BarcodeDetector;
  if (!Detector) return null;
  try {
    return new Detector({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

export function QrScanPanel() {
  const messages = useMessages();
  const s = messages.scan;
  const params = useSearchParams();
  const onPhone = params.get("onPhone") === "1";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smallCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);
  const busyRef = useRef(false);
  const openingRef = useRef(false);

  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [mode, setMode] = useState<Mode>("camera");
  const [handoffUrl, setHandoffUrl] = useState("");
  const [handoffQr, setHandoffQr] = useState("");

  useEffect(() => {
    setHasCamera(detectBrowserCapabilities().camera);
    if (onPhone) {
      setMode("camera");
      return;
    }
    setMode(isDesktopLike() ? "phone" : "camera");
  }, [onPhone]);

  useEffect(() => {
    if (mode !== "phone" || onPhone) {
      setHandoffQr("");
      return;
    }
    const url = `${window.location.origin}/scan?onPhone=1`;
    setHandoffUrl(url);
    void QRCode.toDataURL(url, {
      margin: 1,
      width: 240,
      errorCorrectionLevel: "M",
    }).then(setHandoffQr);
  }, [mode, onPhone]);

  const openVariant = useCallback(
    (uuid: string) => {
      if (openingRef.current) return;
      openingRef.current = true;
      activeRef.current = false;
      setStatus(s.scanSuccess);
      // Stop tracks before navigating. Soft App Router pushes often no-op on
      // iOS Safari while/after getUserMedia — use a full document load.
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      const video = videoRef.current;
      if (video) video.srcObject = null;
      setScanning(false);
      window.location.assign(`/f/${uuid}`);
    },
    [s.scanSuccess],
  );

  const stop = useCallback(() => {
    if (openingRef.current) return;
    activeRef.current = false;
    busyRef.current = false;
    setScanning(false);
    setStatus("");
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  useEffect(() => () => stop(), [stop]);

  const tryDecodeFrame = useCallback(
    async (
      canvas: HTMLCanvasElement,
      detector: BarcodeDetectorLike | null,
    ): Promise<{ uuid: string | null; raw: string | null }> => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return { uuid: null, raw: null };

      if (detector) {
        try {
          const codes = await detector.detect(canvas);
          for (const code of codes) {
            const raw = code.rawValue;
            const uuid = parseOpenFilamentQrPayload(raw);
            if (uuid) return { uuid, raw };
            if (raw) return { uuid: null, raw };
          }
        } catch {
          /* fall through to jsQR */
        }
      }

      // Downscale for jsQR — full HD frames are too slow / unreliable.
      const maxW = 640;
      const scale = canvas.width > maxW ? maxW / canvas.width : 1;
      const w = Math.max(1, Math.floor(canvas.width * scale));
      const h = Math.max(1, Math.floor(canvas.height * scale));
      let small = smallCanvasRef.current;
      if (!small) {
        small = document.createElement("canvas");
        smallCanvasRef.current = small;
      }
      if (small.width !== w || small.height !== h) {
        small.width = w;
        small.height = h;
      }
      const sctx = small.getContext("2d", { willReadFrequently: true });
      if (!sctx) return { uuid: null, raw: null };
      sctx.drawImage(canvas, 0, 0, w, h);
      const image = sctx.getImageData(0, 0, w, h);
      const code = jsQR(image.data, image.width, image.height, {
        inversionAttempts: "attemptBoth",
      });
      if (!code?.data) return { uuid: null, raw: null };
      const raw = code.data;
      return { uuid: parseOpenFilamentQrPayload(raw), raw };
    },
    [],
  );

  const startCamera = useCallback(async () => {
    setError("");
    setStatus(s.scanningStatus);
    openingRef.current = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(s.cameraUnavailable);
      return;
    }
    stop();
    openingRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        setError(s.cameraFailed);
        return;
      }
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      activeRef.current = true;
      setScanning(true);

      const detector = createBarcodeDetector();

      const schedule = () => {
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
      };

      const tick = async () => {
        if (!activeRef.current || openingRef.current) return;
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || v.readyState < 2 || v.videoWidth < 16) {
          schedule();
          return;
        }
        if (busyRef.current) {
          schedule();
          return;
        }
        busyRef.current = true;
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          busyRef.current = false;
          schedule();
          return;
        }
        ctx.drawImage(v, 0, 0, c.width, c.height);

        try {
          const { uuid, raw } = await tryDecodeFrame(c, detector);
          if (uuid && activeRef.current) {
            openVariant(uuid);
            return;
          }
          if (raw && activeRef.current) {
            setStatus(`${s.unrecognizedQr} ${raw.slice(0, 96)}`);
          }
        } catch {
          /* keep scanning */
        } finally {
          busyRef.current = false;
        }
        if (activeRef.current && !openingRef.current) schedule();
      };
      schedule();
    } catch (e) {
      setError(
        e instanceof Error
          ? `${s.cameraPermissionDenied}: ${e.message}`
          : s.cameraFailed,
      );
      stop();
    }
  }, [openVariant, s, stop, tryDecodeFrame]);

  // Auto-start camera when handed off to phone.
  useEffect(() => {
    if (!onPhone || !hasCamera || mode !== "camera") return;
    const t = window.setTimeout(() => {
      void startCamera();
    }, 350);
    return () => window.clearTimeout(t);
  }, [onPhone, hasCamera, mode, startCamera]);

  function onManual(e: React.FormEvent) {
    e.preventDefault();
    const uuid = parseOpenFilamentQrPayload(manual);
    if (!uuid) {
      setError(s.invalidInput);
      return;
    }
    openVariant(uuid);
  }

  function switchMode(next: Mode) {
    stop();
    setError("");
    setMode(next);
  }

  return (
    <div className="stack scan-panel">
      {!onPhone ? (
        <div className="scan-mode-toggle" role="tablist" aria-label={s.modeToggleAria}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "phone"}
            className={`btn${mode === "phone" ? "" : " btn-secondary"}`}
            onClick={() => switchMode("phone")}
          >
            {s.modePhone}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "camera"}
            className={`btn${mode === "camera" ? "" : " btn-secondary"}`}
            onClick={() => switchMode("camera")}
          >
            {s.modeCamera}
          </button>
        </div>
      ) : null}

      {mode === "phone" && !onPhone ? (
        <aside className="panel continue-on-phone" aria-labelledby="continue-phone-title">
          <h2 id="continue-phone-title">{s.continueOnPhoneTitle}</h2>
          <p className="muted">{s.continueOnPhoneLead}</p>
          {handoffQr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="continue-on-phone-qr"
              src={handoffQr}
              width={240}
              height={240}
              alt={s.continueOnPhoneAlt}
            />
          ) : (
            <p className="muted">{messages.common.loading}</p>
          )}
          {handoffUrl ? (
            <p className="muted mono continue-on-phone-url">{handoffUrl}</p>
          ) : null}
          <p className="muted">{s.continueOnPhoneHint}</p>
        </aside>
      ) : (
        <div className="stack panel">
          <p className="muted">{s.cameraBanner}</p>
          {hasCamera ? (
            <>
              <div className={`qr-video-wrap${scanning ? " is-live" : ""}`}>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="qr-video"
                />
                {!scanning ? (
                  <div className="qr-video-placeholder">
                    <p>{s.cameraIdle}</p>
                  </div>
                ) : null}
              </div>
              <canvas ref={canvasRef} hidden />
              {!scanning ? (
                <button type="button" className="btn" onClick={() => void startCamera()}>
                  {s.startCamera}
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={stop}>
                  {s.stopCamera}
                </button>
              )}
              {scanning ? <p className="muted">{status || s.scanningStatus}</p> : null}
            </>
          ) : (
            <p className="muted">{s.cameraUnavailable}</p>
          )}
        </div>
      )}

      <form className="stack panel" onSubmit={onManual}>
        <label>
          {s.manualLabel}
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder={s.manualPlaceholder}
            required
          />
        </label>
        <button type="submit" className="btn">
          {s.openFilament}
        </button>
      </form>
      {error ? (
        <div className="banner-warn" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
