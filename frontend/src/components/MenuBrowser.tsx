"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCents, formatExtra } from "@/lib/format";
import type { Category, MenuItem } from "@/lib/types";
import { BoardTitle } from "./BoardTitle";
import { DietBadge } from "./DietBadge";
import { PlusIcon, SearchIcon } from "./icons";
import { ItemDialog } from "./ItemDialog";

type Diet = "all" | "vegetarian" | "vegan";

const DIETS: { value: Diet; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
];

function matches(item: MenuItem, query: string, diet: Diet) {
  // Vegan items also count as vegetarian.
  if (diet === "vegan" && item.dietary !== "vegan") return false;
  if (diet === "vegetarian" && item.dietary === "none") return false;
  if (!query) return true;
  const haystack = `${item.code ?? ""} ${item.name} ${item.description ?? ""}`.toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

export function MenuBrowser({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<Diet>("all");
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const [selected, setSelected] = useState<{ item: MenuItem; category: Category } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((category) => ({ ...category, items: category.items.filter((item) => matches(item, q, diet)) }))
      .filter((category) => category.items.length > 0);
  }, [categories, query, diet]);

  // Filtering can remove the section that was active; fall back to the first one left.
  const current = visible.some((category) => category.slug === active) ? active : (visible[0]?.slug ?? "");

  // The menu streams in after navigation, so a #category link has to be
  // honoured once the sections exist.
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (slug) document.getElementById(slug)?.scrollIntoView();
  }, []);

  // Highlight the category currently under the sticky bar.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((e) => e.isIntersecting);
        if (entry) setActive(entry.target.id);
      },
      { rootMargin: "-130px 0px -70% 0px" },
    );
    document.querySelectorAll("section[data-category]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [visible]);

  // Keep the active chip in view without moving the page itself.
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector<HTMLElement>(`[data-chip="${current}"]`);
    if (rail && chip) {
      rail.scrollTo({ left: chip.offsetLeft - (rail.clientWidth - chip.clientWidth) / 2, behavior: "smooth" });
    }
  }, [current]);

  return (
    <>
      <div className="flex flex-col gap-3 pb-3 md:flex-row md:items-center">
        <label className="relative block md:w-72">
          <span className="sr-only">Search the menu</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the menu"
            className="h-11 w-full rounded-full border border-line bg-panel pr-4 pl-10 placeholder:text-muted"
          />
        </label>
        <div className="flex gap-1.5" role="group" aria-label="Dietary filter">
          {DIETS.map((d) => (
            <button
              key={d.value}
              type="button"
              aria-pressed={diet === d.value}
              onClick={() => setDiet(d.value)}
              className="h-11 rounded-full border border-line px-4 text-sm font-semibold tracking-wide text-muted uppercase hover:text-chalk aria-pressed:border-veg aria-pressed:text-veg first:aria-pressed:border-chalk first:aria-pressed:text-chalk"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <nav
        aria-label="Menu sections"
        className="sticky top-16 z-20 -mx-4 border-b border-line bg-board/95 backdrop-blur sm:-mx-6"
      >
        <div ref={railRef} className="relative flex gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:px-6">
          {visible.map((category) => (
            <a
              key={category.slug}
              href={`#${category.slug}`}
              data-chip={category.slug}
              aria-current={current === category.slug ? "true" : undefined}
              className="shrink-0 rounded-full px-3.5 py-2 font-condensed text-lg leading-none font-semibold tracking-wide whitespace-nowrap text-muted uppercase hover:text-chalk aria-[current]:bg-chalk aria-[current]:text-board"
            >
              {category.name.replace(" Sandwiches", "")}
            </a>
          ))}
        </div>
      </nav>

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-condensed text-3xl font-semibold">Nothing matches that</p>
          <p className="mt-2 text-muted">Try a different word, or clear the filters to see the whole menu.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDiet("all");
            }}
            className="mt-6 rounded-full border border-chalk px-6 py-2.5 font-condensed text-lg font-semibold tracking-wide uppercase hover:bg-chalk hover:text-board"
          >
            Clear filters
          </button>
        </div>
      ) : (
        visible.map((category, index) => (
          <section
            key={category.slug}
            id={category.slug}
            data-category
            data-accent={category.accent}
            className="scroll-mt-28 pt-10"
          >
            <div className="relative overflow-hidden rounded-2xl border border-line bg-panel">
              {category.image && (
                <div className="absolute inset-y-0 right-0 w-3/4 md:w-1/2">
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(min-width: 1152px) 552px, (min-width: 768px) 50vw, 75vw"
                    preload={index === 0}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-panel via-panel/60 to-transparent max-md:via-panel/80" />
                </div>
              )}
              <div className="relative flex min-h-44 flex-col justify-center px-5 py-8 sm:px-8">
                <div className="h-0.5 w-16 bg-(--accent)" />
                <BoardTitle className="mt-4 max-w-xl text-2xl sm:text-4xl">{category.name}</BoardTitle>
                {category.note && <p className="mt-2 text-tan italic">{category.note}</p>}
                {category.sizes.length > 0 && (
                  <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-1 font-condensed text-xl">
                    {category.sizes.map((size) => (
                      <div key={size.id} className="flex items-baseline gap-2">
                        <dt className="text-chalk">{size.name}</dt>
                        <dd className="font-semibold text-chalk tabular-nums">{formatCents(size.priceCents)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>

            <ul className="mt-2 grid gap-x-12 md:grid-cols-2">
              {category.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => setSelected({ item, category })}
                    className="group flex h-full w-full items-start gap-4 border-b border-dotted border-(--accent)/55 py-4 text-left disabled:opacity-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-condensed text-[1.45rem] leading-tight font-semibold text-chalk group-hover:text-(--accent-soft)">
                          {item.code ? `${item.code}. ` : ""}
                          {item.name}
                        </span>
                        {item.surchargeCents > 0 && (
                          <span className="rounded bg-brand px-1.5 font-condensed text-base leading-snug font-bold text-white">
                            {formatExtra(item.surchargeCents)}
                          </span>
                        )}
                        <DietBadge dietary={item.dietary} />
                      </span>
                      {item.description && <span className="mt-1 block text-tan">{item.description}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-right font-condensed text-xl leading-tight font-semibold tabular-nums">
                        {!item.available ? (
                          "Sold out"
                        ) : (
                          <>
                            {item.options.length > 1 && (
                              <span className="block text-sm font-medium text-muted">from</span>
                            )}
                            {formatCents(item.fromPriceCents)}
                          </>
                        )}
                      </span>
                      <span
                        aria-hidden
                        className="grid size-9 place-items-center rounded-full border border-line text-lg text-chalk group-hover:border-brand group-hover:bg-brand group-disabled:hidden"
                      >
                        <PlusIcon />
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {selected && (
        <ItemDialog
          key={selected.item.id}
          item={selected.item}
          category={selected.category}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
