"use client";

import { normalizeHex } from "@/lib/color";

type Props = {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  id?: string;
};

/** Color wheel + hex field kept in sync. */
export function ColorField({ value, onChange, label = "Color", id }: Props) {
  const hex = normalizeHex(value) ?? "#6B5E54";
  return (
    <label className="color-field" htmlFor={id}>
      <span>{label}</span>
      <div className="color-field-row">
        <input
          id={id}
          type="color"
          value={hex}
          aria-label={`${label} picker`}
          onChange={(e) => onChange(normalizeHex(e.target.value) ?? e.target.value)}
        />
        <input
          type="text"
          inputMode="text"
          spellCheck={false}
          value={value.startsWith("#") ? value : hex}
          placeholder="#RRGGBB"
          aria-label={`${label} hex`}
          onChange={(e) => {
            const next = e.target.value;
            const n = normalizeHex(next);
            onChange(n ?? next);
          }}
        />
        <span
          className="color-swatch"
          style={{ background: normalizeHex(value) ?? "transparent" }}
          aria-hidden
        />
      </div>
    </label>
  );
}
