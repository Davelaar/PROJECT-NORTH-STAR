"use client";

import { useMemo, useState } from "react";
import type { UsageCompatibilityEntry } from "@open-filament/domain";
import type { UsageTrackingCopy } from "@/lib/usage-tracking-copy";

type Props = {
  entries: UsageCompatibilityEntry[];
  copy: UsageTrackingCopy;
};

export function CompatibilityChecker({ entries, copy }: Props) {
  const [slicer, setSlicer] = useState("");
  const [connection, setConnection] = useState("");
  const [goal, setGoal] = useState("confirmed");

  const result = useMemo(() => {
    const entry = entries.find((e) => e.id === slicer);
    if (!entry) return null;
    const moonraker = connection === "moonraker";
    const octoprint = connection === "octoprint";
    const physical = goal === "physical";
    return {
      entry,
      worksNow: [
        `${entry.product}: ${copy.estimate} — ${copy.statusLabels[entry.estimateSupport]}`,
        moonraker
          ? "Moonraker/Klipper can provide printer-reported extrusion when configured."
          : "Manual confirmation and manual gram entry are available.",
      ],
      needsConfirmation: [
        "Tool, AMS, CFS or MMU slot mapping must match the physical spool.",
        "Successful-print deduction still needs confirmation unless a compatible print host is configured.",
      ],
      experimental: [
        entry.partialFailureSupport === "experimental"
          ? `${entry.product} failed-print tracking is experimental.`
          : octoprint
            ? "OctoPrint failed-print consumption needs a separately validated plugin."
            : copy.notVerified,
      ],
      unavailable: [
        physical
          ? "OpenFilament cannot provide physical actual usage without compatible scale measurement."
          : "Progress percentage alone is not used as filament consumption.",
      ],
    };
  }, [connection, copy, entries, goal, slicer]);

  return (
    <section className="panel" aria-labelledby="compat-checker-heading">
      <h2 id="compat-checker-heading">{copy.checker.title}</h2>
      <p>{copy.checker.lead}</p>
      <div className="form-grid">
        <label>
          {copy.checker.slicer}
          <select value={slicer} onChange={(e) => setSlicer(e.target.value)}>
            <option value="">{copy.notVerified}</option>
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.product}
              </option>
            ))}
          </select>
        </label>
        <label>
          {copy.checker.connection}
          <select value={connection} onChange={(e) => setConnection(e.target.value)}>
            <option value="none">No network / manual</option>
            <option value="moonraker">Moonraker / Klipper</option>
            <option value="octoprint">OctoPrint</option>
            <option value="manufacturer">Manufacturer cloud</option>
            <option value="lan">LAN-only</option>
          </select>
        </label>
        <label>
          {copy.checker.goal}
          <select value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option value="confirmed">Confirmed-print deduction</option>
            <option value="failed">Failed-print tracking</option>
            <option value="physical">Physical measurement</option>
          </select>
        </label>
      </div>
      <div className="panel" aria-live="polite">
        <h3>{copy.checker.resultTitle}</h3>
        {result ? (
          <>
            <h4>{copy.checker.worksNow}</h4>
            <ul>{result.worksNow.map((item) => <li key={item}>{item}</li>)}</ul>
            <h4>{copy.checker.needsConfirmation}</h4>
            <ul>{result.needsConfirmation.map((item) => <li key={item}>{item}</li>)}</ul>
            <h4>{copy.checker.experimental}</h4>
            <ul>{result.experimental.map((item) => <li key={item}>{item}</li>)}</ul>
            <h4>{copy.checker.unavailable}</h4>
            <ul>{result.unavailable.map((item) => <li key={item}>{item}</li>)}</ul>
            <p>{copy.checker.cloudAdds}</p>
            <p>{copy.checker.localSame}</p>
          </>
        ) : (
          <p>{copy.notVerified}</p>
        )}
      </div>
    </section>
  );
}
