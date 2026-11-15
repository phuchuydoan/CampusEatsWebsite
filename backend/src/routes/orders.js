import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { HttpError } from '../errors.js';
import { createOrder, getOrderByCode, toPublicOrder } from '../services/orders.js';

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, 'Enter your name').max(100),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-.\s]{7,30}$/, 'Enter a phone number we can reach you on'),
    email: z.union([z.literal(''), z.email('Enter a valid email address').max(190)]).optional(),
  }),
  notes: optionalText(500),
  items: z
    .array(
      z.object({
        itemId: z.number().int().positive(),
        optionKey: z.string().regex(/^(base|[sv]\d+)$/),
        addonIds: z.array(z.number().int().positive()).max(30).default([]),
        quantity: z.number().int().min(1).max(20),
        notes: optionalText(255),
      }),
    )
    .min(1, 'Your order is empty')
    .max(50),
});

const placeOrderLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many orders from this device. Try again in a few minutes.' } },
});

export const ordersRouter = Router();

ordersRouter.post('/', placeOrderLimit, async (req, res) => {
  const order = await createOrder(orderSchema.parse(req.body));
  res.status(201).json({ order: toPublicOrder(order) });
});

ordersRouter.get('/:code', async (req, res) => {
  const order = await getOrderByCode(req.params.code.toUpperCase());
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({ order: toPublicOrder(order) });
});
