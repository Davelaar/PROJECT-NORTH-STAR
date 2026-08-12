import { apiGet } from "@/lib/api";
import type { ShopPage, ShopProduct } from "./types";

export async function fetchShopProducts(page: ShopPage): Promise<ShopProduct[]> {
  try {
    const data = await apiGet<{ products: ShopProduct[] }>(
      `/api/v1/shop/products?page=${page}`,
    );
    return data.products;
  } catch {
    return [];
  }
}
