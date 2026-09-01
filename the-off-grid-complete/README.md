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
- Cash on Delivery flow
- Online-payment placeholder ready for Razorpay integration
- Order creation/history
- Order cancellation
- Order tracking
- Customer account
- Product reviews + star ratings
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

The checkout intentionally does NOT contain fake Razorpay credentials. For live online payments, connect your Razorpay Key ID/secret and server-side order creation/signature verification in the checkout flow.

## Important

The project keeps the existing The Off Grid visual direction and does not depend on product data loading before the product detail route can render. Product details are owned by `src/pages/ProductDetails.jsx`.
