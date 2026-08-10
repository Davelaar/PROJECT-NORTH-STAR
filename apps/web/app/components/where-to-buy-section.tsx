"use client";

import { useState } from "react";
import { useMessages } from "@/app/components/messages-provider";
import { apiPost } from "@/lib/api";

type PurchaseLink = { storeName: string; url: string; storeSlug?: string };

type Props = {
  variantUuid: string;
  initialLinks: PurchaseLink[];
};

export function WhereToBuySection({ variantUuid, initialLinks }: Props) {
  const m = useMessages().variant;
  const [links, setLinks] = useState(initialLinks);
  const [storeName, setStoreName] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    setBusy(true);
    try {
      const res = await apiPost<{
        created: boolean;
        purchaseLinks: PurchaseLink[];
      }>(`/api/v1/community/variants/${variantUuid}/purchase-links`, {
        storeName: storeName.trim(),
        url: url.trim(),
      });
      setLinks(res.purchaseLinks);
      setStoreName("");
      setUrl("");
      setStatus(
        res.created ? m.addBuyLinkSuccess : m.addBuyLinkAlreadyListed,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : m.addBuyLinkError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="buy-links panel">
      <strong>{m.whereToBuy}</strong>
      <p className="muted">{m.buyLinksLead}</p>
      {links.length > 0 ? (
        <ul>
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.storeName}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{m.noBuyLinks}</p>
      )}
      <form className="buy-link-form stack" onSubmit={(e) => void onSubmit(e)}>
        <h3 className="buy-link-form-title">{m.addBuyLink}</h3>
        <label>
          {m.storeName}
          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            maxLength={120}
            placeholder={m.storeNamePlaceholder}
            disabled={busy}
          />
        </label>
        <label>
          {m.storeUrl}
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            maxLength={2000}
            placeholder="https://"
            disabled={busy}
          />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        {status ? <p role="status">{status}</p> : null}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? m.addingBuyLink : m.addBuyLinkCta}
        </button>
      </form>
    </div>
  );
}
