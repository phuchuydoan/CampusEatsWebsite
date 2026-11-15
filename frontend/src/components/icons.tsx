import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = { width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": true } as const;
const stroke = {
  ...base,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// The three marks from the Campus Eats logo.
export function BurgerIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M3 10.5a9 6.5 0 0 1 18 0z" />
      <rect x="2.5" y="12" width="19" height="3" rx="1.5" />
      <path d="M3 16.5h18V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M12 8c-1.6-1.3-4.2-1.5-5.8.3-1.9 2.1-1.5 5.8.2 8.8C7.4 19 8.8 20.5 10.2 20.5c.8 0 1.2-.5 1.8-.5s1 .5 1.8.5c1.4 0 2.8-1.5 3.8-3.4 1.7-3 2.1-6.7.2-8.8C16.2 6.5 13.6 6.7 12 8z" />
      <path d="M12 6.5c0-2 1.3-3.6 3.3-4 0 2-1.3 3.6-3.3 4z" />
    </svg>
  );
}

export function PizzaIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" fillRule="evenodd" {...props}>
      <path d="M12 21.5 3.5 6.2a1 1 0 0 1 .4-1.3C6.3 3.6 9.1 3 12 3s5.7.6 8.1 1.9a1 1 0 0 1 .4 1.3zM9.5 8.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm5-.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm-2.3 5a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z" />
    </svg>
  );
}

// The vegetarian/vegan mark from the green board.
export function LeafIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 19c0-8 5-13 14-14 0 9-4 14-12 14" />
      <path d="M5 21c1-5 4-9 9-11" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...stroke} strokeWidth={2.5} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
