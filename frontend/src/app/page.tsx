import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { BoardTitle } from "@/components/BoardTitle";
import { DietBadge } from "@/components/DietBadge";
import { ArrowRightIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { MenuUnavailable } from "@/components/MenuUnavailable";
import { fetchMenu } from "@/lib/api";
import { formatCents } from "@/lib/format";

const STEPS = [
  {
    title: "Pick from the board",
    body: "Every sandwich, burger and breakfast plate from the counter menu is here.",
  },
  {
    title: "Make it yours",
    body: "Choose a roll, wrap, hero or panini, then add the extras you want.",
  },
  {
    title: "Pick up and pay",
    body: "You get a pickup code and can watch your order’s progress. Pay at the counter.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="relative aspect-3/2 md:absolute md:inset-0 md:-z-10 md:aspect-auto">
          <Image
            src="/images/hero.jpg"
            alt="A turkey and ham hero, a double smashburger and a plate of eggs with home fries"
            fill
            preload
            sizes="100vw"
            className="object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent from-55% to-board md:bg-linear-to-r md:from-board md:from-20% md:via-board/85 md:via-45% md:to-transparent" />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 md:py-28">
          <div className="relative max-w-xl">
            <Logo size={132} className="max-md:-mt-20" />
            <p className="mt-8 font-condensed text-lg font-semibold tracking-[0.2em] text-brand-soft uppercase">
              Order ahead · Pick up on campus
            </p>
            <h1 className="board-title mt-3 text-4xl sm:text-5xl">Breakfast, smashburgers &amp; fat heroes</h1>
            <p className="mt-5 max-w-md text-xl text-tan">
              Build your order from the full Campus Eats board, then pick it up and pay at the counter.
            </p>
            <Link
              href="/menu"
              className="mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-brand px-8 font-condensed text-2xl font-semibold tracking-wide text-white uppercase hover:bg-brand-deep"
            >
              Start an order
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Suspense fallback={<HomeMenuSkeleton />}>
          <HomeMenu />
        </Suspense>

        <section className="pt-20">
          <SectionHeading>How ordering works</SectionHeading>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-line bg-panel p-6">
                <span className="font-display text-5xl font-extrabold text-brand-soft">{i + 1}</span>
                <h3 className="mt-3 font-condensed text-2xl font-semibold">{step.title}</h3>
                <p className="mt-1 text-tan">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="border-y-2 border-brand py-4 text-center">
      <BoardTitle className="text-2xl sm:text-3xl">{children}</BoardTitle>
    </div>
  );
}

// Categories and featured items come from the API on every request, so a
// price or availability change shows up without a rebuild.
async function HomeMenu() {
  const menu = await fetchMenu().catch(() => null);
  if (!menu) return <MenuUnavailable />;

  const featured = menu.categories.flatMap((category) =>
    category.items.filter((item) => item.featured && item.available).map((item) => ({ item, category })),
  );

  return (
    <>
      <section className="pt-16">
        <SectionHeading>The menu</SectionHeading>
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {menu.categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/menu#${category.slug}`}
                data-accent={category.accent}
                className="group relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-2xl border border-line bg-panel p-4"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 270px, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                )}
                <span className="absolute inset-0 bg-linear-to-t from-board via-board/45 to-transparent" />
                <span className="relative font-condensed text-xl leading-tight font-bold tracking-wide uppercase sm:text-2xl">
                  {category.name}
                </span>
                <span className="relative mt-1 text-sm text-tan">
                  {category.items.length} items · from{" "}
                  {formatCents(Math.min(...category.items.map((item) => item.fromPriceCents)))}
                </span>
                <span className="absolute inset-x-0 bottom-0 h-1 bg-(--accent) opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {featured.length > 0 && (
        <section className="pt-20">
          <SectionHeading>A few to start with</SectionHeading>
          <ul className="mt-6 grid gap-x-12 md:grid-cols-2">
            {featured.map(({ item, category }) => (
              <li key={item.id} data-accent={category.accent}>
                <Link
                  href={`/menu#${category.slug}`}
                  className="group flex h-full items-start gap-4 border-b border-dotted border-(--accent)/55 py-4"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm tracking-wide text-muted uppercase">{category.name}</span>
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="font-condensed text-[1.45rem] leading-tight font-semibold group-hover:text-(--accent-soft)">
                        {item.code ? `${item.code}. ` : ""}
                        {item.name}
                      </span>
                      <DietBadge dietary={item.dietary} />
                    </span>
                    {item.description && <span className="mt-1 block text-tan">{item.description}</span>}
                  </span>
                  <span className="shrink-0 text-right font-condensed text-xl leading-tight font-semibold tabular-nums">
                    {item.options.length > 1 && <span className="block text-sm font-medium text-muted">from</span>}
                    {formatCents(item.fromPriceCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function HomeMenuSkeleton() {
  return (
    <section className="pt-16" aria-busy="true" aria-label="Loading the menu">
      <SectionHeading>The menu</SectionHeading>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className="aspect-4/3 animate-pulse rounded-2xl border border-line bg-panel" />
        ))}
      </ul>
    </section>
  );
}
