"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cartSubtotal, closeCart, openCart, setQuantity, useCart, useCartOpen, useToast } from "@/lib/cart";
import { formatCents } from "@/lib/format";
import { CloseIcon } from "./icons";
import { LineText } from "./LineText";
import { Quantity } from "./Quantity";

export function CartDrawer() {
  const lines = useCart();
  const open = useCartOpen();
  const toast = useToast();
  const ref = useRef<HTMLDialogElement>(null);

  // The native dialog owns focus trapping and Escape; mirror the store into it.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <dialog
        ref={ref}
        className="drawer border-l border-line bg-panel text-chalk"
        aria-labelledby="cart-title"
        onClose={closeCart}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeCart();
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-title" className="board-title text-xl">
            Your order
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close order"
            className="grid size-10 place-items-center rounded-full text-xl hover:bg-panel-2"
          >
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="font-condensed text-2xl font-semibold">Nothing here yet</p>
            <p className="text-muted">Pick something from the menu and it will show up here.</p>
            <Link
              href="/menu"
              onClick={closeCart}
              className="mt-2 rounded-full bg-brand px-6 py-3 font-condensed text-lg font-semibold tracking-wide text-white uppercase hover:bg-brand-deep"
            >
              See the menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.key} className="border-b border-dotted border-brand/50 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <LineText
                      category={line.category}
                      code={line.code}
                      name={line.name}
                      details={[line.optionLabel, ...line.addons.map((a) => a.name)]}
                      notes={line.notes}
                    />
                    <p className="shrink-0 font-condensed text-xl font-semibold tabular-nums">
                      {formatCents(line.unitPriceCents * line.quantity)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Quantity
                      size="sm"
                      label={`Quantity of ${line.name}`}
                      value={line.quantity}
                      onChange={(q) => setQuantity(line.key, q)}
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(line.key, 0)}
                      className="rounded px-2 py-1 text-sm text-muted underline underline-offset-2 hover:text-chalk"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-condensed text-2xl font-semibold tabular-nums">
                  {formatCents(cartSubtotal(lines))}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 block rounded-full bg-brand py-3.5 text-center font-condensed text-xl font-semibold tracking-wide text-white uppercase hover:bg-brand-deep"
              >
                Checkout
              </Link>
              <p className="mt-3 text-center text-sm text-muted">Pay at the counter when you pick up.</p>
            </div>
          </>
        )}
      </dialog>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {toast && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-line bg-panel-2 py-2 pr-2 pl-5 shadow-lg shadow-black/50">
            <span>{toast}</span>
            <button
              type="button"
              onClick={openCart}
              className="rounded-full bg-chalk px-4 py-1.5 font-condensed font-semibold tracking-wide text-board uppercase"
            >
              View order
            </button>
          </div>
        )}
      </div>
    </>
  );
}
