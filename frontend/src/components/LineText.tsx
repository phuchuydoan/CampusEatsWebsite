// One ordered item as text: category, name, chosen option and add-ons, notes.
// The category is always shown because several items share a name
// ("Veggie" is both an omelette and a smashburger).
export function LineText({
  category,
  code,
  name,
  quantity,
  details,
  notes,
  loudNotes = false,
}: {
  category: string;
  code: string | null;
  name: string;
  quantity?: number;
  details: (string | null)[];
  notes?: string | null;
  loudNotes?: boolean;
}) {
  const detailText = details.filter(Boolean).join(" · ");
  return (
    <div className="min-w-0">
      <p className="text-xs tracking-wide text-muted uppercase">{category}</p>
      <p className="font-condensed text-xl leading-tight font-semibold">
        {quantity ? `${quantity} × ` : ""}
        {code ? `${code}. ` : ""}
        {name}
      </p>
      {detailText && <p className="text-sm text-tan">{detailText}</p>}
      {notes && (
        <p className={`text-sm ${loudNotes ? "font-medium text-brand-soft" : "text-muted"}`}>“{notes}”</p>
      )}
    </div>
  );
}
