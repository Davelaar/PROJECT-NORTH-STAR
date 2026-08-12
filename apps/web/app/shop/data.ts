import { apiGet } from "@/lib/api";
import type { Locale } from "@/lib/messages";
import type { ShopPage, ShopProduct } from "./types";

const productLocales = new Set<Locale>(["en", "nl", "de", "fr"]);

export async function fetchShopProducts(
  page: ShopPage,
  locale?: Locale,
): Promise<ShopProduct[]> {
  try {
    const params = new URLSearchParams({ page });
    if (locale && productLocales.has(locale)) params.set("locale", locale);
    const data = await apiGet<{ products: ShopProduct[] }>(
      `/api/v1/shop/products?${params.toString()}`,
    );
    return data.products;
  } catch {
    return [];
  }
}

export async function fetchShopProduct(
  uuid: string,
  locale?: Locale,
): Promise<ShopProduct | null> {
  try {
    const params = new URLSearchParams();
    if (locale && productLocales.has(locale)) params.set("locale", locale);
    const qs = params.toString();
    const data = await apiGet<{ product: ShopProduct }>(
      `/api/v1/shop/products/${uuid}${qs ? `?${qs}` : ""}`,
    );
    return data.product;
  } catch {
    return null;
  }
}
