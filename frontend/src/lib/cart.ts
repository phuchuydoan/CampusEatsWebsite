"use client";

import { createStore, useStore } from "./store";
import type { PricedChoice } from "./types";

// A cart line keeps a copy of names and prices for display. The API ignores
// these and reprices everything from the database when the order is placed.
export type CartLine = {
  key: string;
  itemId: number;
  code: string | null;
  name: string;
  category: string;
  optionKey: string;
  optionLabel: string | null;
  addons: PricedChoice[];
  unitPriceCents: number;
  quantity: number;
  notes: string;
};

export const MAX_QUANTITY = 20;

const EMPTY: CartLine[] = [];
const cart = createStore<CartLine[]>(EMPTY, { key: "campus-eats-cart-v1", storage: "local" });
const cartOpen = createStore(false);
const toast = createStore<string | null>(null);

export const useCart = () => useStore(cart);
export const useCartOpen = () => useStore(cartOpen);
export const useToast = () => useStore(toast);

export const openCart = () => cartOpen.set(true);
export const closeCart = () => cartOpen.set(false);

let toastTimer: ReturnType<typeof setTimeout> | undefined;
function showToast(message: string) {
  clearTimeout(toastTimer);
  toast.set(message);
  toastTimer = setTimeout(() => toast.set(null), 3000);
}

// Two additions merge into one line only when everything about them matches.
function lineKey(line: Omit<CartLine, "key">) {
  const addonIds = line.addons.map((a) => a.id).sort((a, b) => a - b);
  return [line.itemId, line.optionKey, addonIds.join("+"), line.notes.trim().toLowerCase()].join("|");
}

export function addToCart(line: Omit<CartLine, "key">) {
  const key = lineKey(line);
  cart.set((lines) => {
    const existing = lines.find((l) => l.key === key);
    if (!existing) return [...lines, { ...line, key }];
    const quantity = Math.min(MAX_QUANTITY, existing.quantity + line.quantity);
    return lines.map((l) => (l.key === key ? { ...l, quantity } : l));
  });
  showToast(`Added ${line.name} to your order`);
}

export function setQuantity(key: string, quantity: number) {
  cart.set((lines) =>
    quantity <= 0
      ? lines.filter((l) => l.key !== key)
      : lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) } : l)),
  );
}

export const clearCart = () => cart.set(EMPTY);

export const cartCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
