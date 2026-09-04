import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {initDb} from './db.js';
import auth from './routes/auth.js';
import products from './routes/products.js';
import orders from './routes/orders.js';
import reviews from './routes/reviews.js';
import coupons from './routes/coupons.js';
import newsletter from './routes/newsletter.js';
import profile from './routes/profile.js';
import variants from './routes/variants.js';
import returns from './routes/returns.js';
import adminRoutes from './routes/admin.js';
import upload from './routes/upload.js';
import giftcards from './routes/giftcards.js';
import cart from './routes/cart.js';
import combos from './routes/combos.js';
import abandoned, { startAbandonedCartScheduler } from './routes/abandoned.js';
import webhooks from './routes/webhooks.js';
import contact from './routes/contact.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app=express();
app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'}));

/*
  Razorpay webhooks MUST be mounted before express.json() and parsed as
  a raw Buffer — the webhook signature is computed over the exact raw
  request bytes, and JSON-parsing + re-serializing would change them,
  breaking every signature check. See routes/webhooks.js for details.
*/
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooks);

app.use(express.json({limit:'1mb'}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('/api/health',(req,res)=>res.json({ok:true}));
app.use('/api/auth',auth);
app.use('/api/products',products);
app.use('/api/orders',orders);
app.use('/api/reviews',reviews);
app.use('/api/coupons',coupons);
app.use('/api/newsletter',newsletter);
app.use('/api/profile',profile);
app.use('/api/products',variants);
app.use('/api/returns',returns);
app.use('/api/admin',adminRoutes);
app.use('/api/upload',upload);
app.use('/api/gift-cards',giftcards);
app.use('/api/cart',cart);
app.use('/api/combos',combos);
app.use('/api/admin/abandoned-carts',abandoned);
app.use('/api/contact',contact);

const port=process.env.PORT||5000;
initDb().then(()=>app.listen(port,()=>{console.log(`API running on http://localhost:${port}`);startAbandonedCartScheduler();}))
.catch(e=>{console.error(e);process.exit(1)});
