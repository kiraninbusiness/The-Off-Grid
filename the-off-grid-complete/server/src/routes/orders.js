import { Router } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { pool } from '../db.js';
import { auth, admin } from '../middleware/auth.js';

const router = Router();


/*
  AWARD LOYALTY POINTS
  1 point per ₹100 spent, based on the amount
  actually paid (after any discount).
  Guarded by points_awarded so it can never
  run twice for the same order.
*/
async function awardLoyaltyPoints(client, orderId) {

  const orderResult = await client.query(
    `SELECT id, user_id, total
     FROM orders
     WHERE id = $1
       AND points_awarded = FALSE
     FOR UPDATE`,
    [orderId]
  );

  if (!orderResult.rows.length) return;

  const order = orderResult.rows[0];
  const points = Math.floor(Number(order.total) / 100);

  if (points <= 0) {
    await client.query(
      `UPDATE orders SET points_awarded = TRUE WHERE id = $1`,
      [orderId]
    );
    return;
  }

  await client.query(
    `UPDATE users
     SET loyalty_points = loyalty_points + $1
     WHERE id = $2`,
    [points, order.user_id]
  );

  await client.query(
    `UPDATE orders
     SET points_earned = $1, points_awarded = TRUE
     WHERE id = $2`,
    [points, orderId]
  );


  /*
    REFERRAL BONUS
    The first time a referred user's order earns
    them points, their referrer gets a one-time
    ₹100 (100 point) bonus. Guarded by
    referral_bonus_given so it can only ever fire
    once per referred user.
  */
  const referredUser = await client.query(
    `SELECT referred_by, referral_bonus_given
     FROM users
     WHERE id = $1
     FOR UPDATE`,
    [order.user_id]
  );

  const referredBy = referredUser.rows[0]?.referred_by;
  const bonusAlreadyGiven =
    referredUser.rows[0]?.referral_bonus_given;

  if (referredBy && !bonusAlreadyGiven) {

    const REFERRAL_BONUS = 100;

    await client.query(
      `UPDATE users
       SET loyalty_points = loyalty_points + $1
       WHERE id = $2`,
      [REFERRAL_BONUS, referredBy]
    );

    await client.query(
      `UPDATE users
       SET referral_bonus_given = TRUE
       WHERE id = $1`,
      [order.user_id]
    );
  }
}


