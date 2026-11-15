"use client";

import { useEffect, useRef, useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatCents, formatExtra } from "@/lib/format";
import type { Category, MenuItem } from "@/lib/types";
import { DietBadge } from "./DietBadge";
import { CheckIcon, CloseIcon } from "./icons";
import { Quantity } from "./Quantity";

// The sheet where a customer picks bread or a variant, add-ons, quantity and
// notes for one item. Mount it with a `key` so each item starts fresh.
export function ItemDialog({
  item,
  category,
  onClose,
}: {
  item: MenuItem;
  category: Category;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [optionKey, setOptionKey] = useState(item.options[0].key);
  const [addonIds, setAddonIds] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const option = item.options.find((o) => o.key === optionKey) ?? item.options[0];
  const addons = category.addons.filter((a) => addonIds.includes(a.id));
  const unitPriceCents = option.priceCents + addons.reduce((sum, a) => sum + a.priceCents, 0);
  const pricedBySize = option.key.startsWith("s");

  function toggleAddon(id: number) {
    setAddonIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function add() {
    addToCart({
      itemId: item.id,
      code: item.code,
      name: item.name,
      category: category.name,
      optionKey: option.key,
      optionLabel: option.label,
      addons,
      unitPriceCents,
      quantity,
      notes: notes.trim(),
    });
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      data-accent={category.accent}
      className="sheet border border-line bg-panel text-chalk"
      aria-labelledby="item-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 pt-5 pb-4">
        <div>
          <p className="text-sm tracking-wide text-muted uppercase">{category.name}</p>
          <h2 id="item-title" className="mt-0.5 font-condensed text-3xl leading-tight font-bold">
            {item.code ? `${item.code}. ` : ""}
            {item.name}
          </h2>
          {item.description && <p className="mt-1 text-tan">{item.description}</p>}
          {(item.dietary !== "none" || category.note) && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <DietBadge dietary={item.dietary} />
              {category.note}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close"
          className="grid size-10 shrink-0 place-items-center rounded-full text-xl hover:bg-panel-2"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {item.options.length > 1 && (
          <fieldset>
            <legend className="font-condensed text-lg font-semibold tracking-wide uppercase">
              {pricedBySize ? "Choose your bread" : "Choose one"}
            </legend>
            <div className={`mt-2 grid gap-2 ${pricedBySize ? "grid-cols-2" : "grid-cols-1"}`}>
              {item.options.map((o) => (
                <label
                  key={o.key}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 has-checked:border-(--accent) has-checked:bg-panel-2 has-focus-visible:outline-2 has-focus-visible:outline-chalk"
                >
                  <input
                    type="radio"
                    name="option"
                    className="sr-only"
                    checked={o.key === optionKey}
                    onChange={() => setOptionKey(o.key)}
                  />
                  <span className="font-medium">{o.label}</span>
                  <span className="font-condensed text-lg font-semibold tabular-nums">{formatCents(o.priceCents)}</span>
                </label>
              ))}
            </div>
            {item.surchargeCents > 0 && (
              <p className="mt-2 text-sm text-muted">
                Prices include this sandwich’s {formatExtra(item.surchargeCents)} extra.
              </p>
            )}
          </fieldset>
        )}

        {category.addons.length > 0 && (
          <fieldset>
            <legend className="font-condensed text-lg font-semibold tracking-wide uppercase">Add-ons</legend>
            <div className={`mt-2 grid gap-x-4 ${category.addons.length > 3 ? "sm:grid-cols-2" : ""}`}>
              {category.addons.map((a) => (
                <label key={a.id} className="flex cursor-pointer items-center gap-3 border-b border-dotted border-line py-2.5">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={addonIds.includes(a.id)}
                    onChange={() => toggleAddon(a.id)}
                  />
                  <span className="grid size-6 shrink-0 place-items-center rounded-md border border-muted text-transparent peer-checked:border-(--accent) peer-checked:bg-(--accent) peer-checked:text-black peer-focus-visible:outline-2 peer-focus-visible:outline-chalk">
                    <CheckIcon />
                  </span>
                  <span className="flex-1">{a.name}</span>
                  <span className="text-tan tabular-nums">{formatExtra(a.priceCents)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <label htmlFor="item-notes" className="font-condensed text-lg font-semibold tracking-wide uppercase">
            Special instructions
          </label>
          <input
            id="item-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={255}
            placeholder="No onions, extra toasted…"
            className="mt-2 w-full rounded-xl border border-line bg-board px-4 py-3 placeholder:text-muted/70"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center justify-between">
          <span className="font-condensed text-lg font-semibold tracking-wide uppercase sm:hidden">Quantity</span>
          <Quantity label="Quantity" value={quantity} onChange={setQuantity} />
        </div>
        <button
          type="button"
          onClick={add}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 sm:flex-1 font-condensed text-xl font-semibold tracking-wide whitespace-nowrap text-white uppercase hover:bg-brand-deep"
        >
          Add to order
          <span className="tabular-nums">· {formatCents(unitPriceCents * quantity)}</span>
        </button>
      </div>
    </dialog>
  );
}
