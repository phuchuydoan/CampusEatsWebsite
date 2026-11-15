"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, placeOrder } from "@/lib/api";
import { cartSubtotal, clearCart, useCart } from "@/lib/cart";
import { formatCents } from "@/lib/format";
import { useHydrated } from "@/lib/store";
import { LineText } from "./LineText";

type Field = "name" | "phone" | "email";

const input =
  "mt-1.5 h-12 w-full rounded-xl border border-line bg-board px-4 placeholder:text-muted/70 aria-invalid:border-brand-soft";

export function CheckoutForm({ taxRate }: { taxRate: number }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCart();
  const [pending, setPending] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});

  // A field's message goes away as soon as the customer starts fixing it.
  const clearError = (field: Field) => () =>
    setFieldErrors((errors) => (errors[field] ? { ...errors, [field]: undefined } : errors));

  const subtotal = cartSubtotal(lines);
  // Mirrors the API's rounding; the API's figure is the one that counts.
  const tax = Math.round(subtotal * taxRate);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();

    setPending(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const { order } = await placeOrder({
        customer: { name: text("name"), phone: text("phone"), email: text("email") },
        notes: text("notes"),
        items: lines.map((line) => ({
          itemId: line.itemId,
          optionKey: line.optionKey,
          addonIds: line.addons.map((a) => a.id),
          quantity: line.quantity,
          notes: line.notes,
        })),
      });
      // Keep the summary on screen until the tracking page takes over.
      setPlaced(true);
      router.push(`/orders/${order.code}`);
      clearCart();
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError(0, "Something went wrong. Please try again.");
      const fields: Partial<Record<Field, string>> = {};
      for (const issue of error.details) {
        const field = issue.path.replace("customer.", "") as Field;
        if (["name", "phone", "email"].includes(field)) fields[field] = issue.message;
      }
      setFieldErrors(fields);
      setFormError(Object.keys(fields).length > 0 ? "Check the highlighted fields and try again." : error.message);
      setPending(false);
    }
  }

  if (!hydrated) {
    return <div className="mt-8 h-96 animate-pulse rounded-2xl bg-panel" aria-busy="true" />;
  }

  if (lines.length === 0 && !placed) {
    return (
      <div className="py-20 text-center">
        <p className="font-condensed text-3xl font-semibold">Your order is empty</p>
        <p className="mt-2 text-muted">Add something from the menu before checking out.</p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-full bg-brand px-7 py-3 font-condensed text-xl font-semibold tracking-wide text-white uppercase hover:bg-brand-deep"
        >
          See the menu
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-5">
        <h2 className="font-condensed text-2xl font-semibold tracking-wide uppercase">Who’s picking up?</h2>
        <div>
          <label htmlFor="name" className="font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            onChange={clearError("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className={input}
          />
          {fieldErrors.name && (
            <p id="name-error" className="mt-1 text-sm text-brand-soft">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="font-medium">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            maxLength={30}
            autoComplete="tel"
            onChange={clearError("phone")}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "phone-error" : "phone-hint"}
            className={input}
          />
          {fieldErrors.phone ? (
            <p id="phone-error" className="mt-1 text-sm text-brand-soft">
              {fieldErrors.phone}
            </p>
          ) : (
            <p id="phone-hint" className="mt-1 text-sm text-muted">
              Only used if there’s a question about your order.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="font-medium">
            Email <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={190}
            autoComplete="email"
            onChange={clearError("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={input}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-sm text-brand-soft">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="notes" className="font-medium">
            Note for the kitchen <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={500}
            className={`${input} h-auto py-3`}
          />
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-panel p-5 lg:sticky lg:top-24">
        <h2 className="font-condensed text-2xl font-semibold tracking-wide uppercase">Your order</h2>
        <ul className="mt-2">
          {lines.map((line) => (
            <li key={line.key} className="flex items-start justify-between gap-3 border-b border-dotted border-brand/50 py-3">
              <LineText
                category={line.category}
                code={line.code}
                name={line.name}
                quantity={line.quantity}
                details={[line.optionLabel, ...line.addons.map((a) => a.name)]}
                notes={line.notes}
              />
              <p className="shrink-0 font-condensed text-lg font-semibold tabular-nums">
                {formatCents(line.unitPriceCents * line.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1">
          {tax > 0 && (
            <>
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatCents(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Tax</dt>
                <dd className="tabular-nums">{formatCents(tax)}</dd>
              </div>
            </>
          )}
          <div className="flex items-baseline justify-between">
            <dt className="font-condensed text-xl font-semibold tracking-wide uppercase">Total</dt>
            <dd className="font-condensed text-3xl font-bold tabular-nums">{formatCents(subtotal + tax)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={pending}
          className="mt-5 h-14 w-full rounded-full bg-brand font-condensed text-xl font-semibold tracking-wide text-white uppercase hover:bg-brand-deep disabled:opacity-60"
        >
          {pending ? "Placing your order…" : "Place order"}
        </button>
        {formError && (
          <p role="alert" className="mt-3 rounded-xl border border-brand-soft/60 bg-brand/10 px-4 py-3 text-sm">
            {formError}
          </p>
        )}
        <p className="mt-3 text-center text-sm text-muted">No payment now. Pay at the counter when you pick up.</p>
      </aside>
    </form>
  );
}