/*
  CREATE ORDER
*/
router.post('/create', auth, async (req, res) => {
  const {
    items = [],
    shipping = {},
    payment_method = 'cod',
    redeem_points = 0
  } = req.body;

  if (!['cod', 'online'].includes(payment_method)) {
    return res.status(400).json({
      message: 'Invalid payment method'
    });
  }

  if (!items.length) {
    return res.status(400).json({
      message: 'Cart is empty'
    });
  }

  /*
    ONLINE PAYMENT REQUIRES RAZORPAY
  */
  if (
    payment_method === 'online' &&
    (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    )
  ) {
    return res.status(503).json({
      message:
        'Online payment is currently unavailable. Please choose Cash on Delivery.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    /*
      GET PRODUCTS AND LOCK THEIR ROWS
      This prevents stock problems when multiple
      customers try to buy the same product.
    */
    const ids = items.map((x) => Number(x.productId));

    const { rows } = await client.query(
      `SELECT *
       FROM products
       WHERE id = ANY($1::int[])
       FOR UPDATE`,
      [ids]
    );

    const byId = Object.fromEntries(
      rows.map((p) => [p.id, p])
    );

    /*
      CALCULATE SUBTOTAL
    */
    let subtotal = 0;

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      const p = byId[productId];

      if (!p) {
        throw new Error(
          `Product ${productId} not found`
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error(
          `Invalid quantity for product ${productId}`
        );
      }

      if (quantity > Number(p.stock)) {
        throw new Error(
          `Only ${p.stock} available for ${p.name}`
        );
      }

      subtotal +=
        Number(p.price) * quantity;
    }

    /*
      SHIPPING
      Free above ₹1,499
      Otherwise ₹79
    */
    const shippingCharge =
      subtotal >= 1499 ? 0 : 79;


    /*
      LOYALTY POINTS REDEMPTION
      1 point = ₹1. Can't redeem more points
      than the user has, and can't discount
      more than the subtotal itself.
    */
    const userResult = await client.query(
      `SELECT loyalty_points
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [req.user.id]
    );

    const userPoints =
      Number(userResult.rows[0]?.loyalty_points) || 0;

    const pointsToRedeem = Math.max(
      0,
      Math.min(
        Math.floor(Number(redeem_points) || 0),
        userPoints,
        subtotal
      )
    );

    const discount = pointsToRedeem;

    const total =
      subtotal + shippingCharge - discount;

    if (pointsToRedeem > 0) {
      await client.query(
        `UPDATE users
         SET loyalty_points = loyalty_points - $1
         WHERE id = $2`,
        [pointsToRedeem, req.user.id]
      );
    }


    /*
      CREATE DATABASE ORDER
    */
    const order = (
      await client.query(
        `INSERT INTO orders(
          user_id,
          total,
          shipping_name,
          shipping_phone,
          shipping_address,
          payment_method,
          discount,
          points_redeemed
        )
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *`,
        [
          req.user.id,
          total,
          shipping.name || '',
          shipping.phone || '',
          shipping.address || '',
          payment_method,
          discount,
          pointsToRedeem
        ]
      )
    ).rows[0];


    /*
      CREATE ORDER ITEMS
      AND RESERVE STOCK
    */
    for (const item of items) {
      const productId =
        Number(item.productId);

      const quantity =
        Number(item.quantity);

      const p = byId[productId];

      await client.query(
        `INSERT INTO order_items(
          order_id,
          product_id,
          name,
          price,
          quantity
        )
        VALUES($1,$2,$3,$4,$5)`,
        [
          order.id,
          p.id,
          p.name,
          p.price,
          quantity
        ]
      );

      /*
        Reserve stock immediately.

        If online payment is cancelled or fails,
        the stock will be restored by the
        payment-cancel endpoint below.
      */
      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [
          quantity,
          p.id
        ]
      );
    }


    /*
      RAZORPAY ORDER
    */
    if (payment_method === 'online') {

      const rzp = new Razorpay({
        key_id:
          process.env.RAZORPAY_KEY_ID,

        key_secret:
          process.env.RAZORPAY_KEY_SECRET
      });

      const rOrder =
        await rzp.orders.create({
          amount:
            Math.round(total * 100),

          currency: 'INR',

          receipt:
            `order_${order.id}`
        });


      await client.query(
        `UPDATE orders
         SET razorpay_order_id = $1
         WHERE id = $2`,
        [
          rOrder.id,
          order.id
        ]
      );

      order.razorpay_order_id =
        rOrder.id;
    }


    await client.query('COMMIT');


    res.status(201).json({
      order
    });

  } catch (e) {

    await client.query('ROLLBACK');

    console.error(
      'ORDER CREATE ERROR:',
      e.message
    );

    res.status(400).json({
      message:
        e.message ||
        'Could not create order'
    });

  } finally {
    client.release();
  }
});


/*
  CUSTOMER — MY ORDERS
*/
router.get('/mine', auth, async (req, res) => {

  const { rows } =
    await pool.query(
      `SELECT *
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

  if (!rows.length) {
    return res.json(rows);
  }

  const orderIds = rows.map((o) => o.id);

  const itemsResult = await pool.query(
    `SELECT order_id, product_id, name, price, quantity
     FROM order_items
     WHERE order_id = ANY($1::int[])`,
    [orderIds]
  );

  const itemsByOrder = {};

  for (const item of itemsResult.rows) {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = [];
    }
    itemsByOrder[item.order_id].push(item);
  }

  const withItems = rows.map((order) => ({
    ...order,
    items: itemsByOrder[order.id] || []
  }));

  res.json(withItems);
});


/*
  CUSTOMER — CANCEL OWN ORDER
  AND RESTORE PRODUCT STOCK

  This is for normal pending COD orders.
*/
router.patch(
  '/:id/cancel',
  auth,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      await client.query('BEGIN');


      const orderResult =
        await client.query(
          `SELECT *
           FROM orders
           WHERE id = $1
             AND user_id = $2
             AND status = 'pending'
             AND payment_method = 'cod'
           FOR UPDATE`,
          [
            req.params.id,
            req.user.id
          ]
        );


      if (!orderResult.rows.length) {

        await client.query(
          'ROLLBACK'
        );

        return res.status(400).json({
          message:
            'This order cannot be cancelled.'
        });
      }


      const order =
        orderResult.rows[0];


      const itemsResult =
        await client.query(
          `SELECT
             product_id,
             quantity
           FROM order_items
           WHERE order_id = $1`,
          [order.id]
        );


      /*
        RESTORE STOCK
      */
      for (
        const item
        of itemsResult.rows
      ) {

        await client.query(
          `UPDATE products
           SET stock = stock + $1
           WHERE id = $2`,
          [
            Number(item.quantity),
            Number(item.product_id)
          ]
        );
      }


      /*
        CANCEL ORDER
      */
      const updatedResult =
        await client.query(
          `UPDATE orders
           SET status = 'cancelled'
           WHERE id = $1
           RETURNING *`,
          [order.id]
        );


      await client.query(
        'COMMIT'
      );


      res.json({
        message:
          'Order cancelled successfully',

        order:
          updatedResult.rows[0]
      });

    } catch (e) {

      await client.query(
        'ROLLBACK'
      );

      console.error(
        'CANCEL ORDER ERROR:',
        e.message
      );

      res.status(500).json({
        message:
          'Could not cancel order'
      });

    } finally {
      client.release();
    }
  }
);


/*
  ONLINE PAYMENT — CANCEL / FAILED
  RESTORE PRODUCT STOCK

  This endpoint is intentionally separate
  from the normal customer cancellation route.

  It can only cancel:
  - the customer's own order
  - online payment orders
  - unpaid orders
  - orders that are not already cancelled

  Because the row is locked inside a transaction,
  calling this endpoint twice will NOT restore
  the stock twice.
*/
router.patch(
  '/:id/payment-cancel',
  auth,
  async (req, res) => {

    const client =
      await pool.connect();

    try {

      await client.query(
        'BEGIN'
      );


      const orderResult =
        await client.query(
          `SELECT *
           FROM orders
           WHERE id = $1
             AND user_id = $2
             AND payment_method = 'online'
             AND payment_status <> 'paid'
             AND status <> 'cancelled'
           FOR UPDATE`,
          [
            req.params.id,
            req.user.id
          ]
        );


      /*
        If no order was found, it may already
        have been cancelled.

        This also prevents double stock restoration.
      */
      if (!orderResult.rows.length) {

        await client.query(
          'ROLLBACK'
        );

        return res.json({
          message:
            'Order already cancelled or payment completed.'
        });
      }


      const order =
        orderResult.rows[0];


      /*
        GET ORDER ITEMS
      */
      const itemsResult =
        await client.query(
          `SELECT
             product_id,
             quantity
           FROM order_items
           WHERE order_id = $1`,
          [order.id]
        );


      /*
        RESTORE STOCK
      */
      for (
        const item
        of itemsResult.rows
      ) {

        await client.query(
          `UPDATE products
           SET stock = stock + $1
           WHERE id = $2`,
          [
            Number(item.quantity),
            Number(item.product_id)
          ]
        );
      }


      /*
        CANCEL ORDER
      */
      const updatedResult =
        await client.query(
          `UPDATE orders
           SET status = 'cancelled'
           WHERE id = $1
           RETURNING *`,
          [order.id]
        );


      await client.query(
        'COMMIT'
      );


      res.json({
        message:
          'Unpaid order cancelled successfully',

        order:
          updatedResult.rows[0]
      });

    } catch (e) {

      await client.query(
        'ROLLBACK'
      );

      console.error(
        'PAYMENT CANCEL ERROR:',
        e.message
      );

      res.status(500).json({
        message:
          'Could not cancel unpaid order'
      });

    } finally {
      client.release();
    }
  }
);


/*
  ADMIN — ALL ORDERS
*/
router.get(
  '/',
  auth,
  admin,
  async (req, res) => {

    const { rows } =
      await pool.query(
        `SELECT
           o.*,
           u.name,
           u.email
         FROM orders o
         JOIN users u
           ON u.id = o.user_id
         ORDER BY o.created_at DESC`
      );

    res.json(rows);
  }
);


/*
  ADMIN — UPDATE ORDER STATUS
*/
router.patch(
  '/:id/status',
  auth,
  admin,
  async (req, res) => {

    const {
      status,
      payment_status
    } = req.body;


    const { rows } =
      await pool.query(
        `UPDATE orders
         SET
           status =
             COALESCE($1, status),

           payment_status =
             COALESCE(
               $2,
               payment_status
             )

         WHERE id = $3

         RETURNING *`,
        [
          status,
          payment_status,
          req.params.id
        ]
      );


    if (!rows.length) {
      return res.status(404).json({
        message:
          'Order not found'
      });
    }


    /*
      Award points for COD orders once they're
      actually delivered. Online orders already
      get points at payment verification.
    */
    if (
      status === 'delivered' &&
      rows[0].payment_method === 'cod'
    ) {

      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        await awardLoyaltyPoints(client, rows[0].id);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('POINTS AWARD ERROR:', e.message);
      } finally {
        client.release();
      }
    }


    res.json(
      rows[0]
    );
  }
);


