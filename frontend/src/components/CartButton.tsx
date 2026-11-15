"use client";

import { cartCount, openCart, useCart } from "@/lib/cart";
import { BagIcon } from "./icons";

export function CartButton() {
  const count = cartCount(useCart());
  return (
    <button
      type="button"
      onClick={openCart}
      className="flex h-11 items-center gap-2 rounded-full bg-brand px-4 font-condensed text-lg font-semibold tracking-wide text-white uppercase hover:bg-brand-deep"
    >
      <BagIcon className="text-xl" />
      <span>Order</span>
      {count > 0 && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-1.5 text-base leading-none text-brand-deep">
          {count}
          <span className="sr-only"> items</span>
        </span>
      )}
    </button>
  );
}
