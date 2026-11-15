# Campus Eats

Order-ahead website for the Campus Eats menu: Next.js frontend, Express API, PostgreSQL. See [PLAN.md](PLAN.md) for scope, the API contract and what comes next.

## Run it locally

You need Node.js 20+ and a PostgreSQL database: a local server, or a hosted one such as Supabase (see `backend/.env.example` for the Supabase settings).

```bash
# 1. API (http://localhost:4000)
cd backend
npm install
cp .env.example .env        # set DB_USER / DB_PASSWORD, and an ADMIN_TOKEN for the kitchen screen
npm run db:setup            # creates the campus_eats database, tables and menu
npm run dev

# 2. Website (http://localhost:3000), in a second terminal
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

- Customer site: http://localhost:3000
- Kitchen screen: http://localhost:3000/kitchen (passcode = `ADMIN_TOKEN` in `backend/.env`)

## Changing the menu

Edit `backend/db/menu-data.js`, then run `npm run db:seed` in `backend/`. Existing orders are kept.
# CampusEatsWebsite

## Deployment

- **Database**: Supabase (PostgreSQL). `npm run db:setup` in `backend/`, with `backend/.env` pointing at Supabase, creates the tables and seeds the menu.
- **API**: Render web service, root directory `backend`, start command `npm start`. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (Supabase session pooler), `ADMIN_TOKEN`, and `CORS_ORIGIN` = the Vercel site URL.
- **Website**: Vercel, root directory `frontend`. Set `NEXT_PUBLIC_API_URL` to the Render URL (no trailing slash) and redeploy; the value is baked in at build time.
