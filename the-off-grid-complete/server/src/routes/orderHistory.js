import { Router } from 'express';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_status_history (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status VARCHAR(30) NOT NULL,
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id_created_at ON order_status_history(order_id, created_at)`);
}

const statusNotes = {
  pending: 'Order received successfully.',
  processing: 'Your order is being prepared for dispatch.',
  shipped: 'Your order has been handed over for delivery.',
  delivered: 'Your order has been delivered.',
  cancelled: 'Your order was cancelled.'
};

async function ensureInitialHistory(client, order) {
  const existing = await client.query('SELECT id FROM order_status_history WHERE order_id=$1 LIMIT 1', [order.id]);
  if (!existing.rows.length) {
    await client.query(
      `INSERT INTO order_status_history(order_id,status,note,created_at) VALUES($1,$2,$3,$4)`,
      [order.id, order.status || 'pending', statusNotes[order.status] || 'Order status updated.', order.created_at || new Date()]
    );
  }
}

router.get('/:id/history', auth, async (req, res) => {
  try {
    await ensureTable();
    const orderResult = await pool.query('SELECT id,status,created_at FROM orders WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!orderResult.rows.length) return res.status(404).json({ message: 'Order not found' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await ensureInitialHistory(client, orderResult.rows[0]);
      const result = await client.query(
        `SELECT id, order_id, status, note, created_at FROM order_status_history WHERE order_id=$1 ORDER BY created_at ASC, id ASC`,
        [req.params.id]
      );
      await client.query('COMMIT');
      res.json(result.rows);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally { client.release(); }
  } catch (e) {
    console.error('ORDER HISTORY ERROR:', e.message);
    res.status(500).json({ message: 'Could not load order history' });
  }
});

router.patch('/:id/status', auth, admin, async (req, res) => {
  const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const nextStatus = String(req.body.status || '').toLowerCase();
  const paymentStatus = req.body.payment_status == null ? null : String(req.body.payment_status).toLowerCase();
  if (!allowed.includes(nextStatus)) return res.status(400).json({ message: 'Invalid order status' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ensureTable();
    const current = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!current.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Order not found' }); }
    const order = current.rows[0];
    const changed = order.status !== nextStatus;

    const updated = await client.query(
      `UPDATE orders SET status=$1, payment_status=COALESCE($2,payment_status) WHERE id=$3 RETURNING *`,
      [nextStatus, paymentStatus, req.params.id]
    );

    if (changed) {
      await client.query(
        `INSERT INTO order_status_history(order_id,status,note) VALUES($1,$2,$3)`,
        [order.id, nextStatus, statusNotes[nextStatus] || 'Order status updated.']
      );
    }

    // Preserve the existing loyalty behavior for COD orders delivered by an admin.
    if (changed && nextStatus === 'delivered' && order.payment_method === 'cod' && !order.points_awarded) {
      const points = Math.floor(Number(order.total || 0) / 100);
      if (points > 0) {
        await client.query('UPDATE users SET loyalty_points=loyalty_points+$1 WHERE id=$2', [points, order.user_id]);
      }
      await client.query('UPDATE orders SET points_earned=$1, points_awarded=TRUE WHERE id=$2', [points, order.id]);
    }

    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('ORDER STATUS ERROR:', e.message);
    res.status(500).json({ message: 'Could not update order status' });
  } finally { client.release(); }
});

export default router;
