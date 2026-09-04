import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db.js';
import { auth } from '../middleware/auth.js';
import { sendEmail, passwordResetEmail } from '../services/email.js';

const router = Router();

const tokenFor = (u) =>
  jwt.sign(
    {
      id: u.id,
      email: u.email,
      role: u.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );


// =====================================================
// REGISTER
// =====================================================

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, referral_code } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      password.length < 6
    ) {
      return res.status(400).json({
        message:
          'Name, email and 6+ character password are required'
      });
    }

    const hash = await bcrypt.hash(password, 12);

    /*
      REFERRAL LOOKUP
      If a valid referral code was provided, link
      the new account to whoever owns that code.
      Invalid/unknown codes are silently ignored
      rather than blocking registration.
    */
    let referredBy = null;

    if (referral_code) {
      const referrer = await pool.query(
        `SELECT id FROM users WHERE referral_code = $1`,
        [referral_code.trim().toUpperCase()]
      );

      referredBy = referrer.rows[0]?.id || null;
    }

    const myCode = crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()
      .slice(0, 6);

    const { rows } = await pool.query(
      `INSERT INTO users
        (name, email, password_hash, referral_code, referred_by)
       VALUES
        ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, referral_code`,
      [
        name,
        email.toLowerCase(),
        hash,
        myCode,
        referredBy
      ]
    );

    res.status(201).json({
      user: rows[0],
      token: tokenFor(rows[0])
    });

  } catch (e) {

    res.status(400).json({
      message:
        e.code === '23505'
          ? 'Email already registered'
          : 'Registration failed'
    });

  }
});


// =====================================================
// LOGIN
// =====================================================

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [
        email?.toLowerCase()
      ]
    );

    const u = rows[0];

    if (
      !u ||
      !(await bcrypt.compare(
        password || '',
        u.password_hash
      ))
    ) {

      return res.status(401).json({
        message: 'Invalid email or password'
      });

    }

    res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      },
      token: tokenFor(u)
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message: 'Login failed'
    });

  }

});


// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post('/forgot-password', async (req, res) => {

  try {

    const email = req.body.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    const { rows } = await pool.query(
      'SELECT id, name, email FROM users WHERE email=$1',
      [email]
    );

    const user = rows[0];

    /*
      We return the same message even when the email
      does not exist. This prevents people from
      discovering which emails have accounts.
    */

    if (!user) {

      return res.json({
        message:
          'If an account exists with this email, a password reset link has been sent.'
      });

    }

    // Generate secure random token
    const resetToken =
      crypto.randomBytes(32).toString('hex');

    // Token expires in 30 minutes
    const expires =
      new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET reset_token=$1,
           reset_token_expires=$2
       WHERE id=$3`,
      [
        resetToken,
        expires,
        user.id
      ]
    );

    /*
      Your frontend URL.
      Example:
      https://theoffgrid.vercel.app
    */

    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:5173';

    const resetLink =
      `${frontendUrl}/reset-password?token=${resetToken}`;

    /*
      EMAIL SENDING
      Sends the reset link via SMTP if configured (see
      server/src/services/email.js). If SMTP isn't configured yet,
      the link is printed to the server console instead, so the flow
      still works end-to-end in development.
    */
    const { subject, html } = passwordResetEmail(resetLink);
    await sendEmail({ to: user.email, subject, html });

    res.json({
      message:
        'If an account exists with this email, a password reset link has been sent.'
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message:
        'Could not process password reset request'
    });

  }

});


// =====================================================
// RESET PASSWORD
// =====================================================

router.post('/reset-password', async (req, res) => {

  try {

    const {
      token,
      password
    } = req.body;

    if (!token || !password) {

      return res.status(400).json({
        message:
          'Reset token and new password are required'
      });

    }

    if (password.length < 6) {

      return res.status(400).json({
        message:
          'Password must be at least 6 characters'
      });

    }

    const { rows } = await pool.query(
      `SELECT *
       FROM users
       WHERE reset_token=$1
       AND reset_token_expires > NOW()`,
      [token]
    );

    const user = rows[0];

    if (!user) {

      return res.status(400).json({
        message:
          'This password reset link is invalid or has expired'
      });

    }

    const hash =
      await bcrypt.hash(password, 12);

    await pool.query(
      `UPDATE users
       SET password_hash=$1,
           reset_token=NULL,
           reset_token_expires=NULL
       WHERE id=$2`,
      [
        hash,
        user.id
      ]
    );

    res.json({
      message:
        'Password changed successfully. You can now login.'
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message:
        'Could not reset password'
    });

  }

});


// =====================================================
// CURRENT USER (with loyalty points)
// =====================================================

router.get('/me', auth, async (req, res) => {

  const { rows } = await pool.query(
    `SELECT id, name, email, role, loyalty_points, referral_code
     FROM users
     WHERE id = $1`,
    [req.user.id]
  );

  if (!rows.length) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  const referralsResult = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM users
     WHERE referred_by = $1`,
    [req.user.id]
  );

  res.json({
    ...rows[0],
    referral_count: referralsResult.rows[0].count
  });
});

/*
  PATCH /api/auth/me — edit profile (name/email) and/or change password
  in one endpoint. Password change requires the current password.
*/
router.patch('/me', auth, async (req, res) => {
  const { name, email, current_password, new_password } = req.body;

  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = userResult.rows[0];
  if (!user) return res.status(404).json({ message: 'User not found' });

  const sets = [];
  const values = [];

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) return res.status(400).json({ message: 'Name cannot be empty' });
    values.push(trimmed);
    sets.push(`name = $${values.length}`);
  }

  if (email !== undefined) {
    const trimmed = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) return res.status(400).json({ message: 'Enter a valid email' });
    if (trimmed !== user.email) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [trimmed, user.id]);
      if (existing.rows.length) return res.status(409).json({ message: 'That email is already in use' });
    }
    values.push(trimmed);
    sets.push(`email = $${values.length}`);
  }

  if (new_password) {
    if (!current_password || !(await bcrypt.compare(current_password, user.password_hash))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    if (String(new_password).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    values.push(await bcrypt.hash(new_password, 12));
    sets.push(`password_hash = $${values.length}`);
  }

  if (!sets.length) return res.status(400).json({ message: 'Nothing to update' });

  values.push(req.user.id);
  const { rows } = await pool.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${values.length}
     RETURNING id, name, email, role, loyalty_points, referral_code`,
    values
  );

  res.json(rows[0]);
});

/*
  DELETE /api/auth/me — self-service account deletion.
  Requires the current password as confirmation. Orders are kept for
  accounting/tax records (user_id set NULL rather than cascading
  delete) — everything personal to the account (addresses, wishlist,
  cart, reviews, sessions) is removed.
*/
router.delete('/me', auth, async (req, res) => {
  const { password } = req.body;

  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = userResult.rows[0];
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!password || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE orders SET user_id = NULL WHERE user_id = $1', [req.user.id]);
    await client.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('ACCOUNT DELETE ERROR:', e.message);
    res.status(500).json({ message: 'Could not delete account. Some orders or records may still reference it.' });
  } finally {
    client.release();
  }
});


export default router;
