import { Router } from 'express';
import { config } from '../config.js';
import { getMenu } from '../services/menu.js';

export const menuRouter = Router();

menuRouter.get('/', async (req, res) => {
  res.json({ categories: await getMenu(), taxRate: config.taxRate });
});
