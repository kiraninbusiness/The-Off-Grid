# THE OFF GRID — Complete Store Package

This package is a clean replacement project for the current The Off Grid clothing website.

## Included

- Responsive premium fashion storefront
- 12 products
- Product cards
- Product detail pages using `/product/:id`
- Direct URL/refresh-safe product routing
- Wishlist
- Persistent cart
- Quantity controls
- Size selection + size guide
- Quick View
- Search
- Category filtering
- Sorting
- Checkout
- Real backend order creation for COD and online payments
- Razorpay Checkout + server-side signature verification
- Safe online-payment cancellation/failure stock restoration
- Backend/PostgreSQL order history and direct order lookup
- Order cancellation with stock/coupon/loyalty restoration
- Order tracking backed by the API
- Customer account authentication
- Backend product reviews + star ratings
- Verified Purchase review badge when the customer has a delivered order
- Newsletter form
- Mobile navigation
- Responsive UI
- LocalStorage persistence
- Express API with products/newsletter/reviews/health endpoints

## Run

1. Install Node.js 18+.
2. In this folder:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

4. Optional API server:

```bash
npm run server
```

Frontend: http://localhost:5173  
API: http://localhost:4000

The storefront works without the API because product/cart/order/review persistence is handled locally.

## Production payment

The checkout now uses Razorpay when `VITE_RAZORPAY_KEY_ID` is configured in the frontend. Keep `RAZORPAY_KEY_SECRET` on the backend only.

Frontend `.env` example:

```
VITE_API_URL=https://your-backend.example.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
```

Backend `.env` example:

```
DATABASE_URL=...
JWT_SECRET=...
CLIENT_URL=https://your-frontend.example.com
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret
```

## Important

The project keeps the existing The Off Grid visual direction and does not depend on product data loading before the product detail route can render. Product details are owned by `src/pages/ProductDetails.jsx`.
