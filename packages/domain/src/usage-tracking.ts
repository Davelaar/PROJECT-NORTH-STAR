export const USAGE_TERMS = {
  slicerEstimate: "slicer_estimate",
  completedPrintEstimate: "completed_print_estimate",
  printerReportedUsage: "printer_reported_usage",
  manualCorrection: "manual_correction",
  scaleMeasuredUsage: "scale_measured_usage",
} as const;

export type UsageSource = (typeof USAGE_TERMS)[keyof typeof USAGE_TERMS];
export type PrintJobStatus =
  | "queued"
  | "printing"
  | "completed"
  | "failed"
  | "cancelled"
  | "interrupted"
  | "unknown";
export type UsageConfidence =
  | "slicer_estimate"
  | "completed_print_estimate"
  | "printer_reported_extrusion"
  | "rough_estimate"
  | "manual"
  | "scale_measured_actual";

export type UsageQuantity = {
  lengthMm?: number | null;
  volumeMm3?: number | null;
  weightG?: number | null;
};

export type UsageTransaction = {
  uuid: string;
  spoolId: string;
  printJobId?: string | null;
  eventId?: string | null;
  slicer?: string | null;
  slicerVersion?: string | null;
  printerIntegrationType?: string | null;
  status: PrintJobStatus;
  predicted: UsageQuantity;
  printerReported: UsageQuantity;
  deducted: UsageQuantity;
  materialDensityGcm3: number;
  filamentDiameterMm: number;
  usageSource: UsageSource;
  confidence: UsageConfidence;
  recordedAt: string;
  automaticallyGenerated: boolean;
  manuallyConfirmed: boolean;
  originalValues: Record<string, unknown>;
  correctionOfTransactionUuid?: string | null;
  notes?: string | null;
};

export type SlicerUsageEstimateAdapter = {
  id: string;
  importEstimate(input: unknown): Promise<UsageQuantity[]>;
};

export type PrintHostUsageAdapter = {
  id: string;
  getJobStatus(jobId: string): Promise<{
    status: PrintJobStatus;
    printerReported?: UsageQuantity;
  }>;
};

export type SpoolAllocationAdapter = {
  id: string;
  allocate(input: {
    jobId?: string | null;
    tool: string;
    material?: string | null;
  }): Promise<{ spoolId: string | null; confidence: UsageConfidence }>;
};

export type UsageConversionService = {
  lengthToVolumeMm3(lengthMm: number, diameterMm: number): number;
  volumeToWeightG(volumeMm3: number, densityGcm3: number): number;
  lengthToWeightG(lengthMm: number, diameterMm: number, densityGcm3: number): number;
};

export function createUsageConversionService(): UsageConversionService {
  return {
    lengthToVolumeMm3(lengthMm, diameterMm) {
      const radius = diameterMm / 2;
      return Math.PI * radius * radius * lengthMm;
    },
    volumeToWeightG(volumeMm3, densityGcm3) {
      return (volumeMm3 / 1000) * densityGcm3;
    },
    lengthToWeightG(lengthMm, diameterMm, densityGcm3) {
      return this.volumeToWeightG(
        this.lengthToVolumeMm3(lengthMm, diameterMm),
        densityGcm3,
      );
    },
  };
}

export type InventoryUsageLedger = {
  record(transaction: UsageTransaction): UsageTransaction;
  correct(input: {
    originalUuid: string;
    correction: Omit<UsageTransaction, "correctionOfTransactionUuid">;
  }): UsageTransaction;
  list(): UsageTransaction[];
};

export function createInventoryUsageLedger(
  initial: UsageTransaction[] = [],
): InventoryUsageLedger {
  const transactions = [...initial];
  const seen = new Set(
    transactions
      .map((t) => t.eventId ?? t.uuid)
      .filter((value): value is string => Boolean(value)),
  );
  return {
    record(transaction) {
      const idempotencyKey = transaction.eventId ?? transaction.uuid;
      if (seen.has(idempotencyKey)) {
        return transactions.find((t) => (t.eventId ?? t.uuid) === idempotencyKey)!;
      }
      transactions.push(transaction);
      seen.add(idempotencyKey);
      return transaction;
    },
    correct(input) {
      const tx = {
        ...input.correction,
        correctionOfTransactionUuid: input.originalUuid,
      };
      return this.record(tx);
    },
    list() {
      return [...transactions];
    },
  };
}

export type UsageCapabilityStatus =
  | "verified"
  | "beta"
  | "experimental"
  | "manual-only"
  | "unavailable"
  | "unverified";

export type UsageCompatibilityEntry = {
  id: string;
  product: string;
  testedVersions: string[];
  operatingSystems?: string[];
  estimateSupport: UsageCapabilityStatus;
  completionStatusSupport: UsageCapabilityStatus;
  partialFailureSupport: UsageCapabilityStatus;
  multiMaterialSupport: UsageCapabilityStatus;
  integrationMethod: string;
  status: UsageCapabilityStatus;
  lastVerified: string;
  evidence: string[];
  limitations: string[];
  hardwareTested: boolean;
  cloudAddsTrackingCapability: boolean;
};

