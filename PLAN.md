# Campus Eats — plan

A website where students order from the Campus Eats menu ahead of time, then pick up and pay at the counter.

## Stack

| Layer | Choice | Where |
|-------|--------|-------|
| Frontend | Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS 4) | `frontend/` |
| Backend | Node.js + Express 5, `mysql2`, `zod` validation | `backend/` |
| Database | MySQL (`campus_eats`) | `backend/db/schema.sql` |
| Images | Generated with Higgsfield AI (hero + one per category) | `frontend/public/images/` |

The browser talks only to the Express API. The Next.js server also calls the API to render the menu.

## Phase 1 — built

**Customer**
- Home page: hero, category grid, a few featured items, how ordering works.
- Menu page: all 13 sections and 108 items from the boards, search, vegetarian/vegan filter, a section rail that follows the scroll.
- Item sheet: choose bread (Roll / Wrap / Hero / Panini) or a variant, tick add-ons, set quantity, add a note.
- Order drawer (saved in the browser), checkout with name and phone, no online payment.
- Order page with a pickup code and live status: received → being made → ready → picked up.

**Staff**
- `/kitchen`: passcode-protected board of open orders with one tap to move each order along, and a two-tap cancel.

**Data model**
- `categories` → `items`; `category_sizes` hold bread prices per section; `item_variants` hold item-specific choices; `addons` belong to a section.
- `orders` → `order_items` → `order_item_addons`. Order lines copy names and prices at purchase time.
- Money is stored as integer cents everywhere.

## API contract

Base URL `http://localhost:4000/api`. Errors are `{ "error": { "message", "details"? } }`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Checks the API and database |
| GET | `/menu` | `{ categories: [...], taxRate }`; each item has `options: [{ key, label, priceCents }]` |
| POST | `/orders` | Body `{ customer: { name, phone, email? }, notes?, items: [{ itemId, optionKey, addonIds, quantity, notes? }] }` → `201 { order }` |
| GET | `/orders/:code` | Public order status by pickup code (no contact details) |
| GET | `/admin/orders?scope=active\|all` | Kitchen list; needs `Authorization: Bearer <ADMIN_TOKEN>` |
| PATCH | `/admin/orders/:code/status` | Body `{ status }`; same auth |

The server always recomputes prices from the database; prices sent by a client are ignored.

## Phase 2 — next

1. **Store details**: address, opening hours and a "closed, ordering opens at…" state. These aren't on the boards, so they need to come from the store.
2. **Pickup time**: let the customer choose ASAP or a time slot.
3. **Online payment** (Stripe Checkout) alongside pay-at-counter.
4. **Accounts**: student sign-in, order history, reorder.
5. **Menu admin**: edit prices, mark items sold out, upload photos from the kitchen screen (the `is_available` column and API support already exist).
6. **Notifications**: text or email when the order is ready.
7. **Per-item photos**: generate with Higgsfield for the best sellers.
8. **Deploy**: frontend on Vercel, API and MySQL on a host such as Railway; proper staff accounts instead of one shared passcode.

## Open questions for the store

- Sales tax: `TAX_RATE` is 0 for now. What rate applies?
- The signature boards print "$9.99+". The site treats those as the exact prices plus the +$1/+$2 badges. Is anything else added?
- Fat Heroes are "$12.99+": is any hero more than $12.99?
- Breakfast sandwiches "with Meat": does the customer choose the meat? It's a free-text note today.
