// Creates the database (if missing) and tables, then seeds the menu.
//
//   npm run db:setup   create anything missing; seed the menu only if it is empty
//   npm run db:seed    replace the menu with db/menu-data.js (orders are kept)

import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { config } from '../src/config.js';
import { categories } from './menu-data.js';

const reseed = process.argv.includes('--reseed');
const cents = (dollars) => Math.round(dollars * 100);

async function seedMenu(conn) {
  await conn.query('BEGIN');
  try {
    // Cascades to sizes, items, variants and add-ons. Past order lines keep
    // their copied names and prices; only their item_id link is cleared.
    await conn.query('DELETE FROM categories');

    let itemCount = 0;
    for (const [categoryIndex, category] of categories.entries()) {
      const { rows: [{ id: categoryId }] } = await conn.query(
        'INSERT INTO categories (slug, name, blurb, note, image, accent, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [
          category.slug,
          category.name,
          category.blurb ?? null,
          category.note ?? null,
          category.image ?? null,
          category.accent ?? 'red',
          categoryIndex,
        ],
      );

      for (const [i, size] of (category.sizes ?? []).entries()) {
        await conn.query(
          'INSERT INTO category_sizes (category_id, name, price_cents, sort_order) VALUES ($1, $2, $3, $4)',
          [categoryId, size.name, cents(size.price), i],
        );
      }

      for (const [i, addon] of (category.addons ?? []).entries()) {
        await conn.query(
          'INSERT INTO addons (category_id, name, price_cents, sort_order) VALUES ($1, $2, $3, $4)',
          [categoryId, addon.name, cents(addon.price), i],
        );
      }

      for (const [i, item] of category.items.entries()) {
        const pricedBySize = item.price === undefined && !item.variants;
        if (pricedBySize && !category.sizes) {
          throw new Error(`"${item.name}" in ${category.slug} has no price, variants or category sizes`);
        }
        const { rows: [{ id: itemId }] } = await conn.query(
          `INSERT INTO items
             (category_id, code, name, description, base_price_cents, surcharge_cents, dietary, is_featured, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [
            categoryId,
            item.code ?? null,
            item.name,
            item.description ?? null,
            item.price === undefined ? null : cents(item.price),
            cents(item.surcharge ?? 0),
            item.dietary ?? 'none',
            Boolean(item.featured),
            i,
          ],
        );
        for (const [j, variant] of (item.variants ?? []).entries()) {
          await conn.query(
            'INSERT INTO item_variants (item_id, name, price_cents, sort_order) VALUES ($1, $2, $3, $4)',
            [itemId, variant.name, cents(variant.price), j],
          );
        }
        itemCount += 1;
      }
    }

    await conn.query('COMMIT');
    return itemCount;
  } catch (err) {
    await conn.query('ROLLBACK');
    throw err;
  }
}

// Connects to the configured database, creating it first if the server does
// not have it yet (a fresh local Postgres; a hosted one already exists).
async function connect() {
  const { database } = config.db;
  let conn = new pg.Client(config.db);
  try {
    await conn.connect();
  } catch (err) {
    if (err.code !== '3D000') throw err; // 3D000 = database does not exist
    const admin = new pg.Client({ ...config.db, database: 'postgres' });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${database}"`);
    await admin.end();
    conn = new pg.Client(config.db);
    await conn.connect();
  }
  return conn;
}

const conn = await connect();

try {
  await conn.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log(`Database "${config.db.database}" and tables are in place.`);

  const { rows } = await conn.query('SELECT COUNT(*) AS count FROM categories');
  const count = Number(rows[0].count);
  if (count === 0 || reseed) {
    const items = await seedMenu(conn);
    console.log(`Seeded ${categories.length} categories and ${items} items.`);
  } else {
    console.log(`Menu already has ${count} categories; left as is (use "npm run db:seed" to replace it).`);
  }
} finally {
  await conn.end();
}
