import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = Router();

const AMOUNTS = [500, 1000, 2000, 5000];

function generateCode() {
  return 'OG-' + crypto.randomBytes(5).toString('hex').toUpperCase();
}

function giftCardEmail(card) {
  return {
    subject: 'Your THE OFF GRID gift card',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#111;color:#fff;padding:20px 24px;letter-spacing:1px"><strong>THE OFF GRID</strong></div>
        <div style="padding:24px;border:1px solid #eee;border-top:none">
          <h2 style="margin-top:0">You've received a gift card${card.recipient_name ? `, ${card.recipient_name}` : ''}!</h2>
          ${card.message ? `<p><em>"${card.message}"</em></p>` : ''}
          <p style="font-size:28px;letter-spacing:2px;background:#f5f5f5;padding:16px;text-align:center"><strong>${card.code}</strong></p>
          <p>Value: ₹${card.initial_value}</p>
          <p>Use this code at checkout on theoffgrid.in</p>
        </div>
      </div>
    `
  };
}

// GET /api/gift-cards/amounts — public, the denominations sold on the storefront
router.get('/amounts', (req, res) => res.json(AMOUNTS));

// POST /api/gift-cards/purchase — buy a gift card for someone (or yourself)
router.post('/purchase', auth, async (req, res) => {
  const { amount, recipient_email, recipient_name = '', message = '' } = req.body;

  if (!AMOUNTS.includes(Number(amount))) {
    return res.status(400).json({ message: `Gift card amount must be one of ₹${AMOUNTS.join(', ₹')}` });
  }
  if (!/^\S+@\S+\.\S+$/.test(String(recipient_email || ''))) {
    return res.status(400).json({ message: 'A valid recipient email is required' });
  }

  const code = generateCode();
  const { rows } = await pool.query(
    `INSERT INTO gift_cards (code, initial_value, balance, purchased_by, recipient_email, recipient_name, message)
     VALUES ($1,$2,$2,$3,$4,$5,$6) RETURNING *`,
    [code, Number(amount), req.user.id, recipient_email.trim().toLowerCase(), recipient_name.trim().slice(0, 100), message.trim().slice(0, 300)]
  );

  const card = rows[0];
  const { subject, html } = giftCardEmail(card);
  sendEmail({ to: card.recipient_email, subject, html }).catch(() => {});

  res.status(201).json(card);
});

// GET /api/gift-cards/mine — gift cards this user has purchased
router.get('/mine', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM gift_cards WHERE purchased_by = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

// POST /api/gift-cards/check — validate a code + see remaining balance (used at checkout)
router.post('/check', auth, async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const { rows } = await pool.query(
    'SELECT id, code, balance, active, expires_at FROM gift_cards WHERE code = $1',
    [code]
  );
  const card = rows[0];

  if (!card) return res.status(404).json({ message: 'Gift card not found' });
  if (!card.active) return res.status(400).json({ message: 'This gift card is no longer active' });
  if (card.expires_at && new Date(card.expires_at) < new Date()) {
    return res.status(400).json({ message: 'This gift card has expired' });
  }
  if (card.balance <= 0) return res.status(400).json({ message: 'This gift card has no remaining balance' });

  res.json({ code: card.code, balance: card.balance });
});

// GET /api/admin/gift-cards — admin: list all gift cards
router.get('/', auth, admin, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM gift_cards ORDER BY created_at DESC');
  res.json(rows);
});

export default router;
