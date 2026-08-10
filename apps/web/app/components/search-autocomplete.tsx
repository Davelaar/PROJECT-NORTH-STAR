"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { trackEvent } from "@/lib/analytics/ga";

type Hit = {
  type: string;
  uuid: string;
  label: string;
  sublabel?: string;
  href: string;
};

export function SearchAutocomplete({
  name = "q",
  defaultValue = "",
  placeholder,
  ariaLabel,
}: {
  name?: string;
  defaultValue?: string;
  placeholder: string;
  ariaLabel?: string;
}) {
  const [q, setQ] = useState(defaultValue);
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = window.setTimeout(() => {
      void apiGet<{ results: Hit[] }>(
        `/api/v1/catalog/autocomplete?q=${encodeURIComponent(q.trim())}&limit=8`,
      )
        .then((r) => {
          setHits(r.results);
          setOpen(true);
          setActive(0);
        })
        .catch(() => setHits([]));
    }, 180);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="autocomplete" ref={boxRef}>
      <input
        name={name}
        value={q}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && hits.length > 0}
        autoComplete="off"
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !hits.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, hits.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && hits[active]) {
            e.preventDefault();
            trackEvent("catalog_search_submitted", { via: "autocomplete" });
            router.push(hits[active]!.href);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && hits.length > 0 ? (
        <ul id={listId} role="listbox" className="autocomplete-list">
          {hits.map((h, i) => (
            <li key={`${h.type}-${h.uuid}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={i === active ? "active" : undefined}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  trackEvent("catalog_search_submitted", { via: "autocomplete" });
                  router.push(h.href);
                }}
              >
                <strong>{h.label}</strong>
                {h.sublabel ? <span className="muted"> {h.sublabel}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
