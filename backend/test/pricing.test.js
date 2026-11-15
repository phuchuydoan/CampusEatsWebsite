import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildOptions, priceLine, totals } from '../src/services/pricing.js';

const sizes = [
  { id: 1, name: 'Roll', priceCents: 999 },
  { id: 2, name: 'Hero', priceCents: 1199 },
];

test('a sandwich is priced by bread size plus its surcharge', () => {
  const options = buildOptions({ basePriceCents: null, surchargeCents: 200 }, sizes, []);
  assert.deepEqual(options, [
    { key: 's1', label: 'Roll', priceCents: 1199 },
    { key: 's2', label: 'Hero', priceCents: 1399 },
  ]);
});

test('variants win over a base price, and a fixed price gives one option', () => {
  const variants = [{ id: 7, name: 'With Meat', priceCents: 899 }];
  assert.deepEqual(buildOptions({ basePriceCents: 500, surchargeCents: 0 }, [], variants), [
    { key: 'v7', label: 'With Meat', priceCents: 899 },
  ]);
  assert.deepEqual(buildOptions({ basePriceCents: 799, surchargeCents: 0 }, sizes, []), [
    { key: 'base', label: null, priceCents: 799 },
  ]);
});

const burger = {
  id: 10,
  code: null,
  name: 'Classic',
  available: true,
  options: [{ key: 'base', label: null, priceCents: 799 }],
};
const burgers = {
  name: 'Smashburgers',
  addons: [
    { id: 1, name: 'Fries', priceCents: 400 },
    { id: 2, name: 'Bacon', priceCents: 200 },
  ],
};

test('a line adds its add-ons to the unit price and ignores duplicates', () => {
  const line = priceLine(burger, burgers, { optionKey: 'base', addonIds: [1, 2, 2], quantity: 2 });
  assert.equal(line.unitPriceCents, 1399);
  assert.equal(line.lineTotalCents, 2798);
  assert.equal(line.categoryName, 'Smashburgers');
  assert.deepEqual(
    line.addons.map((a) => a.name),
    ['Fries', 'Bacon'],
  );
});

test('unknown options, foreign add-ons and unavailable items are rejected', () => {
  assert.throws(() => priceLine(burger, burgers, { optionKey: 's1', quantity: 1 }), { status: 400 });
  assert.throws(() => priceLine(burger, burgers, { optionKey: 'base', addonIds: [99], quantity: 1 }), { status: 400 });
  assert.throws(() => priceLine({ ...burger, available: false }, burgers, { optionKey: 'base', quantity: 1 }), {
    status: 409,
  });
});

test('tax is rounded to the cent', () => {
  assert.deepEqual(totals([{ lineTotalCents: 1399 }, { lineTotalCents: 999 }], 0.08875), {
    subtotalCents: 2398,
    taxCents: 213,
    totalCents: 2611,
  });
  assert.deepEqual(totals([{ lineTotalCents: 1399 }], 0), { subtotalCents: 1399, taxCents: 0, totalCents: 1399 });
});
