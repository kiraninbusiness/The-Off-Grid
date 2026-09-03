import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initDb(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products(
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT NOT NULL,
      gender TEXT DEFAULT 'Unisex',
      size TEXT NOT NULL,
      condition TEXT DEFAULT 'Excellent',
      price INTEGER NOT NULL,
      old_price INTEGER,
      image TEXT NOT NULL,
      images TEXT[] DEFAULT '{}',
      stock INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders(
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL DEFAULT 'cod',
      razorpay_order_id TEXT,
      total INTEGER NOT NULL,
      shipping_name TEXT,
      shipping_phone TEXT,
      shipping_address TEXT,
      shipping_email TEXT,
      shipping_city TEXT,
      shipping_state TEXT,
      shipping_pincode TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items(
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      selected_size TEXT,
      selected_color TEXT
    );
    CREATE TABLE IF NOT EXISTS reviews(
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT DEFAULT '',
      verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(product_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS newsletter_subscribers(
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod'");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_email TEXT");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state TEXT");
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode TEXT");
  await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'");
  await pool.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_size TEXT");
  await pool.query("ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selected_color TEXT");
  await pool.query("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN NOT NULL DEFAULT FALSE");
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_token TEXT,
    ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS referral_bonus_given BOOLEAN NOT NULL DEFAULT FALSE
  `);
  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS points_earned INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS points_redeemed INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN NOT NULL DEFAULT FALSE
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupons(
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'percent',
      value INTEGER NOT NULL,
      min_order INTEGER NOT NULL DEFAULT 0,
      max_discount INTEGER,
      usage_limit INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT, ADD COLUMN IF NOT EXISTS coupon_discount INTEGER NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT, ADD COLUMN IF NOT EXISTS fit TEXT`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customer_addresses(
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT NOT NULL DEFAULT 'HOME',
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS customer_addresses_user_idx ON customer_addresses(user_id);
  `);
  // Stock alerts ("notify me when back in stock")
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock_alerts(
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      notified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(product_id, email)
    );
  `);
  await pool.query("ALTER TABLE stock_alerts ADD COLUMN IF NOT EXISTS notified BOOLEAN NOT NULL DEFAULT FALSE");

  // Returns / exchanges
  await pool.query(`
    CREATE TABLE IF NOT EXISTS returns(
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      order_item_id INTEGER REFERENCES order_items(id) ON DELETE SET NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'return',
      reason TEXT NOT NULL DEFAULT '',
      exchange_size TEXT,
      exchange_color TEXT,
      status TEXT NOT NULL DEFAULT 'requested',
      refund_amount INTEGER,
      admin_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS returns_user_idx ON returns(user_id);
    CREATE INDEX IF NOT EXISTS returns_order_idx ON returns(order_id);
  `);

  // Review moderation
  await pool.query("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE");

  // Delivery timestamp — needed for return-window calculations
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ");

  // SKU-level variant inventory (size + color combination stock)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_variants(
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      size TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(product_id, size, color)
    );
    CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id);
  `);

  await pool.query(`UPDATE users SET referral_code = UPPER(SUBSTRING(MD5(id::text || RANDOM()::text) FOR 6)) WHERE referral_code IS NULL`);
  if(process.env.ADMIN_EMAIL){ await pool.query("UPDATE users SET role='admin' WHERE email=$1",[process.env.ADMIN_EMAIL.toLowerCase()]); }
  const {rows}=await pool.query('SELECT COUNT(*)::int AS count FROM products');
  if(rows[0].count===0){
    await pool.query(`INSERT INTO products
      (name,description,category,gender,size,condition,price,old_price,image,stock,color,fit)
      VALUES
      ('ZENITH OVERSIZED TEE','Heavyweight oversized cotton tee designed for everyday wear.','T-SHIRTS','UNISEX','S / M / L / XL','NEW',1599,1999,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',12,'CHARCOAL','OVERSIZED'),
      ('LUNA LINEN SHIRT','Relaxed linen shirt with a clean silhouette and lightweight feel.','SHIRTS','UNISEX','S / M / L / XL','NEW',2499,2999,'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=90',8,'OFF WHITE','RELAXED'),
      ('TERRA CARGO PANTS','Utility-inspired cargo pants with a relaxed streetwear fit.','BOTTOMS','UNISEX','28 / 30 / 32 / 34 / 36','NEW',2799,3299,'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=90',10,'OLIVE','RELAXED'),
      ('SIGNATURE HOODIE','Premium heavyweight hoodie with an oversized silhouette.','HOODIES','UNISEX','S / M / L / XL','BESTSELLER',3299,3999,'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90',15,'BONE','OVERSIZED'),
      ('RAYON BOMBER JACKET','Minimal bomber jacket with a structured modern silhouette.','JACKETS','UNISEX','S / M / L / XL','NEW',3999,4999,'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=90',6,'BLACK','REGULAR'),
      ('CLASSIC OFF GRID CAP','Minimal six-panel cap finished with The Off Grid branding.','ACCESSORIES','UNISEX','ONE SIZE','NEW',999,1299,'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=90',20,'BLACK','ADJUSTABLE'),
      ('CORE RIBBED TANK','Clean ribbed tank designed for layering or standalone wear.','TANK TOPS','UNISEX','S / M / L / XL','NEW',1299,1599,'https://images.unsplash.com/photo-1618354691373-d851c5c3c990?auto=format&fit=crop&w=1200&q=90',14,'BLACK','SLIM'),
      ('GRID RUNNER SNEAKERS','Everyday sneakers built around a clean technical streetwear aesthetic.','FOOTWEAR','UNISEX','6 / 7 / 8 / 9 / 10 / 11','NEW',4499,5499,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90',9,'WHITE / GREY','REGULAR'),
      ('SHADOW UTILITY VEST','Utility vest with multiple pockets and a contemporary streetwear cut.','JACKETS','UNISEX','S / M / L / XL','NEW',2899,3499,'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=90',7,'GRAPHITE','RELAXED'),
      ('MONOCHROME OVERSHIRT','Structured overshirt designed to work as a light outer layer.','SHIRTS','UNISEX','S / M / L / XL','NEW',2699,3199,'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=1200&q=90',11,'GREY','RELAXED'),
      ('VOID WIDE LEG DENIM','Wide-leg denim with a relaxed profile and washed finish.','BOTTOMS','UNISEX','28 / 30 / 32 / 34 / 36','NEW',2999,3699,'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=90',8,'WASHED BLACK','WIDE LEG'),
      ('NIGHT SHIFT TEE','Relaxed everyday tee with a vintage-inspired washed finish.','T-SHIRTS','UNISEX','S / M / L / XL','BESTSELLER',1499,1899,'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=90',18,'WASHED BLACK','OVERSIZED')
    `);
  }
}
if(process.argv[1]?.endsWith('src/db.js')) initDb().then(()=>{console.log('Database ready');process.exit()}).catch(e=>{console.error(e);process.exit(1)});
