import { Router } from 'express';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';
import { notifyRestock } from './variants.js';

const router = Router();

/*
  GET /api/products
  Lists products with optional filters — this endpoint powers the shop
  grid, search, and category/color/fit filters on the storefront.
  Query params (all optional): category, gender, color, fit, q (search),
  sort (price_asc | price_high | name | newest), min, max.
*/
router.get('/', async (req, res) => {
  try {
    const { category, gender, color, fit, q, sort, min, max } = req.query;
    const where = [];
    const values = [];

    if (category && category.toUpperCase() !== 'ALL') {
      values.push(category);
      where.push(`LOWER(category) = LOWER($${values.length})`);
    }
    if (gender && gender.toUpperCase() !== 'ALL') {
      values.push(gender);
      where.push(`LOWER(gender) = LOWER($${values.length})`);
    }
    if (color) {
      values.push(color);
      where.push(`LOWER(color) = LOWER($${values.length})`);
    }
    if (fit) {
      values.push(fit);
      where.push(`LOWER(fit) = LOWER($${values.length})`);
    }
    if (q) {
      values.push(`%${q}%`);
      where.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length} OR category ILIKE $${values.length})`);
    }
    if (min) {
      values.push(Number(min));
      where.push(`price >= $${values.length}`);
    }
    if (max) {
      values.push(Number(max));
      where.push(`price <= $${values.length}`);
    }

    let orderBy = 'created_at DESC';
    if (sort === 'price_asc') orderBy = 'price ASC';
    else if (sort === 'price_high') orderBy = 'price DESC';
    else if (sort === 'name') orderBy = 'name ASC';
    else if (sort === 'newest') orderBy = 'created_at DESC';

    const sql = `
      SELECT p.*,
        COALESCE(
          (SELECT json_agg(v ORDER BY v.size, v.color) FROM product_variants v WHERE v.product_id = p.id),
          '[]'
        ) AS variants
      FROM products p
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}
    `;
    const { rows } = await pool.query(sql, values);
    res.json(rows);
  } catch (e) {
    console.error('GET /products failed:', e);
    res.status(500).json({ message: 'Unable to load products' });
  }
});

// GET /api/products/:id — single product detail
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
        COALESCE(
          (SELECT json_agg(v ORDER BY v.size, v.color) FROM product_variants v WHERE v.product_id = p.id),
          '[]'
        ) AS variants
       FROM products p WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET /products/:id failed:', e);
    res.status(500).json({ message: 'Unable to load product' });
  }
});

// POST /api/products — create (admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const {
      name, description = '', category, gender = 'Unisex', size,
      condition = 'New Arrival', price, old_price = null, image,
      images = [], stock = 1, color = null, fit = null
    } = req.body;

    if (!name || !category || !size || !price || !image) {
      return res.status(400).json({ message: 'name, category, size, price and image are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO products
        (name, description, category, gender, size, condition, price, old_price, image, images, stock, color, fit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [name, description, category, gender, size, condition, Number(price), old_price ? Number(old_price) : null,
        image, Array.isArray(images) ? images : [], Number(stock) || 0, color, fit]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('POST /products failed:', e);
    res.status(500).json({ message: 'Unable to create product' });
  }
});

// PATCH /api/products/:id — update (admin only)
router.patch('/:id', auth, admin, async (req, res) => {
  try {
    const fields = ['name', 'description', 'category', 'gender', 'size', 'condition', 'price', 'old_price', 'image', 'images', 'stock', 'color', 'fit'];
    const sets = [];
    const values = [];

    const before = await pool.query('SELECT stock FROM products WHERE id = $1', [req.params.id]);
    const wasOut = before.rows.length && Number(before.rows[0].stock) === 0;

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        values.push(field === 'images' ? (Array.isArray(req.body.images) ? req.body.images : []) : req.body[field]);
        sets.push(`${field} = $${values.length}`);
      }
    }

    if (!sets.length) return res.status(400).json({ message: 'No fields to update' });

    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!rows.length) return res.status(404).json({ message: 'Product not found' });

    // Product came back in stock — notify anyone on the waitlist (fire and forget)
    if (wasOut && Number(rows[0].stock) > 0) {
      notifyRestock(rows[0].id).catch((e) => console.error('restock notify failed:', e.message));
    }

    res.json(rows[0]);
  } catch (e) {
    console.error('PATCH /products/:id failed:', e);
    res.status(500).json({ message: 'Unable to update product' });
  }
});

// DELETE /api/products/:id — remove (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /products/:id failed:', e);
    res.status(500).json({ message: 'Unable to delete product' });
  }
});

// POST /api/products/:id/notify — "notify me" waitlist for out-of-stock items
router.post('/:id/notify', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Invalid email' });

    const { rows } = await pool.query('SELECT id, name FROM products WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });

    await pool.query(
      `CREATE TABLE IF NOT EXISTS stock_alerts(
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(product_id, email)
      )`
    );
    await pool.query(
      `INSERT INTO stock_alerts (product_id, email) VALUES ($1,$2)
       ON CONFLICT (product_id, email) DO NOTHING`,
      [req.params.id, email]
    );

    res.json({ success: true });
  } catch (e) {
    console.error('POST /products/:id/notify failed:', e);
    res.status(500).json({ message: 'Unable to save alert' });
  }
});

export default router;
