import { Router } from 'express';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = Router();

/*
  ABANDONED CART RECOVERY

  This runs three ways, from least to most "automatic":
    1. Admin dashboard "Send Now" button -> POST /send (admin JWT)
    2. An external scheduler (Render Cron, GitHub Actions, etc.) hitting
       POST /cron-send with a dedicated x-cron-secret header — no admin
       JWT needs to be embedded in a scheduler config for this.
    3. An optional built-in interval timer (see startAbandonedCartScheduler
       below, started from server.js) for always-on deployments.

  Note on #3: setInterval only works for as long as the Node process
  stays alive. On a platform that spins the service down when idle
  (e.g. Render's free tier), the timer dies with it and simply won't
  fire until the next request wakes the process back up — which is
  exactly why #2 (an external scheduler hitting a real HTTP endpoint)
  is the more reliable option for anything other than an always-on
  instance. Both are provided; use whichever fits your deployment.
*/

async function runAbandonedCartSweep(hoursIdle = 2) {
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

  return sent;
}

// Optional in-process scheduler for always-on deployments. Opt-in via
// env — off by default so it doesn't surprise anyone relying on the
// external-cron approach instead.
export function startAbandonedCartScheduler() {
  if (process.env.ENABLE_ABANDONED_CART_CRON !== 'true') return;
  const hours = Number(process.env.ABANDONED_CART_INTERVAL_HOURS) || 1;
  const idleHours = Number(process.env.ABANDONED_CART_IDLE_HOURS) || 2;
  console.log(`Abandoned-cart scheduler enabled: sweeping every ${hours}h for carts idle ${idleHours}h+`);
  setInterval(() => {
    runAbandonedCartSweep(idleHours)
      .then((sent) => sent && console.log(`Abandoned-cart sweep: ${sent} email(s) sent`))
      .catch((e) => console.error('Abandoned-cart sweep failed:', e.message));
  }, hours * 60 * 60 * 1000);
}

router.post('/send', auth, admin, async (req, res) => {
  const sent = await runAbandonedCartSweep(Number(req.body.hours_idle) || 2);
  res.json({ emails_sent: sent });
});

/*
  POST /api/admin/abandoned-carts/cron-send
  For external schedulers — authenticated with a long-lived secret
  instead of a personal admin JWT, so a scheduler config never needs
  to hold real login credentials. Set CRON_SECRET in your env and send
  it as the x-cron-secret header from Render Cron / GitHub Actions /etc.
*/
router.post('/cron-send', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return res.status(503).json({ message: 'CRON_SECRET is not configured on the server' });
  }
  const provided = req.headers['x-cron-secret'];
  if (provided !== secret) {
    return res.status(401).json({ message: 'Invalid cron secret' });
  }
  const sent = await runAbandonedCartSweep(Number(req.body?.hours_idle) || 2);
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
