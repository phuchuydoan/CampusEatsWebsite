"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, fetchOrder } from "@/lib/api";
import { formatCents, formatTime } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { CheckIcon } from "./icons";
import { LineText } from "./LineText";

const STEPS: { status: OrderStatus; label: string; detail: string }[] = [
  { status: "received", label: "Order received", detail: "The kitchen has your order." },
  { status: "preparing", label: "Being made", detail: "The kitchen is making your order." },
  { status: "ready", label: "Ready for pickup", detail: "Head to the counter and give your code." },
  { status: "completed", label: "Picked up", detail: "Enjoy!" },
];

const POLL_MS = 10_000;

type State = { phase: "loading" } | { phase: "missing" } | { phase: "error"; message: string } | { phase: "ready"; order: Order };

export function OrderTracker() {
  const { code } = useParams<{ code: string }>();
  const [state, setState] = useState<State>({ phase: "loading" });

  // Poll while the order is still moving through the kitchen.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const { order } = await fetchOrder(code);
        if (cancelled) return;
        setState({ phase: "ready", order });
        if (order.status !== "completed" && order.status !== "cancelled") timer = setTimeout(load, POLL_MS);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setState({ phase: "missing" });
          return;
        }
        // Keep showing the last known order through a brief outage.
        setState((current) =>
          current.phase === "ready"
            ? current
            : { phase: "error", message: err instanceof Error ? err.message : "Something went wrong." },
        );
        timer = setTimeout(load, POLL_MS);
      }
    }

    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  if (state.phase === "loading") {
    return <div className="h-96 animate-pulse rounded-2xl bg-panel" aria-busy="true" />;
  }

  if (state.phase === "missing" || state.phase === "error") {
    return (
      <div className="py-16 text-center">
        <p className="font-condensed text-3xl font-semibold">
          {state.phase === "missing" ? "We can’t find that order" : "Your order isn’t loading"}
        </p>
        <p className="mt-2 text-muted">
          {state.phase === "missing"
            ? "Check the pickup code in the link and try again."
            : `${state.message} We’ll keep trying.`}
        </p>
        <Link href="/menu" className="mt-6 inline-block underline underline-offset-4 hover:text-brand-soft">
          Back to the menu
        </Link>
      </div>
    );
  }

  const { order } = state;
  const cancelled = order.status === "cancelled";
  const currentIndex = STEPS.findIndex((step) => step.status === order.status);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-panel p-6 text-center">
        <p className="text-muted">Thanks, {order.customerName}. Your pickup code is</p>
        <p className="mt-1 font-condensed text-6xl font-bold tracking-widest">{order.code}</p>
        <p className="mt-2 text-tan">
          Placed at {formatTime(order.createdAt)} · Pay {formatCents(order.totalCents)} at the counter
        </p>
      </div>

      {cancelled ? (
        <p role="status" className="mt-6 rounded-2xl border border-brand-soft/60 bg-brand/10 p-5 text-center text-lg">
          This order was cancelled. Ask at the counter if that’s unexpected.
        </p>
      ) : (
        <ol className="mt-8" aria-label="Order progress">
          {STEPS.map((step, i) => {
            const done = i < currentIndex || order.status === "completed";
            const current = i === currentIndex && !done;
            return (
              <li key={step.status} className="relative flex gap-4 pb-7 last:pb-0" aria-current={current ? "step" : undefined}>
                {i < STEPS.length - 1 && (
                  <span className={`absolute top-9 bottom-0 left-[1.0625rem] w-0.5 ${done ? "bg-veg" : "bg-line"}`} />
                )}
                <span
                  className={`relative grid size-9 shrink-0 place-items-center rounded-full border-2 text-lg ${
                    done
                      ? "border-veg bg-veg text-black"
                      : current
                        ? "border-brand-soft bg-brand text-white"
                        : "border-line text-muted"
                  }`}
                >
                  {done ? <CheckIcon /> : <span className="font-condensed font-semibold">{i + 1}</span>}
                </span>
                <span className={done || current ? "" : "text-muted"}>
                  <span className="block font-condensed text-2xl leading-9 font-semibold">{step.label}</span>
                  {current && <span className="block text-tan">{step.detail}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      <p className="sr-only" role="status">
        Order status: {order.status}
      </p>

      <h2 className="mt-10 border-y-2 border-brand py-3 text-center board-title text-xl">Order summary</h2>
      <ul>
        {order.items.map((line, i) => (
          <li key={i} className="flex items-start justify-between gap-3 border-b border-dotted border-brand/50 py-3">
            <LineText
              category={line.categoryName}
              code={line.code}
              name={line.name}
              quantity={line.quantity}
              details={[line.optionName, ...line.addons.map((a) => a.name)]}
              notes={line.notes}
            />
            <p className="font-condensed text-xl font-semibold tabular-nums">{formatCents(line.lineTotalCents)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1">
        {order.taxCents > 0 && (
          <>
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatCents(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Tax</dt>
              <dd className="tabular-nums">{formatCents(order.taxCents)}</dd>
            </div>
          </>
        )}
        <div className="flex items-baseline justify-between">
          <dt className="font-condensed text-xl font-semibold tracking-wide uppercase">Total</dt>
          <dd className="font-condensed text-3xl font-bold tabular-nums">{formatCents(order.totalCents)}</dd>
        </div>
      </dl>
      {order.notes && <p className="mt-4 text-muted">Note for the kitchen: “{order.notes}”</p>}
    </div>
  );
}
