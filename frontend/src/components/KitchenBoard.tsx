"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError, fetchKitchenOrders, updateOrderStatus } from "@/lib/api";
import { formatCents, formatTime } from "@/lib/format";
import { createStore, useHydrated, useStore } from "@/lib/store";
import type { KitchenOrder, OrderStatus } from "@/lib/types";
import { LineText } from "./LineText";

// The passcode is kept for the browser tab only, never in the page source.
const passcode = createStore<string | null>(null, { key: "campus-eats-kitchen", storage: "session" });

const COLUMNS: { status: OrderStatus; title: string; next: OrderStatus; action: string }[] = [
  { status: "received", title: "New", next: "preparing", action: "Start making" },
  { status: "preparing", title: "Being made", next: "ready", action: "Mark ready" },
  { status: "ready", title: "Ready for pickup", next: "completed", action: "Picked up" },
];

const POLL_MS = 8_000;

export function KitchenBoard() {
  const hydrated = useHydrated();
  const token = useStore(passcode);
  const [orders, setOrders] = useState<KitchenOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const { orders: latest } = await fetchKitchenOrders(token);
      setOrders(latest);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        passcode.set(null);
        setOrders(null);
        setError("That passcode isn’t right.");
      } else {
        setError(err instanceof Error ? err.message : "Couldn’t load orders.");
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const first = setTimeout(refresh, 0);
    const timer = setInterval(refresh, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [token, refresh]);

  async function move(order: KitchenOrder, status: OrderStatus) {
    if (!token) return;
    try {
      await updateOrderStatus(token, order.code, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t update that order.");
    }
    await refresh();
  }

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("passcode") ?? "").trim();
    if (value) {
      setError(null);
      passcode.set(value);
    }
  }

  if (!hydrated) return null;

  if (!token) {
    return (
      <form onSubmit={signIn} className="mt-8 max-w-sm">
        <label htmlFor="passcode" className="font-medium">
          Kitchen passcode
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 h-12 w-full rounded-xl border border-line bg-board px-4"
        />
        {error && (
          <p role="alert" className="mt-2 text-sm text-brand-soft">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="mt-4 h-12 rounded-full bg-brand px-7 font-condensed text-xl font-semibold tracking-wide text-white uppercase hover:bg-brand-deep"
        >
          Open the board
        </button>
      </form>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted" role="status">
          {error ?? (orders ? `${orders.length} open ${orders.length === 1 ? "order" : "orders"} · refreshes automatically` : "Loading orders…")}
        </p>
        <button
          type="button"
          onClick={() => {
            passcode.set(null);
            setOrders(null);
          }}
          className="text-sm text-muted underline underline-offset-4 hover:text-chalk"
        >
          Lock
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnOrders = (orders ?? []).filter((o) => o.status === column.status);
          return (
            <section key={column.status} className="rounded-2xl border border-line bg-panel p-4">
              <h2 className="flex items-baseline justify-between font-condensed text-2xl font-semibold tracking-wide uppercase">
                {column.title}
                <span className="text-muted tabular-nums">{columnOrders.length}</span>
              </h2>
              {columnOrders.length === 0 ? (
                <p className="py-8 text-center text-muted">Nothing here.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {columnOrders.map((order) => (
                    <li key={order.code} className="rounded-xl border border-line bg-board p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-condensed text-2xl font-bold tracking-wider">{order.code}</p>
                        <p className="text-sm text-muted">
                          {formatTime(order.createdAt)} · {formatCents(order.totalCents)}
                        </p>
                      </div>
                      <p className="text-tan">
                        {order.customerName} · {order.customerPhone}
                      </p>
                      <ul className="mt-3 space-y-2 border-t border-dotted border-line pt-3">
                        {order.items.map((line, i) => (
                          <li key={i}>
                            <LineText
                              category={line.categoryName}
                              code={line.code}
                              name={line.name}
                              quantity={line.quantity}
                              details={[line.optionName, ...line.addons.map((a) => a.name)]}
                              notes={line.notes}
                              loudNotes
                            />
                          </li>
                        ))}
                      </ul>
                      {order.notes && <p className="mt-3 text-sm font-medium text-brand-soft">Order note: {order.notes}</p>}
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => move(order, column.next)}
                          className="h-11 flex-1 rounded-full bg-brand font-condensed text-lg font-semibold tracking-wide text-white uppercase hover:bg-brand-deep"
                        >
                          {column.action}
                        </button>
                        <CancelButton onConfirm={() => move(order, "cancelled")} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// Cancelling takes two taps so a slip doesn't drop someone's lunch.
function CancelButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      onBlur={() => setArmed(false)}
      className={`h-11 rounded-full border px-4 text-sm font-semibold ${
        armed ? "border-brand-soft text-brand-soft" : "border-line text-muted hover:text-chalk"
      }`}
    >
      {armed ? "Tap again to cancel" : "Cancel"}
    </button>
  );
}
