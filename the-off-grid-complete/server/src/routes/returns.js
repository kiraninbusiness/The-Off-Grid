import { Router } from 'express';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';
import { sendEmail, returnStatusEmail } from '../services/email.js';

const router = Router();

const RETURN_WINDOW_DAYS = 10;

// POST /api/returns — customer requests a return or exchange
router.post('/', auth, async (req, res) => {
  const {
    order_id,
    order_item_id = null,
    type = 'return',
    reason = '',
    exchange_size = null,
    exchange_color = null
  } = req.body;

  if (!['return', 'exchange'].includes(type)) {
    return res.status(400).json({ message: 'Invalid request type' });
  }
  if (!reason.trim()) {
    return res.status(400).json({ message: 'Please tell us the reason for this request' });
  }

  try {
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [order_id, req.user.id]
    );
    const order = orderResult.rows[0];

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders are eligible for return or exchange' });
    }

    if (order.delivered_at) {
      const deadline = new Date(order.delivered_at).getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() > deadline) {
        return res.status(400).json({ message: `The ${RETURN_WINDOW_DAYS}-day return window for this order has closed` });
      }
    }

    const existing = await pool.query(
      `SELECT id FROM returns WHERE order_id = $1 AND user_id = $2
       AND (order_item_id = $3 OR ($3::int IS NULL AND order_item_id IS NULL))
       AND status NOT IN ('rejected')`,
      [order_id, req.user.id, order_item_id]
    );
    if (existing.rows.length) {
      return res.status(409).json({ message: 'A request already exists for this item' });
    }

    const { rows } = await pool.query(
      `INSERT INTO returns (order_id, order_item_id, user_id, type, reason, exchange_size, exchange_color)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [order_id, order_item_id, req.user.id, type, reason.trim().slice(0, 500), exchange_size, exchange_color]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('POST /returns failed:', e.message);
    res.status(500).json({ message: 'Could not submit request' });
  }
});

// GET /api/returns/mine — customer's own requests
router.get('/mine', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM returns WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

// GET /api/returns — admin: all requests
router.get('/', auth, admin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, u.name AS customer_name, u.email AS customer_email
     FROM returns r
     JOIN users u ON u.id = r.user_id
     ORDER BY r.created_at DESC`
  );
  res.json(rows);
});

// PATCH /api/returns/:id — admin: update status
router.patch('/:id', auth, admin, async (req, res) => {
  const allowedStatuses = ['requested', 'approved', 'rejected', 'received', 'refunded', 'exchanged'];
  const { status, admin_notes, refund_amount } = req.body;

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const sets = ['updated_at = NOW()'];
  const values = [];
  if (status) { values.push(status); sets.push(`status = $${values.length}`); }
  if (admin_notes !== undefined) { values.push(admin_notes); sets.push(`admin_notes = $${values.length}`); }
  if (refund_amount !== undefined) { values.push(refund_amount); sets.push(`refund_amount = $${values.length}`); }

  values.push(req.params.id);

  const { rows } = await pool.query(
    `UPDATE returns SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );

  if (!rows.length) return res.status(404).json({ message: 'Request not found' });

  const customer = await pool.query('SELECT email FROM users WHERE id = $1', [rows[0].user_id]);
  if (customer.rows[0]?.email) {
    const { subject, html } = returnStatusEmail(rows[0]);
    sendEmail({ to: customer.rows[0].email, subject, html }).catch(() => {});
  }

  res.json(rows[0]);
});

export default router;
