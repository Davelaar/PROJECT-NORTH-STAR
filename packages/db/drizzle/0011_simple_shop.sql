CREATE TABLE `shop_products` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `uuid` text NOT NULL,
  `page` text NOT NULL,
  `title` text NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `price_cents` integer DEFAULT 0 NOT NULL,
  `currency` text DEFAULT 'eur' NOT NULL,
  `referral_url` text,
  `stock` integer,
  `active` integer DEFAULT true NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE UNIQUE INDEX `shop_products_uuid_unique` ON `shop_products` (`uuid`);
CREATE INDEX `shop_products_page_idx` ON `shop_products` (`page`);
CREATE INDEX `shop_products_active_idx` ON `shop_products` (`active`);

CREATE TABLE `shop_product_images` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `uuid` text NOT NULL,
  `product_id` integer NOT NULL,
  `storage_path` text NOT NULL,
  `mime_type` text NOT NULL,
  `alt` text DEFAULT '' NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `shop_products`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX `shop_product_images_uuid_unique` ON `shop_product_images` (`uuid`);
CREATE INDEX `shop_images_product_idx` ON `shop_product_images` (`product_id`);
CREATE INDEX `shop_images_uuid_idx` ON `shop_product_images` (`uuid`);

CREATE TABLE `shop_orders` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `uuid` text NOT NULL,
  `email` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `provider` text DEFAULT 'stripe' NOT NULL,
  `provider_checkout_id` text,
  `provider_payment_id` text,
  `provider_customer_id` text,
  `provider_receipt_url` text,
  `amount_cents` integer NOT NULL,
  `currency` text DEFAULT 'eur' NOT NULL,
  `shipping_json` text,
  `checkout_token` text NOT NULL,
  `raw_provider_status` text,
  `paid_at` text,
  `expires_at` text NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
CREATE UNIQUE INDEX `shop_orders_uuid_unique` ON `shop_orders` (`uuid`);
CREATE UNIQUE INDEX `shop_orders_checkout_token_unique` ON `shop_orders` (`checkout_token`);
CREATE UNIQUE INDEX `shop_orders_checkout_unique` ON `shop_orders` (`provider_checkout_id`);
CREATE UNIQUE INDEX `shop_orders_payment_id_unique` ON `shop_orders` (`provider_payment_id`);
CREATE INDEX `shop_orders_status_idx` ON `shop_orders` (`status`);
CREATE INDEX `shop_orders_expires_idx` ON `shop_orders` (`expires_at`);

CREATE TABLE `shop_order_items` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `order_id` integer NOT NULL,
  `product_uuid` text NOT NULL,
  `title` text NOT NULL,
  `unit_amount_cents` integer NOT NULL,
  `quantity` integer NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `shop_orders`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `shop_order_items_order_idx` ON `shop_order_items` (`order_id`);
