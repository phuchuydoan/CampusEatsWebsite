import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="board-title text-4xl">Not on the board</h1>
      <p className="mt-4 text-lg text-tan">That page doesn’t exist. The menu does.</p>
      <Link
        href="/menu"
        className="mt-8 inline-block rounded-full bg-brand px-7 py-3 font-condensed text-xl font-semibold tracking-wide text-white uppercase hover:bg-brand-deep"
      >
        See the menu
      </Link>
    </div>
  );
}
