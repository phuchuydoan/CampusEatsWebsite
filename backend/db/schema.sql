-- Campus Eats schema. All money is stored as integer cents.
-- Safe to run repeatedly: every statement is CREATE ... IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(64)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  blurb       VARCHAR(255) NULL,
  note        VARCHAR(255) NULL,            -- board footnote, e.g. "Served with toast"
  image       VARCHAR(255) NULL,
  accent      ENUM('red', 'green', 'blue') NOT NULL DEFAULT 'red',
  sort_order  INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bread formats (Roll / Wrap / Hero / Panini) priced once per category.
-- An item in such a category costs size price + items.surcharge_cents.
CREATE TABLE IF NOT EXISTS category_sizes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(50)  NOT NULL,
  price_cents  INT UNSIGNED NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_sizes_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS items (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id      INT UNSIGNED NOT NULL,
  code             VARCHAR(8)   NULL,       -- board code: C1, H14, F2 ...
  name             VARCHAR(120) NOT NULL,
  description      VARCHAR(255) NULL,
  base_price_cents INT UNSIGNED NULL,       -- NULL when priced by category sizes or item variants
  surcharge_cents  INT UNSIGNED NOT NULL DEFAULT 0,
  dietary          ENUM('none', 'vegetarian', 'vegan') NOT NULL DEFAULT 'none',
  is_featured      TINYINT(1) NOT NULL DEFAULT 0,
  is_available     TINYINT(1) NOT NULL DEFAULT 1,
  sort_order       INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_items_category_code (category_id, code),
  CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Item-specific priced choices ("with Meat", muffin flavors, bagel spreads).
CREATE TABLE IF NOT EXISTS item_variants (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id      INT UNSIGNED NOT NULL,
  name         VARCHAR(100) NOT NULL,
  price_cents  INT UNSIGNED NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_variants_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add-ons belong to a category (breakfast, omelettes, smashburgers).
CREATE TABLE IF NOT EXISTS addons (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id  INT UNSIGNED NOT NULL,
  name         VARCHAR(100) NOT NULL,
  price_cents  INT UNSIGNED NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_addons_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(12)  NOT NULL UNIQUE,   -- public pickup code, e.g. CE-7K3QF9
  customer_name   VARCHAR(100) NOT NULL,
  customer_phone  VARCHAR(30)  NOT NULL,
  customer_email  VARCHAR(190) NULL,
  notes           VARCHAR(500) NULL,
  status          ENUM('received', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'received',
  subtotal_cents  INT UNSIGNED NOT NULL,
  tax_cents       INT UNSIGNED NOT NULL DEFAULT 0,
  total_cents     INT UNSIGNED NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_orders_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order lines copy the name and price at the time of purchase, so later menu
-- edits (or a reseed) never change what a past order says.
CREATE TABLE IF NOT EXISTS order_items (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id          INT UNSIGNED NOT NULL,
  item_id           INT UNSIGNED NULL,
  item_code         VARCHAR(8)   NULL,
  item_name         VARCHAR(120) NOT NULL,
  category_name     VARCHAR(100) NOT NULL,       -- several items share a name ("Veggie" omelette vs burger)
  option_name       VARCHAR(100) NULL,
  unit_price_cents  INT UNSIGNED NOT NULL,        -- option price + add-ons, for one unit
  quantity          INT UNSIGNED NOT NULL,
  line_total_cents  INT UNSIGNED NOT NULL,
  notes             VARCHAR(255) NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_item_addons (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_item_id  INT UNSIGNED NOT NULL,
  addon_name     VARCHAR(100) NOT NULL,
  price_cents    INT UNSIGNED NOT NULL,
  CONSTRAINT fk_order_item_addons_line FOREIGN KEY (order_item_id) REFERENCES order_items (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
