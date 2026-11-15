import type { Dietary } from "@/lib/types";
import { LeafIcon } from "./icons";

export function DietBadge({ dietary }: { dietary: Dietary }) {
  if (dietary === "none") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-veg/60 px-2 py-0.5 text-xs font-semibold tracking-wide text-veg uppercase">
      <LeafIcon />
      {dietary === "vegan" ? "Vegan" : "Vegetarian"}
    </span>
  );
}
