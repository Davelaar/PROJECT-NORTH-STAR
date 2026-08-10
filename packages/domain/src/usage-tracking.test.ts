import { describe, expect, it } from "vitest";
import {
  USAGE_COMPATIBILITY_REGISTRY,
  createInventoryUsageLedger,
  createUsageConversionService,
  type UsageTransaction,
} from "./usage-tracking.js";

function tx(overrides: Partial<UsageTransaction> = {}): UsageTransaction {
  return {
    uuid: overrides.uuid ?? "tx-1",
    spoolId: overrides.spoolId ?? "spool-1",
    printJobId: overrides.printJobId ?? "job-1",
    eventId: overrides.eventId ?? "event-1",
    slicer: overrides.slicer ?? "OrcaSlicer",
    slicerVersion: overrides.slicerVersion ?? "2.2",
    printerIntegrationType: overrides.printerIntegrationType ?? "manual",
    status: overrides.status ?? "completed",
    predicted: overrides.predicted ?? { weightG: 42, lengthMm: 14000, volumeMm3: 34000 },
    printerReported: overrides.printerReported ?? {},
    deducted: overrides.deducted ?? { weightG: 42 },
    materialDensityGcm3: overrides.materialDensityGcm3 ?? 1.24,
    filamentDiameterMm: overrides.filamentDiameterMm ?? 1.75,
    usageSource: overrides.usageSource ?? "completed_print_estimate",
    confidence: overrides.confidence ?? "completed_print_estimate",
    recordedAt: overrides.recordedAt ?? "2026-08-10T00:00:00.000Z",
    automaticallyGenerated: overrides.automaticallyGenerated ?? false,
    manuallyConfirmed: overrides.manuallyConfirmed ?? true,
    originalValues: overrides.originalValues ?? { predictedWeightG: 42 },
    correctionOfTransactionUuid: overrides.correctionOfTransactionUuid,
    notes: overrides.notes,
  };
}

describe("usage conversion service", () => {
  it("converts length, volume and weight for different diameters/densities", () => {
    const svc = createUsageConversionService();
    const pla175 = svc.lengthToWeightG(1000, 1.75, 1.24);
    const pla285 = svc.lengthToWeightG(1000, 2.85, 1.24);
    expect(pla175).toBeCloseTo(2.98, 2);
    expect(pla285).toBeGreaterThan(pla175);
  });
});

describe("inventory usage ledger", () => {
  it("deduplicates repeated job events by idempotency key", () => {
    const ledger = createInventoryUsageLedger();
    ledger.record(tx({ uuid: "a", eventId: "same-event" }));
    ledger.record(tx({ uuid: "b", eventId: "same-event", deducted: { weightG: 99 } }));
    expect(ledger.list()).toHaveLength(1);
    expect(ledger.list()[0]?.deducted.weightG).toBe(42);
  });

  it("records corrections as auditable adjustment transactions", () => {
    const ledger = createInventoryUsageLedger([tx({ uuid: "original" })]);
    ledger.correct({
      originalUuid: "original",
      correction: tx({
        uuid: "correction",
        eventId: "correction-event",
        usageSource: "manual_correction",
        confidence: "manual",
        deducted: { weightG: -5 },
        originalValues: { correctedFrom: "original" },
      }),
    });
    expect(ledger.list()).toHaveLength(2);
    expect(ledger.list()[1]?.correctionOfTransactionUuid).toBe("original");
  });
});

describe("usage compatibility registry", () => {
  it("contains conservative evidence-backed entries", () => {
    expect(USAGE_COMPATIBILITY_REGISTRY.map((e) => e.id)).toEqual([
      "orcaslicer",
      "bambu-studio",
      "creality-print",
      "prusaslicer",
      "moonraker-klipper",
      "octoprint",
    ]);
    for (const entry of USAGE_COMPATIBILITY_REGISTRY) {
      expect(entry.evidence.length, entry.id).toBeGreaterThan(0);
      expect(entry.limitations.join(" ")).not.toMatch(/exact usage|automatic actual/i);
      expect(entry.hardwareTested).toBe(false);
    }
  });
});
