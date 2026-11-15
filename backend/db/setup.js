// Creates the database and tables, then seeds the menu.
//
//   npm run db:setup   create anything missing; seed the menu only if it is empty
//   npm run db:seed    replace the menu with db/menu-data.js (orders are kept)

import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { config } from '../src/config.js';
import { categories } from './menu-data.js';

const reseed = process.argv.includes('--reseed');
const cents = (dollars) => Math.round(dollars * 100);

async function seedMenu(conn) {
  await conn.beginTransaction();
  try {
    // Cascades to sizes, items, variants and add-ons. Past order lines keep
    // their copied names and prices; only their item_id link is cleared.
    await conn.query('DELETE FROM categories');

    let itemCount = 0;
    for (const [categoryIndex, category] of categories.entries()) {
      const [{ insertId: categoryId }] = await conn.query(
        'INSERT INTO categories (slug, name, blurb, note, image, accent, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
          'INSERT INTO category_sizes (category_id, name, price_cents, sort_order) VALUES (?, ?, ?, ?)',
          [categoryId, size.name, cents(size.price), i],
        );
      }

      for (const [i, addon] of (category.addons ?? []).entries()) {
        await conn.query(
          'INSERT INTO addons (category_id, name, price_cents, sort_order) VALUES (?, ?, ?, ?)',
          [categoryId, addon.name, cents(addon.price), i],
        );
      }

      for (const [i, item] of category.items.entries()) {
        const pricedBySize = item.price === undefined && !item.variants;
        if (pricedBySize && !category.sizes) {
          throw new Error(`"${item.name}" in ${category.slug} has no price, variants or category sizes`);
        }
        const [{ insertId: itemId }] = await conn.query(
          `INSERT INTO items
             (category_id, code, name, description, base_price_cents, surcharge_cents, dietary, is_featured, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            categoryId,
            item.code ?? null,
            item.name,
            item.description ?? null,
            item.price === undefined ? null : cents(item.price),
            cents(item.surcharge ?? 0),
            item.dietary ?? 'none',
            item.featured ? 1 : 0,
            i,
          ],
        );
        for (const [j, variant] of (item.variants ?? []).entries()) {
          await conn.query(
            'INSERT INTO item_variants (item_id, name, price_cents, sort_order) VALUES (?, ?, ?, ?)',
            [itemId, variant.name, cents(variant.price), j],
          );
        }
        itemCount += 1;
      }
    }

    await conn.commit();
    return itemCount;
  } catch (err) {
    await conn.rollback();
    throw err;
  }
}

const { database, ...server } = config.db;
const conn = await mysql.createConnection({ ...server, multipleStatements: true });

try {
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.query(`USE \`${database}\``);
  await conn.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  console.log(`Database "${database}" and tables are in place.`);

  const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM categories');
  if (count === 0 || reseed) {
    const items = await seedMenu(conn);
    console.log(`Seeded ${categories.length} categories and ${items} items.`);
  } else {
    console.log(`Menu already has ${count} categories; left as is (use "npm run db:seed" to replace it).`);
  }
} finally {
  await conn.end();
}
