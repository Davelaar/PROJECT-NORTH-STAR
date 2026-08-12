export type ShopPage = "filament" | "hardware" | "prints";

export type ShopImage = {
  uuid: string;
  url: string;
  alt: string;
  sortOrder: number;
};

export type ShopProduct = {
  uuid: string;
  page: ShopPage;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  referralUrl?: string | null;
  stock?: number | null;
  active: boolean;
  sortOrder: number;
  images: ShopImage[];
};

export type ShopMessages = {
  nav: string;
  manage: string;
  hubTitle: string;
  hubLead: string;
  filamentTitle: string;
  filamentLead: string;
  hardwareTitle: string;
  hardwareLead: string;
  printsTitle: string;
  printsLead: string;
  cartTitle: string;
  cartLead: string;
  retentionNotice: string;
  shippingNotice: string;
  shippingCountry: string;
  partnerLink: string;
  buyExternal: string;
  addToCart: string;
  soldOut: string;
  empty: string;
  cartEmpty: string;
  quantity: string;
  remove: string;
  total: string;
  email: string;
  checkout: string;
  checkoutError: string;
  successTitle: string;
  successPending: string;
  successPaid: string;
  successFailed: string;
  adminTitle: string;
  adminPassword: string;
  adminLogin: string;
  adminLogout: string;
  adminProducts: string;
  adminOrders: string;
  title: string;
  description: string;
  price: string;
  referralUrl: string;
  stock: string;
  active: string;
  save: string;
  newProduct: string;
  uploadImage: string;
  delete: string;
};

export function formatShopPrice(cents: number, currency = "eur") {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
