import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Logo size={72} />
          <p className="text-muted">Order ahead. Pick up and pay at the counter.</p>
        </div>
        <nav className="flex gap-6 font-condensed text-lg font-semibold tracking-wide uppercase">
          <Link href="/menu" className="hover:text-brand-soft">
            Menu
          </Link>
          <Link href="/kitchen" className="text-muted hover:text-chalk">
            Kitchen staff
          </Link>
        </nav>
      </div>
    </footer>
  );
}
