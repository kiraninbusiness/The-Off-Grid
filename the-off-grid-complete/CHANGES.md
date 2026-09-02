# THE OFF GRID — Fixes & Additions

## Critical bug fixed (this was breaking your whole site)
`server/src/routes/products.js` was exporting a plain data array instead of an
Express Router, but `server.js` mounts it with `app.use('/api/products', products)`.
Express throws on that at startup, which crashed the **entire backend**, not
just the products page — that's why nothing was loading. Rewrote it as a real
DB-backed router with:
- `GET /api/products` — list, with category/gender/color/fit/search/price/sort filters
- `GET /api/products/:id` — single product
- `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id` — admin-only, matches what Admin.jsx already calls
- `POST /api/products/:id/notify` — new "notify me" waitlist for out-of-stock items

## Other bugs fixed
- `client/src/api.js` defaulted to port 4000; your server defaults to port 5000 — fixed the mismatch.
- Removed `server/src/routes/index.js` — a second, unused, hardcoded mini Express app that was dead code left over from an earlier version.
- Removed stale root-level `index.html`, `vite.config.js`, `package.json` — leftovers from before the client/server split; your real app lives in `client/` and `server/` per DEPLOYMENT.md.
- Fixed root `package.json`'s `server` script, which pointed at a file that didn't exist.
- DB seed data only had 4 incomplete products (missing color/fit). Expanded to your full 12-item catalog so a fresh database matches the frontend fallback data.
- Added `server/.env.example` and `client/.env.example` — neither existed, making first-time setup guesswork.

## New features (closing gaps vs Snitch / Nobero / Wrogn / Rare Rabbit)
- **Related Products** — shown on the product page, same category, up to 4 items.
- **Recently Viewed** — tracked via localStorage, shown on the product page.
- **Delivery / PIN code checker** — estimated delivery date + COD availability on the product page.
- **Notify Me** — email capture for out-of-stock products, stored server-side.

Already had, no rebuild needed: Quick View, Size Guide, Wishlist, Reviews, Coupons, Loyalty & Referral programs, Order Tracking, PWA support, and a full Admin panel.

## Verified
- `npm run build` in `client/` completes with no errors.
- All server route modules import cleanly; the products router now loads as a valid Express Router (confirmed via `typeof default === 'function'`).

## Before you deploy
1. Copy `server/.env.example` → `server/.env` and fill in `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`.
2. Copy `client/.env.example` → `client/.env` and set `VITE_API_URL` to your Render backend URL + `/api`.
3. Redeploy the backend on Render — this is where the crash was happening, so it needs a fresh deploy to pick up the fix.

---

# Round 2 — the actual "can't view products" bug, plus everything wired to it

The previous round fixed the backend crash. It did **not** fix the reason
products couldn't be viewed on the frontend — that bug was still there.

## The root cause
`client/src/pages/ProductDetails.jsx` read the product id with React
Router's `useParams()`. But `App.jsx` never renders this app inside a
`<Routes>`/`<Route path="/product/:id">` — it manually reads
`location.pathname` and renders pages directly. `useParams()` in that
setup always returns `{}`, so the id was always `undefined` and the
lookup always failed — every single product page showed "PRODUCT NOT
FOUND." On top of that, `App.jsx` was passing a prop named `product`
while the component read a prop named `products` — a second, unrelated
bug that would have broken it either way.

**Fix:** `App.jsx` already resolves the correct product from the URL by
hand (that logic was fine) — `ProductDetails` now just receives it
directly via a `product` prop instead of re-deriving it incorrectly.

## Other broken wiring found and fixed
- No `orders` state existed anywhere in `App.jsx`, even though
  Checkout, Orders, Account and TrackOrder all expected one — placing
  an order had nowhere to go, "My Orders" crashed outright, and order
  tracking could never find anything. Added persisted `orders` state
  with `addOrder` / `cancelOrder`.
- `Checkout.jsx` expected `setCart`, `user`, and `onOrder` props that
  `App.jsx` never passed — checkout was non-functional. Also, the cart
  was never cleared after a successful order.
- `TrackOrder.jsx` had the same `useParams()` bug, and was never given
  an `orders` list to search.
- `Orders.jsx` had no link to order tracking despite the page existing.
- Logged-in users were saved under `localStorage["offgrid_user"]` by
  `Account.jsx` but read back from `localStorage["thrift_user"]` by
  `App.jsx` — different keys, so every refresh silently logged people
  out.
- `Account.jsx` never called the backend's `/api/auth` endpoints —
  "login" just wrote an unverified object straight to localStorage, so
  no one could ever actually satisfy the admin check in `Admin.jsx`.
  It now performs real register/login against the backend and stores
  the JWT the way `api.js` expects it.
- A complete **Admin dashboard** (`Admin.jsx`) existed — products,
  orders, coupons, stats — fully wired to the backend, but was never
  routed anywhere in `App.jsx` and had **zero CSS**. Added the `/admin`
  route, a nav icon for admin users, and a full stylesheet matching
  the site's existing design tokens.
- `client/vite.config.js` didn't exist, so `@vitejs/plugin-react`
  (listed in `package.json`) was never actually registered with Vite.
- "TANK TOPS" was a real product category with no filter button, so
  it was unreachable except under "ALL".
- The service worker (`sw.js`) and manifest existed but the service
  worker was never registered — "Add to Home Screen" support did
  nothing. Registered it in `main.jsx`.
- Checkout had no coupon field despite a working, public
  `POST /api/coupons/validate` endpoint. Added a coupon code field
  that validates against it and reflects the discount in the total.

## Still local-first by design
Cart, wishlist and order history remain localStorage-based (as the
original README describes), so the storefront works fully without the
backend running. Logging in via the new real auth screen is optional —
it's what unlocks the Admin dashboard, since `Admin.jsx` is 100%
backend-driven by design.
