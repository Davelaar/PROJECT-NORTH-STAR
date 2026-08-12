"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiGet, apiPost } from "@/lib/api";
import type { ShopMessages, ShopPage, ShopProduct } from "../types";
import { formatShopPrice } from "../types";

type Order = {
  uuid: string;
  email: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
  items: { title: string; quantity: number }[];
};

const pages: ShopPage[] = ["filament", "hardware", "prints"];

function blank(page: ShopPage): Partial<ShopProduct> {
  return {
    page,
    title: "",
    description: "",
    priceCents: 0,
    currency: "eur",
    referralUrl: "",
    stock: null,
    active: true,
    sortOrder: 0,
  };
}

export function ManageClient({ messages }: { messages: ShopMessages }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [page, setPage] = useState<ShopPage>("filament");
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [draft, setDraft] = useState<Partial<ShopProduct>>(blank("filament"));
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const data = await apiGet<{ products: ShopProduct[] }>(
      `/api/v1/shop/admin/products?page=${page}`,
    );
    setProducts(data.products);
    const orderData = await apiGet<{ orders: Order[] }>("/api/v1/shop/admin/orders");
    setOrders(orderData.orders);
  }

  useEffect(() => {
    apiGet<{ authenticated: boolean }>("/api/v1/shop/admin/session")
      .then((r) => {
        setAuthenticated(r.authenticated);
        if (r.authenticated) void load();
      })
      .catch(() => setAuthenticated(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDraft(blank(page));
    if (authenticated) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, authenticated]);

  async function login() {
    setError("");
    try {
      await apiPost("/api/v1/shop/admin/login", { password });
      setAuthenticated(true);
      setPassword("");
    } catch {
      setError("Login failed");
    }
  }

  async function logout() {
    await apiPost("/api/v1/shop/admin/logout", {});
    setAuthenticated(false);
  }

  async function save() {
    setError("");
    try {
      await apiPost("/api/v1/shop/admin/products", {
        uuid: draft.uuid,
        page,
        title: draft.title ?? "",
        description: draft.description ?? "",
        priceCents: Number(draft.priceCents ?? 0),
        currency: "eur",
        referralUrl: page === "prints" ? null : draft.referralUrl,
        stock: null,
        active: draft.active ?? true,
        sortOrder: Number(draft.sortOrder ?? 0),
      });
      setDraft(blank(page));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function remove(product: ShopProduct) {
    await apiFetch(`/api/v1/shop/admin/products/${product.uuid}`, { method: "DELETE" });
    await load();
  }

  async function upload(product: ShopProduct, file: File) {
    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? "");
        resolve(result.includes(",") ? result.split(",")[1] ?? "" : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    await apiPost("/api/v1/shop/admin/media", {
      productUuid: product.uuid,
      mimeType: file.type,
      dataBase64,
      alt: product.title,
    });
    await load();
  }

  if (!authenticated) {
    return (
      <div className="shop-admin-login">
        <label>
          {messages.adminPassword}
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p className="banner-warn">{error}</p> : null}
        <button className="button" type="button" onClick={login}>
          {messages.adminLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      <button className="linkish" type="button" onClick={logout}>
        {messages.adminLogout}
      </button>
      <div className="shop-admin-tabs">
        {pages.map((p) => (
          <button
            className={p === page ? "button" : "button button-muted"}
            key={p}
            type="button"
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <section className="shop-admin-editor">
        <h2>{draft.uuid ? messages.save : messages.newProduct}</h2>
        <label>
          {messages.title}
          <input
            value={draft.title ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </label>
        <label>
          {messages.description}
          <textarea
            value={draft.description ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
        </label>
        <label>
          {messages.price} (cent)
          <input
            type="number"
            value={draft.priceCents ?? 0}
            onChange={(e) =>
              setDraft((d) => ({ ...d, priceCents: Number(e.target.value) }))
            }
          />
        </label>
        {page !== "prints" ? (
          <label>
            {messages.referralUrl}
            <input
              value={draft.referralUrl ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, referralUrl: e.target.value }))}
            />
          </label>
        ) : null}
        <label className="checkbox-row">
          <input
            checked={draft.active ?? true}
            type="checkbox"
            onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
          />
          {messages.active}
        </label>
        {error ? <p className="banner-warn">{error}</p> : null}
        <button className="button" type="button" onClick={save}>
          {messages.save}
        </button>
      </section>

      <section>
        <h2>{messages.adminProducts}</h2>
        <div className="shop-admin-list">
          {products.map((product) => (
            <article className="shop-admin-product" key={product.uuid}>
              <strong>{product.title}</strong>
              <span>{formatShopPrice(product.priceCents, product.currency)}</span>
              <span>{product.active ? messages.active : "inactive"}</span>
              <button type="button" onClick={() => setDraft(product)}>
                {messages.save}
              </button>
              <label className="button button-muted">
                {messages.uploadImage}
                <input
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void upload(product, file);
                  }}
                />
              </label>
              <button type="button" onClick={() => remove(product)}>
                {messages.delete}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>{messages.adminOrders}</h2>
        <div className="shop-admin-list">
          {orders.map((order) => (
            <article className="shop-admin-product" key={order.uuid}>
              <strong>{order.status}</strong>
              <span>{order.email}</span>
              <span>{formatShopPrice(order.amountCents, order.currency)}</span>
              <small>{order.items.map((i) => `${i.quantity}x ${i.title}`).join(", ")}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
