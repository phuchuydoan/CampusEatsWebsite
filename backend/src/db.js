import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({ ...config.db, max: 10 });

// A hosted database closes idle connections now and then. Without a listener
// that 'error' event would crash the process; the pool just opens a new one.
pool.on('error', (err) => {
  console.error('Idle database connection failed:', err.message);
});

// Runs `work` inside a transaction on a single connection.
export async function withTransaction(work) {
  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');
    const result = await work(conn);
    await conn.query('COMMIT');
    return result;
  } catch (err) {
    await conn.query('ROLLBACK');
    throw err;
  } finally {
    conn.release();
  }
}
