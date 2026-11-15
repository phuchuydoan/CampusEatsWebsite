import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/CheckoutForm";
import { MenuUnavailable } from "@/components/MenuUnavailable";
import { fetchMenu } from "@/lib/api";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <h1 className="board-title text-4xl">Checkout</h1>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-2xl bg-panel" aria-busy="true" />}>
        <Checkout />
      </Suspense>
    </div>
  );
}

// The tax rate lives in the API's configuration, so ask for it per request.
async function Checkout() {
  const menu = await fetchMenu().catch(() => null);
  if (!menu) return <MenuUnavailable />;
  return <CheckoutForm taxRate={menu.taxRate} />;
}
