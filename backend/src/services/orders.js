import { randomInt } from 'node:crypto';
import { config } from '../config.js';
import { pool, withTransaction } from '../db.js';
import { HttpError } from '../errors.js';
import { getMenu } from './menu.js';
import { priceLine, totals } from './pricing.js';

export const STATUSES = ['received', 'preparing', 'ready', 'completed', 'cancelled'];
const ACTIVE_STATUSES = ['received', 'preparing', 'ready'];

// No 0/O or 1/I/L, so a code is easy to read out at the counter.
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function newOrderCode() {
  let code = 'CE-';
  for (let i = 0; i < 6; i += 1) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

// Prices are always recomputed here from the database; anything the client
// says about prices is ignored.
export async function createOrder({ customer, notes, items }) {
  const menu = await getMenu();
  const index = new Map();
  for (const category of menu) {
    for (const item of category.items) index.set(item.id, { item, category });
  }

  const lines = items.map((line) => {
    const entry = index.get(line.itemId);
    if (!entry) throw new HttpError(400, 'An item in your order is no longer on the menu');
    return priceLine(entry.item, entry.category, line);
  });
  const { subtotalCents, taxCents, totalCents } = totals(lines, config.taxRate);

  const code = await withTransaction(async (conn) => {
    let orderId;
    let orderCode;
    // A code collision is astronomically unlikely; retry a few times anyway.
    // ON CONFLICT (rather than catching the error) keeps the transaction usable.
    for (let attempt = 0; orderId === undefined; attempt += 1) {
      if (attempt >= 5) throw new Error('Could not generate a unique order code');
      orderCode = newOrderCode();
      const { rows } = await conn.query(
        `INSERT INTO orders
           (code, customer_name, customer_phone, customer_email, notes, subtotal_cents, tax_cents, total_cents)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (code) DO NOTHING
         RETURNING id`,
        [orderCode, customer.name, customer.phone, customer.email || null, notes || null, subtotalCents, taxCents, totalCents],
      );
      orderId = rows[0]?.id;
    }

    for (const line of lines) {
      const { rows } = await conn.query(
        `INSERT INTO order_items
           (order_id, item_id, item_code, item_name, category_name, option_name, unit_price_cents, quantity, line_total_cents, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [orderId, line.itemId, line.itemCode, line.itemName, line.categoryName, line.optionName, line.unitPriceCents, line.quantity, line.lineTotalCents, line.notes],
      );
      if (line.addons.length > 0) {
        await conn.query(
          `INSERT INTO order_item_addons (order_item_id, addon_name, price_cents)
           SELECT $1::int, addon.name, addon.price_cents
           FROM unnest($2::text[], $3::int[]) AS addon (name, price_cents)`,
          [rows[0].id, line.addons.map((a) => a.name), line.addons.map((a) => a.priceCents)],
        );
      }
    }
    return orderCode;
  });

  return getOrderByCode(code);
}

async function loadOrders(where, params) {
  const { rows: orders } = await pool.query(
    `SELECT id, code, customer_name AS "customerName", customer_phone AS "customerPhone",
            customer_email AS "customerEmail", notes, status,
            subtotal_cents AS "subtotalCents", tax_cents AS "taxCents", total_cents AS "totalCents",
            created_at AS "createdAt", updated_at AS "updatedAt"
     FROM orders ${where}`,
    params,
  );
  if (orders.length === 0) return [];

  const { rows: lines } = await pool.query(
    `SELECT id, order_id AS "orderId", item_code AS code, item_name AS name, category_name AS "categoryName",
            option_name AS "optionName",
            unit_price_cents AS "unitPriceCents", quantity, line_total_cents AS "lineTotalCents", notes
     FROM order_items WHERE order_id = ANY($1) ORDER BY id`,
    [orders.map((o) => o.id)],
  );
  const { rows: addons } = lines.length
    ? await pool.query(
        `SELECT order_item_id AS "lineId", addon_name AS name, price_cents AS "priceCents"
         FROM order_item_addons WHERE order_item_id = ANY($1) ORDER BY id`,
        [lines.map((l) => l.id)],
      )
    : { rows: [] };

  return orders.map(({ id, ...order }) => ({
    ...order,
    items: lines
      .filter((l) => l.orderId === id)
      .map(({ id: lineId, orderId, ...line }) => ({
        ...line,
        addons: addons.filter((a) => a.lineId === lineId).map(({ name, priceCents }) => ({ name, priceCents })),
      })),
  }));
}

export async function getOrderByCode(code) {
  const [order] = await loadOrders('WHERE code = $1', [code]);
  return order ?? null;
}

// The customer-facing view of an order leaves out contact details: anyone
// holding the pickup code can open the tracking page.
export function toPublicOrder({ customerPhone, customerEmail, ...order }) {
  return order;
}

export function listOrders({ scope }) {
  if (scope === 'active') {
    return loadOrders('WHERE status = ANY($1) ORDER BY created_at ASC', [ACTIVE_STATUSES]);
  }
  return loadOrders('ORDER BY created_at DESC LIMIT 100', []);
}

export async function setOrderStatus(code, status) {
  const result = await pool.query('UPDATE orders SET status = $1, updated_at = now() WHERE code = $2', [status, code]);
  if (result.rowCount === 0) throw new HttpError(404, 'Order not found');
  return getOrderByCode(code);
}
