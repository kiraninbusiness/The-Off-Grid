import { Router } from 'express';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = Router();

/*
  ABANDONED CART RECOVERY

  This app has no background job scheduler running, so this endpoint
  is meant to be called on a schedule from outside the app — the
  simplest options:
    - Render Cron Job: hit this URL every hour
    - GitHub Actions scheduled workflow
    - Or just click the "Send now" button on this tab in Admin

  It emails anyone whose server-side cart (see cart.js) has sat
  untouched for 2+ hours and hasn't already been emailed about it.
  Protected by the same admin auth as everything else in /api/admin —
  for the external cron call, generate a personal admin JWT and pass
  it as a Bearer token, or wrap the call with your own secret if you'd
  rather not expose the token to the scheduler.
*/

router.post('/send', auth, admin, async (req, res) => {
  const hoursIdle = Number(req.body.hours_idle) || 2;

  const { rows: staleCarts } = await pool.query(
    `SELECT DISTINCT ci.user_id, u.email, u.name
     FROM cart_items ci
     JOIN users u ON u.id = ci.user_id
     WHERE ci.abandoned_email_sent = FALSE
       AND ci.updated_at < NOW() - ($1 || ' hours')::interval`,
    [hoursIdle]
  );

  let sent = 0;

  for (const row of staleCarts) {
    const { rows: items } = await pool.query(
      `SELECT ci.id, p.name, p.price, p.image
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1 AND ci.abandoned_email_sent = FALSE`,
      [row.user_id]
    );
    if (!items.length) continue;

    const itemList = items.map((i) => `<li>${i.name} — ₹${i.price}</li>`).join('');
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout`;

    await sendEmail({
      to: row.email,
      subject: 'You left something in your bag',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
          <div style="background:#111;color:#fff;padding:20px 24px;letter-spacing:1px"><strong>THE OFF GRID</strong></div>
          <div style="padding:24px;border:1px solid #eee;border-top:none">
            <h2 style="margin-top:0">Still thinking it over${row.name ? `, ${row.name}` : ''}?</h2>
            <p>These are still in your bag:</p>
            <ul>${itemList}</ul>
            <p><a href="${url}" style="background:#111;color:#fff;padding:12px 20px;text-decoration:none;display:inline-block">COMPLETE YOUR ORDER</a></p>
          </div>
        </div>
      `
    });

    await pool.query(
      'UPDATE cart_items SET abandoned_email_sent = TRUE WHERE user_id = $1',
      [row.user_id]
    );
    sent += 1;
  }

  res.json({ emails_sent: sent });
});

// GET /api/admin/abandoned-carts — preview who currently qualifies, without sending
router.get('/', auth, admin, async (req, res) => {
  const hoursIdle = Number(req.query.hours_idle) || 2;
  const { rows } = await pool.query(
    `SELECT u.name, u.email, COUNT(ci.id)::int AS item_count, MAX(ci.updated_at) AS last_updated
     FROM cart_items ci
     JOIN users u ON u.id = ci.user_id
     WHERE ci.abandoned_email_sent = FALSE
       AND ci.updated_at < NOW() - ($1 || ' hours')::interval
     GROUP BY u.id, u.name, u.email`,
    [hoursIdle]
  );
  res.json(rows);
});

export default router;
