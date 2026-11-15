// Shown when the API cannot be reached while rendering a page on the server.
export function MenuUnavailable() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="font-condensed text-3xl font-semibold">The menu isn’t loading right now</p>
      <p className="mt-2 text-muted">
        We couldn’t reach the kitchen’s system. Give it a moment and reload the page.
      </p>
    </div>
  );
}
