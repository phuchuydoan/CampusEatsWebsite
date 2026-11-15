const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatCents = (cents: number) => usd.format(cents / 100);

// "+$2" for whole dollars, "+$0.50" otherwise, the way the boards print extras.
export const formatExtra = (cents: number) =>
  `+$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
