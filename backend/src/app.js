import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { pool } from './db.js';
import { errorHandler, notFound } from './errors.js';
import { adminRouter } from './routes/admin.js';
import { menuRouter } from './routes/menu.js';
import { ordersRouter } from './routes/orders.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});

app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);
