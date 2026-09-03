import { Router } from 'express';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();
router.use(auth, admin);

// GET /api/admin/customers — list customers with order/spend/loyalty stats
router.get('/customers', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      u.id, u.name, u.email, u.role, u.created_at,
      u.loyalty_points, u.referral_code,
      COUNT(o.id)::int AS order_count,
      COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total ELSE 0 END), 0)::int AS total_spent,
      (SELECT COUNT(*)::int FROM users r WHERE r.referred_by = u.id) AS referral_count
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.role <> 'admin'
    GROUP BY u.id
    ORDER BY total_spent DESC
  `);
  res.json(rows);
});

// GET /api/admin/customers/:id — single customer detail (orders + addresses)
router.get('/customers/:id', async (req, res) => {
  const userResult = await pool.query(
    'SELECT id, name, email, role, created_at, loyalty_points, referral_code FROM users WHERE id = $1',
    [req.params.id]
  );
  if (!userResult.rows.length) return res.status(404).json({ message: 'Customer not found' });

  const [orders, addresses] = await Promise.all([
    pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.params.id]),
    pool.query('SELECT * FROM customer_addresses WHERE user_id = $1 ORDER BY is_default DESC', [req.params.id])
  ]);

  res.json({ ...userResult.rows[0], orders: orders.rows, addresses: addresses.rows });
});

// GET /api/admin/reviews — all reviews (including hidden) for moderation
router.get('/reviews', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT r.*, u.name AS user_name, p.name AS product_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    JOIN products p ON p.id = r.product_id
    ORDER BY r.created_at DESC
  `);
  res.json(rows);
});

// PATCH /api/admin/reviews/:id — hide/unhide a review
router.patch('/reviews/:id', async (req, res) => {
  const { hidden } = req.body;
  const { rows } = await pool.query(
    'UPDATE reviews SET hidden = $1 WHERE id = $2 RETURNING *',
    [Boolean(hidden), req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Review not found' });
  res.json(rows[0]);
});

// DELETE /api/admin/reviews/:id — remove a review entirely
router.delete('/reviews/:id', async (req, res) => {
  const { rows } = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING id', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Review not found' });
  res.json({ success: true });
});

// GET /api/admin/stock-alerts — waitlists per product, for restock planning
router.get('/stock-alerts', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      p.id AS product_id, p.name AS product_name, p.stock,
      COUNT(sa.id)::int AS waiting_count,
      COUNT(sa.id) FILTER (WHERE sa.notified)::int AS notified_count
    FROM stock_alerts sa
    JOIN products p ON p.id = sa.product_id
    GROUP BY p.id, p.name, p.stock
    ORDER BY waiting_count DESC
  `);
  res.json(rows);
});

export default router;
