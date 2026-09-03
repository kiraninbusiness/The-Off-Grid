import { Router } from 'express';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';
import { sendEmail, backInStockEmail } from '../services/email.js';

const router = Router();

/*
  SKU-LEVEL VARIANT INVENTORY

  A product can optionally have rows in product_variants (size + color
  combination -> stock). When a product has no variants, order placement
  falls back to the old products.stock behaviour — so this is fully
  backward compatible with the existing 12-product catalogue.
*/

// GET /api/products/:id/variants — public
router.get('/:id/variants', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY size, color',
    [req.params.id]
  );
  res.json(rows);
});

// PUT /api/products/:id/variants — admin: replace the full variant set for a product
router.put('/:id/variants', auth, admin, async (req, res) => {
  const productId = req.params.id;
  const variants = Array.isArray(req.body.variants) ? req.body.variants : [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const product = await client.query('SELECT id FROM products WHERE id = $1 FOR UPDATE', [productId]);
    if (!product.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Product not found' });
    }

    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);

    const inserted = [];
    for (const v of variants) {
      const size = String(v.size || '').trim();
      const color = String(v.color || '').trim();
      const stock = Math.max(0, Number(v.stock) || 0);
      if (!size) continue;
      const { rows } = await client.query(
        `INSERT INTO product_variants (product_id, size, color, stock)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (product_id, size, color) DO UPDATE SET stock = EXCLUDED.stock
         RETURNING *`,
        [productId, size, color, stock]
      );
      inserted.push(rows[0]);
    }

    // Keep the legacy products.stock column in sync (sum of variant stock)
    // so anywhere that still reads product.stock (cards, filters) stays accurate.
    const total = inserted.reduce((sum, v) => sum + Number(v.stock), 0);
    await client.query('UPDATE products SET stock = $1 WHERE id = $2', [total, productId]);

    await client.query('COMMIT');
    res.json(inserted);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('PUT variants failed:', e.message);
    res.status(400).json({ message: 'Could not save variants' });
  } finally {
    client.release();
  }
});

// PATCH /api/products/:id/variants/:variantId — admin: update stock for one SKU (e.g. restock)
router.patch('/:id/variants/:variantId', auth, admin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const before = await client.query(
      'SELECT * FROM product_variants WHERE id = $1 AND product_id = $2 FOR UPDATE',
      [req.params.variantId, req.params.id]
    );
    if (!before.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Variant not found' });
    }

    const newStock = Math.max(0, Number(req.body.stock) || 0);
    const wasOut = Number(before.rows[0].stock) === 0;

    const { rows } = await client.query(
      'UPDATE product_variants SET stock = $1 WHERE id = $2 RETURNING *',
      [newStock, req.params.variantId]
    );

    const totalResult = await client.query(
      'SELECT COALESCE(SUM(stock),0)::int AS total FROM product_variants WHERE product_id = $1',
      [req.params.id]
    );
    await client.query('UPDATE products SET stock = $1 WHERE id = $2', [totalResult.rows[0].total, req.params.id]);

    await client.query('COMMIT');

    // Restock notification — fire and forget
    if (wasOut && newStock > 0) {
      notifyRestock(req.params.id).catch((e) => console.error('restock notify failed:', e.message));
    }

    res.json(rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('PATCH variant failed:', e.message);
    res.status(400).json({ message: 'Could not update variant' });
  } finally {
    client.release();
  }
});

export async function notifyRestock(productId) {
  const product = await pool.query('SELECT id, name FROM products WHERE id = $1', [productId]);
  if (!product.rows.length) return;

  const alerts = await pool.query(
    'SELECT id, email FROM stock_alerts WHERE product_id = $1 AND notified = FALSE',
    [productId]
  );
  if (!alerts.rows.length) return;

  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${productId}`;
  const { subject, html } = backInStockEmail(product.rows[0].name, url);

  for (const alert of alerts.rows) {
    await sendEmail({ to: alert.email, subject, html });
    await pool.query('UPDATE stock_alerts SET notified = TRUE WHERE id = $1', [alert.id]);
  }
}

export default router;
