import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchShopProduct } from "../../data";
import { ProductActions } from "../../product-actions";
import type { ShopPage } from "../../types";
import { formatShopPrice } from "../../types";

const shopPages = new Set<ShopPage>(["filament", "hardware", "prints"]);

function isShopPage(value: string): value is ShopPage {
  return shopPages.has(value as ShopPage);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string; uuid: string }>;
}): Promise<Metadata> {
  const { locale, messages: m } = await getLocaleMessages();
  const { page, uuid } = await params;
  if (!isShopPage(page)) {
    return buildPageMetadata({
      title: m.shop.nav,
      description: m.shop.hubLead,
      path: "/shop",
      noIndex: true,
    });
  }
  const product = await fetchShopProduct(uuid, locale);
  if (!product || product.page !== page) {
    return buildPageMetadata({
      title: m.shop.nav,
      description: m.shop.hubLead,
      path: `/shop/${page}/${uuid}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: product.title,
    description: (product.description || m.shop.hubLead).slice(0, 160),
    path: `/shop/${page}/${uuid}`,
  });
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ page: string; uuid: string }>;
}) {
  const { locale, messages: m } = await getLocaleMessages();
  const { page, uuid } = await params;
  if (!isShopPage(page)) notFound();

  const product = await fetchShopProduct(uuid, locale);
  if (!product || product.page !== page) notFound();

  return (
    <article className="shop-product-detail">
      <div className="shop-product-gallery">
        {product.images.length > 0 ? (
          product.images.map((image) => (
            <img
              src={image.url}
              alt={image.alt || product.title}
              key={image.uuid}
              loading="lazy"
            />
          ))
        ) : (
          <div className="shop-product-image-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="shop-product-detail-body">
        <p className="muted">
          {product.page === "prints" ? "OpenFilament" : m.shop.partnerLink}
        </p>
        <h1>{product.title}</h1>
        <strong>{formatShopPrice(product.priceCents, product.currency)}</strong>
        {product.description ? (
          <div className="shop-product-description">
            {product.description.split("\n").map((line, index) =>
              line.trim() ? <p key={`${index}-${line}`}>{line}</p> : null,
            )}
          </div>
        ) : null}
        <ProductActions messages={m.shop} product={product} />
      </div>
    </article>
  );
}
