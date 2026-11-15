"use client";

import { MAX_QUANTITY } from "@/lib/cart";
import { MinusIcon, PlusIcon } from "./icons";

export function Quantity({
  value,
  onChange,
  min = 1,
  label,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  label: string;
  size?: "sm" | "md";
}) {
  const button =
    "grid place-items-center rounded-full border border-line text-chalk hover:border-chalk disabled:opacity-35 disabled:hover:border-line " +
    (size === "sm" ? "size-8" : "size-11 text-xl");
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="One fewer">
        <MinusIcon />
      </button>
      <span className="min-w-7 text-center font-condensed text-xl font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="One more"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
