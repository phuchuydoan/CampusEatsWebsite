// Pure pricing rules, kept free of database access so they can be unit tested.
// All amounts are integer cents.

import { HttpError } from '../errors.js';

// Every item is sold through one or more options. `key` is what the client
// sends back when ordering:
//   s<id>  a category size (Roll, Wrap ...) plus the item's surcharge
//   v<id>  one of the item's own variants
//   base   the item's single fixed price
export function buildOptions(item, sizes, variants) {
  if (variants.length > 0) {
    return variants.map((v) => ({ key: `v${v.id}`, label: v.name, priceCents: v.priceCents }));
  }
  if (item.basePriceCents !== null) {
    return [{ key: 'base', label: null, priceCents: item.basePriceCents }];
  }
  return sizes.map((s) => ({
    key: `s${s.id}`,
    label: s.name,
    priceCents: s.priceCents + item.surchargeCents,
  }));
}

// Prices one requested line against the menu. `menuItem` and `category` come
// from getMenu(); only the category's own add-ons may be attached.
export function priceLine(menuItem, category, line) {
  if (!menuItem.available) {
    throw new HttpError(409, `${menuItem.name} is not available right now`);
  }
  const option = menuItem.options.find((o) => o.key === line.optionKey);
  if (!option) {
    throw new HttpError(400, `Choose an option for ${menuItem.name}`);
  }

  const addons = [...new Set(line.addonIds ?? [])].map((id) => {
    const addon = category.addons.find((a) => a.id === id);
    if (!addon) {
      throw new HttpError(400, `That add-on is not offered with ${menuItem.name}`);
    }
    return addon;
  });

  const unitPriceCents = option.priceCents + addons.reduce((sum, a) => sum + a.priceCents, 0);
  return {
    itemId: menuItem.id,
    itemCode: menuItem.code,
    itemName: menuItem.name,
    categoryName: category.name,
    optionName: option.label,
    addons: addons.map((a) => ({ name: a.name, priceCents: a.priceCents })),
    unitPriceCents,
    quantity: line.quantity,
    lineTotalCents: unitPriceCents * line.quantity,
    notes: line.notes || null,
  };
}

export function totals(lines, taxRate) {
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const taxCents = Math.round(subtotalCents * taxRate);
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}
