import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { HttpError } from '../errors.js';
import { STATUSES, listOrders, setOrderStatus } from '../services/orders.js';

function requireAdmin(req, res, next) {
  if (!config.adminToken) {
    throw new HttpError(503, 'Kitchen access is disabled: set ADMIN_TOKEN in backend/.env');
  }
  const given = Buffer.from((req.get('authorization') ?? '').replace(/^Bearer\s+/i, ''));
  const expected = Buffer.from(config.adminToken);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new HttpError(401, 'Wrong passcode');
  }
  next();
}

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/orders', async (req, res) => {
  const { scope } = z.object({ scope: z.enum(['active', 'all']).default('active') }).parse(req.query);
  res.json({ orders: await listOrders({ scope }) });
});

adminRouter.patch('/orders/:code/status', async (req, res) => {
  const { status } = z.object({ status: z.enum(STATUSES) }).parse(req.body);
  res.json({ order: await setOrderStatus(req.params.code.toUpperCase(), status) });
});