export const USAGE_COMPATIBILITY_REGISTRY: readonly UsageCompatibilityEntry[] = [
  {
    id: "orcaslicer",
    product: "OrcaSlicer",
    testedVersions: ["2.0+", "2.1+", "2.2+"],
    estimateSupport: "beta",
    completionStatusSupport: "manual-only",
    partialFailureSupport: "manual-only",
    multiMaterialSupport: "manual-only",
    integrationMethod: "Generated output, placeholders, project/G-code metadata",
    status: "beta",
    lastVerified: "2026-08-10",
    evidence: ["https://github.com/OrcaSlicer/OrcaSlicer/wiki/built_in_placeholders_variables"],
    limitations: [
      "Slicer estimates are available, but OrcaSlicer alone does not know whether the print completed.",
      "Failed-print deduction is manual unless a compatible print host reports executed extrusion.",
      "Multi-material use requires tool or slot mapping to physical spools.",
      "Actual usage requires physical scale measurement.",
    ],
    hardwareTested: false,
    cloudAddsTrackingCapability: false,
  },
  {
    id: "bambu-studio",
    product: "Bambu Studio",
    testedVersions: ["1.9+", "2.0+"],
    estimateSupport: "beta",
    completionStatusSupport: "unverified",
    partialFailureSupport: "experimental",
    multiMaterialSupport: "manual-only",
    integrationMethod: "Generated G-code/3MF metadata; unofficial LAN/MQTT only if separately validated",
    status: "unverified",
    lastVerified: "2026-08-10",
    evidence: ["https://wiki.bambulab.com/en/software/bambu-studio/view-slicing-information"],
    limitations: [
      "Calculated values remain pre-print slicer estimates.",
      "No stable officially supported public usage API is confirmed for OpenFilament.",
      "AMS slot-to-spool mapping must be verified by the user.",
      "Bambu RFID does not automatically identify arbitrary OpenFilament spools.",
    ],
    hardwareTested: false,
    cloudAddsTrackingCapability: false,
  },
  {
    id: "creality-print",
    product: "Creality Print",
    testedVersions: ["6.x", "7.x"],
    estimateSupport: "beta",
    completionStatusSupport: "unverified",
    partialFailureSupport: "manual-only",
    multiMaterialSupport: "manual-only",
    integrationMethod: "Generated output; Moonraker only on compatible printers/firmware",
    status: "unverified",
    lastVerified: "2026-08-10",
    evidence: ["https://wiki.creality.com/en/software/6-0/release-notes-7-0-0"],
    limitations: [
      "Creality Print calculations are predictions, not post-print measurements.",
      "Closed Creality Cloud/device interfaces are not presented as supported.",
      "CFS spool detection and slicer preset selection are separate from consumption tracking.",
      "Rooted or third-party firmware is not implied to be officially supported or risk-free.",
    ],
    hardwareTested: false,
    cloudAddsTrackingCapability: false,
  },
  {
    id: "prusaslicer",
    product: "PrusaSlicer",
    testedVersions: ["2.7+", "2.8+", "2.9+"],
    estimateSupport: "beta",
    completionStatusSupport: "unverified",
    partialFailureSupport: "manual-only",
    multiMaterialSupport: "manual-only",
    integrationMethod: "Placeholders and exported G-code estimates; print host needed for job result",
    status: "unverified",
    lastVerified: "2026-08-10",
    evidence: ["https://help.prusa3d.com/article/list-of-placeholders_205643"],
    limitations: [
      "PrusaSlicer alone does not receive a reliable post-print result for every workflow.",
      "Do not claim Prusa Connect or PrusaLink reports partial consumption until verified.",
      "Failed-print deduction remains manual unless a compatible print host provides execution data.",
    ],
    hardwareTested: false,
    cloudAddsTrackingCapability: false,
  },
  {
    id: "moonraker-klipper",
    product: "Moonraker / Klipper",
    testedVersions: ["Moonraker current docs", "Klipper current docs"],
    estimateSupport: "beta",
    completionStatusSupport: "verified",
    partialFailureSupport: "beta",
    multiMaterialSupport: "manual-only",
    integrationMethod: "Moonraker print_stats / Klipper object query",
    status: "beta",
    lastVerified: "2026-08-10",
    evidence: [
      "https://moonraker.readthedocs.io/en/latest/printer_objects/",
      "https://www.klipper3d.org/Status_Reference.html",
    ],
    limitations: [
      "Printer-reported usage is executed extrusion, not physical measurement.",
      "It may miss slipping, jams, manual purging or an incorrectly selected spool.",
      "Weight conversion depends on correct diameter and density.",
      "Browser local-network access can be affected by HTTPS, CORS and private-network restrictions.",
    ],
    hardwareTested: false,
    cloudAddsTrackingCapability: false,
  },
  {
    id: "octoprint",
    product: "OctoPrint",
    testedVersions: ["1.10+"],
    estimateSupport: "beta",
    completionStatusSupport: "beta",
    partialFailureSupport: "unavailable",
    multiMaterialSupport: "manual-only",
    integrationMethod: "OctoPrint job API, events and separately validated plugins",
    status: "beta",
    lastVerified: "2026-08-10",
    evidence: ["https://docs.octoprint.org/en/main/api/job.html"],
    limitations: [
      "Standard job events do not necessarily contain exact executed filament consumption.",
      "Progress percentage is not filament-consumption percentage.",
      "Accurate failed-print deduction needs a validated plugin or executed-extrusion tracker.",
    ],
    hardwareTested: false,
    cloudAddsTrackingCapability: false,
  },
] as const;

export function usageCompatibilityById(id: string) {
  return USAGE_COMPATIBILITY_REGISTRY.find((entry) => entry.id === id);
}
