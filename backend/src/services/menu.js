import { pool } from '../db.js';
import { buildOptions } from './pricing.js';

function groupBy(rows, key) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row[key])) groups.set(row[key], []);
    groups.get(row[key]).push(row);
  }
  return groups;
}

// The whole menu as a tree: categories → items → options, plus each
// category's sizes and add-ons. Five small queries, joined in memory.
// (Postgres folds unquoted aliases to lower case, hence the quoted camelCase.)
export async function getMenu(db = pool) {
  const results = await Promise.all([
    db.query('SELECT id, slug, name, blurb, note, image, accent FROM categories ORDER BY sort_order, id'),
    db.query('SELECT id, category_id, name, price_cents AS "priceCents" FROM category_sizes ORDER BY sort_order, id'),
    db.query('SELECT id, category_id, name, price_cents AS "priceCents" FROM addons ORDER BY sort_order, id'),
    db.query(
      `SELECT id, category_id, code, name, description, dietary,
              base_price_cents AS "basePriceCents", surcharge_cents AS "surchargeCents",
              is_featured AS featured, is_available AS available
       FROM items ORDER BY sort_order, id`,
    ),
    db.query('SELECT id, item_id, name, price_cents AS "priceCents" FROM item_variants ORDER BY sort_order, id'),
  ]);
  const [categories, sizes, addons, items, variants] = results.map((result) => result.rows);

  const sizesByCategory = groupBy(sizes, 'category_id');
  const addonsByCategory = groupBy(addons, 'category_id');
  const itemsByCategory = groupBy(items, 'category_id');
  const variantsByItem = groupBy(variants, 'item_id');
  const strip = ({ id, name, priceCents }) => ({ id, name, priceCents });

  return categories.map((category) => {
    const categorySizes = (sizesByCategory.get(category.id) ?? []).map(strip);
    return {
      ...category,
      sizes: categorySizes,
      addons: (addonsByCategory.get(category.id) ?? []).map(strip),
      items: (itemsByCategory.get(category.id) ?? []).map((item) => {
        const options = buildOptions(item, categorySizes, variantsByItem.get(item.id) ?? []);
        return {
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          dietary: item.dietary,
          featured: Boolean(item.featured),
          available: Boolean(item.available),
          surchargeCents: item.surchargeCents,
          fromPriceCents: Math.min(...options.map((o) => o.priceCents)),
          options,
        };
      }),
    };
  });
}
