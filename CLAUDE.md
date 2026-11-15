# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An order-ahead website for the Campus Eats menu: customers build an order, check out without paying, and track it by pickup code; staff work the orders from a kitchen board. Two separate npm projects (no workspace) plus MySQL. `PLAN.md` has the scope, API contract and roadmap.

## Commands

Backend (`backend/`, Express 5, ESM JavaScript, port 4000):

```bash
npm run dev        # node --watch src/server.js
npm run db:setup   # create database + tables; seeds the menu only if it is empty
npm run db:seed    # replace the menu from db/menu-data.js (orders are kept)
npm test           # node --test (pure pricing rules, no database needed)
node --test --test-name-pattern="tax" test/pricing.test.js   # a single test
```

Frontend (`frontend/`, Next.js 16, TypeScript, Tailwind 4, port 3000):

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

Both must be running for the site to work, and MySQL must be up. Config is in `backend/.env` (DB credentials, `TAX_RATE`, `ADMIN_TOKEN`, `CORS_ORIGIN`) and `frontend/.env.local` (`NEXT_PUBLIC_API_URL`). Schema changes are not migrated: `schema.sql` is `CREATE TABLE IF NOT EXISTS`, so altering an existing table means dropping it or writing the `ALTER` by hand.

## Architecture

**Data flow.** The frontend never touches MySQL. Server components and client components both call the Express API through `frontend/src/lib/api.ts`. The menu is fetched uncached inside `<Suspense>` on each request (see "Next.js 16" below), so price or availability changes need no rebuild.

**Pricing model (the core idea).** An item is priced in exactly one of three ways, and `backend/src/services/pricing.js#buildOptions` flattens all three into a uniform `options: [{ key, label, priceCents }]` list that the frontend renders without knowing the difference:

- `s<id>`: the category's bread sizes (`category_sizes`: Roll / Wrap / Hero / Panini) plus the item's `surcharge_cents` (the +$1 / +$2 badges)
- `v<id>`: the item's own `item_variants` ("With Meat", muffin flavors, bagel spreads)
- `base`: a single `base_price_cents`

Add-ons belong to a category, not an item. When an order is placed the client sends only `itemId`, `optionKey`, `addonIds`, `quantity`; `services/orders.js` reprices every line from the database and rejects add-ons from another category. Never trust or accept prices from the client.

**Money** is integer cents in the database, the API and the frontend. `menu-data.js` is the only place dollars appear.

**Orders** copy item name, category name, option and add-on names and prices onto `order_items` / `order_item_addons`, so reseeding or editing the menu never rewrites history (`item_id` is just a nullable link). Category name is stored because item names repeat across sections ("Veggie" is an omelette and a smashburger).

**Order access.** `GET /api/orders/:code` is public by pickup code and strips phone/email (`toPublicOrder`). `/api/admin/*` requires `Authorization: Bearer <ADMIN_TOKEN>`; the kitchen page keeps the passcode in `sessionStorage`.

**Frontend state.** There is no state library. `src/lib/store.ts` is a small `useSyncExternalStore` store with optional web-storage persistence; the cart (`lib/cart.ts`, `localStorage`), cart-drawer open flag, toast and kitchen passcode all use it. Components that depend on persisted state wait for `useHydrated()` instead of rendering a wrong first frame. The item sheet and cart drawer are native `<dialog>` elements opened with `showModal()`; their layout lives in `globals.css` (`dialog.sheet`, `dialog.drawer`) because Tailwind's reset removes the default dialog centering.

**Theme.** Tokens are in `src/app/globals.css` under `@theme` (`board`, `panel`, `chalk`, `tan`, `brand`, `veg`, `ice`…), taken from the physical menu boards. A category's `accent` (`red` / `green` / `blue`) is applied with `data-accent`, which swaps the `--accent` CSS variables; use `border-(--accent)` / `text-(--accent-soft)` rather than hard-coding a colour.

## Next.js 16

This is not the Next.js in most training data; `frontend/AGENTS.md` says to read `frontend/node_modules/next/dist/docs/` before writing Next code. What already matters here:

- `cacheComponents` is on. Any uncached `fetch`, and any client component using `useParams`, must sit inside `<Suspense>` or the build fails.
- `next/image` uses `preload` (not `priority`).
- Error boundaries receive `{ error, retry }`.
- Use the global `LayoutProps<"/">` / `PageProps<"/route">` helpers for route props.

## The menu boards

`pic1.jpeg`–`pic8.jpeg` in the repo root are photos of the store's menu boards and the source of truth for names, descriptions and prices; `backend/db/menu-data.js` is their transcription. When a price or item is in doubt, read the image.

| File | Sections |
|------|----------|
| `pic1.jpeg` | Vegetarian & Vegan Cold (C20–C26) and Hot (H15–H22) sandwiches |
| `pic2.jpeg` | Signature Cold Sandwiches C1–C11 |
| `pic3.jpeg` | Breakfast + breakfast add-ons |
| `pic4.jpeg` | Omelettes, Smashburgers + burger add-ons |
| `pic5.jpeg` | Fat Heroes F1–F15, Quesadillas |
| `pic6.jpeg` | Signature Hot Sandwiches H1–H14 |
| `pic7.jpeg` | Breakfast Favorites, Tacos, Breakfast Burritos |
| `pic8.jpeg` | Signature Cold Sandwiches C12–C19, Salads |

Things that are easy to get wrong:

- The veggie board prices the Hero at $12.99; the signature boards at $11.99.
- Vegetarian / vegan tags come only from the section headings on `pic1`. Don't tag other items (the "Veggie" omelette and burger are untagged on the boards).
- The site has no address, opening hours or tax rate because the boards don't state them. Don't invent them; `TAX_RATE` defaults to 0.

Category and hero photos in `frontend/public/images/` were generated with Higgsfield (`gpt_image_2_6`, dark wooden table, black background, no text); match that look for new ones.
