import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuBrowser } from "@/components/MenuBrowser";
import { MenuUnavailable } from "@/components/MenuUnavailable";
import { fetchMenu } from "@/lib/api";

export const metadata: Metadata = { title: "Menu" };

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="pt-10 pb-6">
        <h1 className="board-title text-4xl sm:text-5xl">The menu</h1>
        <p className="mt-3 text-lg text-tan">Tap anything to choose your bread and extras. Pay at pickup.</p>
      </div>
      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent />
      </Suspense>
    </div>
  );
}

async function MenuContent() {
  const menu = await fetchMenu().catch(() => null);
  if (!menu) return <MenuUnavailable />;
  return <MenuBrowser categories={menu.categories} />;
}

function MenuSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading the menu">
      <div className="h-24 border-b border-line" />
      <div className="mt-10 h-40 rounded-2xl bg-panel" />
      <div className="mt-4 grid gap-x-12 md:grid-cols-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-20 border-b border-dotted border-line" />
        ))}
      </div>
    </div>
  );
}
