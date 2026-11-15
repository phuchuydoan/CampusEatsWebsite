import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderTracker } from "@/components/OrderTracker";

export const metadata: Metadata = { title: "Your order" };

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6">
      {/* The tracker reads the order code from the URL, which is only known per request. */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-panel" aria-busy="true" />}>
        <OrderTracker />
      </Suspense>
    </div>
  );
}
