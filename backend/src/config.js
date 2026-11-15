import 'dotenv/config';

const env = process.env;

const dbHost = env.DB_HOST ?? '127.0.0.1';
const isLocalDb = ['127.0.0.1', 'localhost', '::1'].includes(dbHost);

export const config = {
  port: Number(env.PORT ?? 4000),
  // Comma-separated list of origins allowed to call the API from a browser.
  corsOrigins: (env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((s) => s.trim()),
  // Sales tax as a fraction (0.08875 = 8.875%). 0 hides the tax line.
  taxRate: Number(env.TAX_RATE ?? 0),
  // Passcode for the kitchen endpoints. They are disabled while this is empty.
  adminToken: env.ADMIN_TOKEN ?? '',
  db: {
    host: dbHost,
    port: Number(env.DB_PORT ?? 5432),
    user: env.DB_USER ?? 'postgres',
    password: env.DB_PASSWORD ?? '',
    database: env.DB_NAME ?? 'campus_eats',
    // Hosted Postgres (Supabase) is reached over TLS. Its pooler presents a
    // certificate signed by Supabase's own CA, so the chain is not verified.
    ssl: isLocalDb ? false : { rejectUnauthorized: false },
  },
};
