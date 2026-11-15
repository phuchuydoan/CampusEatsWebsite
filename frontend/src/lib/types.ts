// Shapes returned by the Express API (backend/). All money is integer cents.

export type Dietary = "none" | "vegetarian" | "vegan";
export type Accent = "red" | "green" | "blue";

export type PricedChoice = { id: number; name: string; priceCents: number };

// `key` identifies the option when ordering: s<id> = bread size,
// v<id> = item variant, "base" = the item's single fixed price.
export type ItemOption = { key: string; label: string | null; priceCents: number };

export type MenuItem = {
  id: number;
  code: string | null;
  name: string;
  description: string | null;
  dietary: Dietary;
  featured: boolean;
  available: boolean;
  surchargeCents: number;
  fromPriceCents: number;
  options: ItemOption[];
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  blurb: string | null;
  note: string | null;
  image: string | null;
  accent: Accent;
  sizes: PricedChoice[];
  addons: PricedChoice[];
  items: MenuItem[];
};

export type Menu = { categories: Category[]; taxRate: number };

export type OrderStatus = "received" | "preparing" | "ready" | "completed" | "cancelled";

export type OrderLine = {
  code: string | null;
  name: string;
  categoryName: string;
  optionName: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  notes: string | null;
  addons: { name: string; priceCents: number }[];
};

export type Order = {
  code: string;
  customerName: string;
  notes: string | null;
  status: OrderStatus;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: OrderLine[];
};

// The kitchen endpoints also return contact details.
export type KitchenOrder = Order & { customerPhone: string; customerEmail: string | null };

export type NewOrder = {
  customer: { name: string; phone: string; email: string };
  notes: string;
  items: { itemId: number; optionKey: string; addonIds: number[]; quantity: number; notes: string }[];
};
