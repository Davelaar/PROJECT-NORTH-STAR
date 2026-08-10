/**
 * Browser RFID transports for CFS ciphertext write + read-back.
 * Crypto stays on the API; the browser only moves encrypted bytes.
 *
 * Protocol OF1 (Web Serial / WebUSB text bulk):
 *   → HELLO\n
 *   ← OF1 READY\n
 *   → WRITE <96-hex-ciphertext>\n
 *   ← OK\n
 *   → READ\n
 *   ← DATA <96-hex>\n
 *
 * Memory transport implements the same write→read→verify contract in-page
 * (no hardware) so the UX flow is testable everywhere.
 */

export type BrowserRfidKind = "memory" | "web-serial" | "web-usb";

export type BrowserWriteResult = {
  ok: true;
  kind: BrowserRfidKind;
  ciphertextHexWritten: string;
  ciphertextHexRead: string;
  verified: {
    plaintextAscii: string;
    fields: unknown;
  };
};

function normalizeHex(hex: string): string {
  return hex.replace(/\s+/g, "").toLowerCase();
}

export class MemoryBrowserTransport {
  readonly kind = "memory" as const;
  private store: string | null = null;

  async connect(): Promise<void> {
    this.store = null;
  }

  async disconnect(): Promise<void> {
    /* no-op */
  }

  async writeCiphertext(hex: string): Promise<void> {
    const h = normalizeHex(hex);
    if (h.length !== 96) throw new Error("CFS ciphertext must be 48 bytes (96 hex chars)");
    this.store = h;
  }

  async readCiphertext(): Promise<string> {
    if (!this.store) throw new Error("Nothing written yet");
    return this.store;
  }
}

async function readLine(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  buffer: { text: string },
  timeoutMs = 8000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  const decoder = new TextDecoder();
  while (Date.now() < deadline) {
    const idx = buffer.text.indexOf("\n");
    if (idx >= 0) {
      const line = buffer.text.slice(0, idx).replace(/\r$/, "");
      buffer.text = buffer.text.slice(idx + 1);
      return line;
    }
    const remaining = deadline - Date.now();
    const result = await Promise.race([
      reader.read(),
      new Promise<ReadableStreamReadResult<Uint8Array>>((resolve) =>
        setTimeout(() => resolve({ done: true, value: undefined }), remaining),
      ),
    ]);
    if (result.done && !result.value) {
      throw new Error("Reader timed out waiting for response");
    }
    if (result.value) buffer.text += decoder.decode(result.value, { stream: true });
  }
  throw new Error("Reader timed out waiting for response");
}

async function writeText(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  line: string,
) {
  await writer.write(new TextEncoder().encode(line.endsWith("\n") ? line : `${line}\n`));
}

/** OpenFilament OF1 line protocol over Web Serial. */
export class WebSerialBrowserTransport {
  readonly kind = "web-serial" as const;
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private buffer = { text: "" };

  async connect(): Promise<void> {
    if (!("serial" in navigator)) {
      throw new Error("Web Serial is not available in this browser");
    }
    const nav = navigator as Navigator & {
      serial: {
        requestPort: () => Promise<SerialPort>;
      };
    };
    this.port = await nav.serial.requestPort();
    await this.port.open({ baudRate: 115200 });
    if (!this.port.readable || !this.port.writable) {
      throw new Error("Serial port is not readable/writable");
    }
    this.reader = this.port.readable.getReader();
    this.writer = this.port.writable.getWriter();
    this.buffer.text = "";
    await writeText(this.writer, "HELLO");
    const reply = await readLine(this.reader, this.buffer);
    if (!/OF1\s+READY/i.test(reply)) {
      throw new Error(
        `Unexpected reader hello: "${reply}". Firmware must speak OpenFilament OF1.`,
      );
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.reader?.releaseLock();
      this.writer?.releaseLock();
      await this.port?.close();
    } catch {
      /* ignore */
    }
    this.port = null;
    this.reader = null;
    this.writer = null;
  }

  async writeCiphertext(hex: string): Promise<void> {
    if (!this.writer || !this.reader) throw new Error("Not connected");
    const h = normalizeHex(hex);
    if (h.length !== 96) throw new Error("CFS ciphertext must be 48 bytes (96 hex chars)");
    await writeText(this.writer, `WRITE ${h}`);
    const reply = await readLine(this.reader, this.buffer);
    if (!/^OK\b/i.test(reply)) {
      throw new Error(`Write failed: ${reply}`);
    }
  }

  async readCiphertext(): Promise<string> {
    if (!this.writer || !this.reader) throw new Error("Not connected");
    await writeText(this.writer, "READ");
    const reply = await readLine(this.reader, this.buffer);
    const m = reply.match(/^DATA\s+([0-9a-fA-F]+)/);
    if (!m?.[1]) throw new Error(`Read failed: ${reply}`);
    return normalizeHex(m[1]);
  }
}

/**
 * WebUSB experimental: looks for a device presenting a bulk IN/OUT pair and
 * speaks the same OF1 text protocol. Most CCID/PC/SC readers (e.g. ACR122U)
 * are NOT compatible — use the optional PC/SC helper for those.
 */
