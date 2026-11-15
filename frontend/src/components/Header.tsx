import Link from "next/link";
import { CartButton } from "./CartButton";
import { Wordmark } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-board/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Campus Eats home" className="rounded-full">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            href="/menu"
            className="rounded-full px-3 py-2 font-condensed text-lg font-semibold tracking-wide text-chalk uppercase hover:text-brand-soft"
          >
            Menu
          </Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
