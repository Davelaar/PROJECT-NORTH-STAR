"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type SearchableOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value: string;
  options: SearchableOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
  /** Allow creating a new option from the typed query. */
  allowCreate?: boolean;
  createLabel?: (query: string) => string;
  onCreate?: (query: string) => void | Promise<void>;
  creatingText?: string;
};

/**
 * Accessible combobox: type to filter long lists, then pick an option.
 * Optional create-new path for community catalog contributions.
 */
export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Type to search…",
  emptyText = "No matches",
  disabled = false,
  required = false,
  allowCreate = false,
  createLabel = (q) => `Add “${q}”`,
  onCreate,
  creatingText = "Adding…",
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const canCreate = useMemo(() => {
    if (!allowCreate || !onCreate) return false;
    const q = query.trim();
    if (q.length < 1) return false;
    return !options.some(
      (o) => o.label.trim().toLowerCase() === q.toLowerCase(),
    );
  }, [allowCreate, onCreate, options, query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open, value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  async function createFromQuery() {
    if (!canCreate || !onCreate || creating) return;
    const q = query.trim();
    setCreating(true);
    try {
      await onCreate(q);
      setOpen(false);
      setQuery("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="searchable-select" ref={rootRef}>
      <span className="searchable-select-label">{label}</span>
      <button
        type="button"
        className="searchable-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
      >
        <span className={selected ? "" : "muted"}>
          {selected?.label ?? placeholder}
        </span>
        <span aria-hidden="true" className="searchable-select-caret">
          ▾
        </span>
      </button>
      {required ? (
        <input type="hidden" value={value} required={required && !value} readOnly />
      ) : null}
      {open && !disabled ? (
        <div className="searchable-select-panel" role="presentation">
          <input
            className="searchable-select-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter") {
                e.preventDefault();
                if (canCreate && filtered.length === 0) {
                  void createFromQuery();
                } else if (filtered[0]) {
                  pick(filtered[0].value);
                }
              }
            }}
          />
          <ul id={listId} className="searchable-select-list" role="listbox">
            <li role="option" aria-selected={!value}>
              <button type="button" onClick={() => pick("")}>
                {placeholder}
              </button>
            </li>
            {canCreate ? (
              <li role="option" aria-selected={false}>
                <button
                  type="button"
                  className="searchable-select-create"
                  disabled={creating}
                  onClick={() => void createFromQuery()}
                >
                  {creating ? creatingText : createLabel(query.trim())}
                </button>
              </li>
            ) : null}
            {filtered.length === 0 && !canCreate ? (
              <li className="muted searchable-select-empty">{emptyText}</li>
            ) : (
              filtered.map((o) => (
                <li key={o.value} role="option" aria-selected={o.value === value}>
                  <button
                    type="button"
                    className={o.value === value ? "is-selected" : undefined}
                    onClick={() => pick(o.value)}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