export class WebUsbBrowserTransport {
  readonly kind = "web-usb" as const;
  private device: USBDevice | null = null;
  private endpointIn = 1;
  private endpointOut = 1;
  private interfaceNumber = 0;
  private buffer = { text: "" };

  async connect(): Promise<void> {
    if (!("usb" in navigator)) {
      throw new Error("WebUSB is not available in this browser");
    }
    const nav = navigator as Navigator & {
      usb: { requestDevice: (opts: { filters: object[] }) => Promise<USBDevice> };
    };
    // Empty filters → browser shows all devices; user must pick an OF1-capable adapter.
    this.device = await nav.usb.requestDevice({ filters: [] });
    await this.device.open();
    if (this.device.configuration == null) {
      await this.device.selectConfiguration(1);
    }
    const iface = this.device.configuration?.interfaces[0];
    if (!iface) throw new Error("USB device has no interfaces");
    this.interfaceNumber = iface.interfaceNumber;
    await this.device.claimInterface(this.interfaceNumber);
    const alt = iface.alternates[0];
    const bulkIn = alt?.endpoints.find((e) => e.direction === "in" && e.type === "bulk");
    const bulkOut = alt?.endpoints.find((e) => e.direction === "out" && e.type === "bulk");
    if (!bulkIn || !bulkOut) {
      throw new Error(
        "No bulk endpoints — this is likely a CCID/PC/SC reader. Use Web Serial OF1 hardware or the optional PC/SC helper.",
      );
    }
    this.endpointIn = bulkIn.endpointNumber;
    this.endpointOut = bulkOut.endpointNumber;
    this.buffer.text = "";
    await this.device.transferOut(
      this.endpointOut,
      new TextEncoder().encode("HELLO\n"),
    );
    const line = await this.readUsbLine();
    if (!/OF1\s+READY/i.test(line)) {
      throw new Error(`Unexpected USB hello: "${line}"`);
    }
  }

  private async readUsbLine(timeoutMs = 8000): Promise<string> {
    if (!this.device) throw new Error("Not connected");
    const deadline = Date.now() + timeoutMs;
    const decoder = new TextDecoder();
    while (Date.now() < deadline) {
      const idx = this.buffer.text.indexOf("\n");
      if (idx >= 0) {
        const line = this.buffer.text.slice(0, idx).replace(/\r$/, "");
        this.buffer.text = this.buffer.text.slice(idx + 1);
        return line;
      }
      const result = await this.device.transferIn(this.endpointIn, 64);
      if (result.data) {
        this.buffer.text += decoder.decode(
          new Uint8Array(result.data.buffer, result.data.byteOffset, result.data.byteLength),
          { stream: true },
        );
      }
    }
    throw new Error("USB reader timed out");
  }

  async disconnect(): Promise<void> {
    try {
      if (this.device?.opened) {
        await this.device.releaseInterface(this.interfaceNumber);
        await this.device.close();
      }
    } catch {
      /* ignore */
    }
    this.device = null;
  }

  async writeCiphertext(hex: string): Promise<void> {
    if (!this.device) throw new Error("Not connected");
    const h = normalizeHex(hex);
    if (h.length !== 96) throw new Error("CFS ciphertext must be 48 bytes (96 hex chars)");
    await this.device.transferOut(
      this.endpointOut,
      new TextEncoder().encode(`WRITE ${h}\n`),
    );
    const reply = await this.readUsbLine();
    if (!/^OK\b/i.test(reply)) throw new Error(`USB write failed: ${reply}`);
  }

  async readCiphertext(): Promise<string> {
    if (!this.device) throw new Error("Not connected");
    await this.device.transferOut(
      this.endpointOut,
      new TextEncoder().encode("READ\n"),
    );
    const reply = await this.readUsbLine();
    const m = reply.match(/^DATA\s+([0-9a-fA-F]+)/);
    if (!m?.[1]) throw new Error(`USB read failed: ${reply}`);
    return normalizeHex(m[1]);
  }
}

export type AnyBrowserTransport =
  | MemoryBrowserTransport
  | WebSerialBrowserTransport
  | WebUsbBrowserTransport;

export async function browserWriteAndVerify(opts: {
  transport: AnyBrowserTransport;
  encode: () => Promise<{ ciphertextHex: string }>;
  verify: (ciphertextHex: string) => Promise<{
    ok: boolean;
    plaintextAscii: string;
    fields: unknown;
  }>;
}): Promise<BrowserWriteResult> {
  await opts.transport.connect();
  try {
    const encoded = await opts.encode();
    const written = normalizeHex(encoded.ciphertextHex);
    await opts.transport.writeCiphertext(written);
    const readBack = normalizeHex(await opts.transport.readCiphertext());
    if (readBack !== written) {
      throw new Error("Read-back ciphertext mismatch — write NOT reported successful");
    }
    const verified = await opts.verify(readBack);
    if (!verified.ok) throw new Error("API verify failed after read-back");
    return {
      ok: true,
      kind: opts.transport.kind,
      ciphertextHexWritten: written,
      ciphertextHexRead: readBack,
      verified: {
        plaintextAscii: verified.plaintextAscii,
        fields: verified.fields,
      },
    };
  } finally {
    await opts.transport.disconnect();
  }
}
