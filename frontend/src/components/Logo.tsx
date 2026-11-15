import { AppleIcon, BurgerIcon, PizzaIcon } from "./icons";

// The round Campus Eats mark from the menu boards. Everything inside scales
// with `size` (in pixels).
export function Logo({ size = 144, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="Campus Eats"
      style={{ width: size, height: size, fontSize: size }}
      className={`inline-grid shrink-0 place-items-center rounded-full border-2 border-chalk bg-black text-chalk ${className}`}
    >
      <span className="flex flex-col items-center leading-none" aria-hidden>
        <span className="flex gap-[0.4em] text-[0.13em]">
          <BurgerIcon />
          <AppleIcon />
          <PizzaIcon />
        </span>
        <span className="mt-[0.35em] font-logo text-[0.185em] font-semibold tracking-tight">campus</span>
        <span className="font-logo text-[0.3em] leading-[0.9] font-bold tracking-tight">eats</span>
      </span>
    </span>
  );
}

// Compact lockup for the header.
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-full border-2 border-chalk bg-black text-xl text-chalk">
        <BurgerIcon />
      </span>
      <span className="font-logo text-lg leading-none tracking-tight whitespace-nowrap text-chalk sm:text-xl">
        <span className="font-semibold">campus</span> <span className="font-bold">eats</span>
      </span>
    </span>
  );
}