/*
  RAZORPAY PAYMENT VERIFICATION
*/
router.post(
  '/verify-payment',
  auth,
  async (req, res) => {

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;


    if (
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(503).json({
        message:
          'Razorpay is not configured'
      });
    }


    /*
      Get the customer's order
    */
    const orderResult =
      await pool.query(
        `SELECT *
         FROM orders
         WHERE id = $1
           AND user_id = $2`,
        [
          orderId,
          req.user.id
        ]
      );


    if (!orderResult.rows.length) {
      return res.status(404).json({
        message:
          'Order not found'
      });
    }


    const order =
      orderResult.rows[0];


    /*
      Make sure the Razorpay order matches
      our database order.
    */
    if (
      order.razorpay_order_id !==
      razorpay_order_id
    ) {
      return res.status(400).json({
        message:
          'Razorpay order mismatch'
      });
    }


    /*
      If payment was already verified,
      simply return the order.
    */
    if (
      order.payment_status === 'paid'
    ) {
      return res.json(
        order
      );
    }


    /*
      CREATE EXPECTED SIGNATURE
    */
    const expected =
      crypto
        .createHmac(
          'sha256',
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest('hex');


    /*
      VERIFY SIGNATURE
    */
    if (
      expected !==
      razorpay_signature
    ) {

      return res.status(400).json({
        message:
          'Invalid payment signature'
      });
    }


    /*
      MARK PAYMENT AS PAID
    */
    const { rows } =
      await pool.query(
        `UPDATE orders
         SET
           payment_status = 'paid',
           status = 'processing'
         WHERE id = $1
           AND user_id = $2
           AND payment_status <> 'paid'
         RETURNING *`,
        [
          orderId,
          req.user.id
        ]
      );


    if (rows.length) {

      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        await awardLoyaltyPoints(client, orderId);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('POINTS AWARD ERROR:', e.message);
      } finally {
        client.release();
      }
    }


    if (!rows.length) {

      const latest =
        await pool.query(
          `SELECT *
           FROM orders
           WHERE id = $1`,
          [orderId]
        );

      return res.json(
        latest.rows[0]
      );
    }


    res.json(
      rows[0]
    );
  }
);


export default router;
