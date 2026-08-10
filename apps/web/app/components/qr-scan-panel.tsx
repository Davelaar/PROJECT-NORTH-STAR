"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { detectBrowserCapabilities } from "@/lib/capabilities";
import { parseOpenFilamentQrPayload } from "@/lib/qr-parse";
import { useMessages } from "@/app/components/messages-provider";

type Mode = "phone" | "camera";

function isDesktopLike(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: fine) and (hover: hover)").matches &&
    window.innerWidth >= 768
  );
}

export function QrScanPanel() {
  const messages = useMessages();
  const s = messages.scan;
  const router = useRouter();
  const params = useSearchParams();
  const onPhone = params.get("onPhone") === "1";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);

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

  const goToUuid = useCallback(
    (uuid: string) => {
      router.push(`/variants/${uuid}`);
    },
    [router],
  );

  const stop = useCallback(() => {
    activeRef.current = false;
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
      detector: {
        detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
      } | null,
    ): Promise<string | null> => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;

      if (detector) {
        try {
          const codes = await detector.detect(canvas);
          for (const code of codes) {
            const uuid = parseOpenFilamentQrPayload(code.rawValue);
            if (uuid) return uuid;
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
      const small = document.createElement("canvas");
      small.width = w;
      small.height = h;
      const sctx = small.getContext("2d", { willReadFrequently: true });
      if (!sctx) return null;
      sctx.drawImage(canvas, 0, 0, w, h);
      const image = sctx.getImageData(0, 0, w, h);
      const code = jsQR(image.data, image.width, image.height, {
        inversionAttempts: "attemptBoth",
      });
      return code ? parseOpenFilamentQrPayload(code.data) : null;
    },
    [],
  );

  const startCamera = useCallback(async () => {
    setError("");
    setStatus(s.scanningStatus);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(s.cameraUnavailable);
      return;
    }
    stop();
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

      const Detector = (
        window as unknown as {
          BarcodeDetector?: new (opts: { formats: string[] }) => {
            detect: (
              source: ImageBitmapSource,
            ) => Promise<{ rawValue: string }[]>;
          };
        }
      ).BarcodeDetector;
      const detector = Detector
        ? new Detector({ formats: ["qr_code"] })
        : null;

      const tick = async () => {
        if (!activeRef.current) return;
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || v.readyState < 2 || v.videoWidth < 16) {
          rafRef.current = requestAnimationFrame(() => {
            void tick();
          });
          return;
        }
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(v, 0, 0, c.width, c.height);

        try {
          const uuid = await tryDecodeFrame(c, detector);
          if (uuid && activeRef.current) {
            stop();
            setStatus(s.scanSuccess);
            goToUuid(uuid);
            return;
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
  }, [goToUuid, s, stop, tryDecodeFrame]);

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
    goToUuid(uuid);
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
