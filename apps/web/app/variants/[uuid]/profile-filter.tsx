"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type PrinterOption = {
  uuid: string;
  label: string;
};

type Props = {
  printers: PrinterOption[];
  nozzles: number[];
  selectedPrinter: string;
  selectedNozzle: string;
  labels: {
    choose: string;
    printer: string;
    nozzle: string;
    allPrinters: string;
    defaultNote: string;
  };
};

export function ProfileFilter({
  printers,
  nozzles,
  selectedPrinter,
  selectedNozzle,
  labels,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  return (
    <form
      className="profile-filter"
      onSubmit={(e) => e.preventDefault()}
      aria-busy={pending}
    >
      <h2 className="profile-filter-heading">{labels.choose}</h2>
      <p className="muted">{labels.defaultNote}</p>
      <div className="profile-filter-row">
        <label>
          <span>{labels.printer}</span>
          <select
            value={selectedPrinter}
            onChange={(e) => update("printer", e.target.value)}
            aria-label={labels.printer}
          >
            <option value="">{labels.allPrinters}</option>
            {printers.map((p) => (
              <option key={p.uuid} value={p.uuid}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.nozzle}</span>
          <select
            value={selectedNozzle}
            onChange={(e) => update("nozzle", e.target.value)}
            aria-label={labels.nozzle}
          >
            {nozzles.map((n) => (
              <option key={n} value={String(n)}>
                {n} mm
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
