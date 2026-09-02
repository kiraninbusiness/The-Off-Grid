# THE OFF GRID — Upgrade 01

## Production commerce core

### Frontend
- Replaced local/fake checkout order creation with `/api/orders/create`.
- Added real COD order creation through the backend.
- Added Razorpay Checkout integration using `VITE_RAZORPAY_KEY_ID`.
- Added server verification call to `/api/orders/verify-payment`.
- Added safe handling for Razorpay cancellation/payment failure through `/api/orders/:id/payment-cancel`.
- Cart is cleared only after a successful COD order creation or verified online payment.
- Checkout now requires an authenticated customer account because backend orders are user-owned.
- Shipping charge is aligned with backend: free at ₹1,499+, otherwise ₹79.
- Orders are loaded from PostgreSQL via `/api/orders/mine` instead of localStorage.
- Customer order cancellation now calls the backend and updates local UI state.
- Direct order tracking can load `/api/orders/:id` after refresh.
- Reviews now load/save through the backend instead of localStorage.
- Reviews show a Verified Purchase badge for customers with a delivered order.
- Cart identity now includes selected size, so two sizes of the same product do not incorrectly merge.

### Backend
- Orders now store shipping email, city, state and pincode.
- Order items now store selected size/color.
- Added customer-owned `GET /api/orders/:id`.
- Cancellation restores reserved stock.
- Cancellation also restores redeemed loyalty points and releases the coupon usage count.
- Online-payment cancellation is idempotent and cannot restore stock twice.
- Reviews now persist in PostgreSQL and calculate a shared rating summary.
- Reviews mark `verified_purchase` when the reviewer has a delivered order containing the product.
- Database initialization adds the new columns with `IF NOT EXISTS`, so existing databases can be upgraded without deleting data.

## Important next phase
1. Product variants with SKU-level size/color inventory.
2. Multi-image product gallery and zoom.
3. Real shipping/courier integration.
4. Returns/exchanges/refunds.
5. Email + WhatsApp notifications.
6. Analytics/Meta Pixel/SEO.
7. Premium THE OFF GRID brand redesign.

## Phase 2 — Premium Product Experience

- Added richer product metadata: multiple gallery images, color options, size arrays, material, fit notes, model notes and product detail bullets.
- Upgraded ProductDetails with thumbnail gallery, image navigation, zoom overlay, color selection, improved size selection and fit guidance.
- Upgraded product cards with second-image hover, color previews and stronger quick-view size selection.
- Updated cart identity to distinguish product + size + color.
- Passed selected color through checkout payload and persisted it on order items.
- Upgraded SizeGuideModal to adapt its headings to the product category.
- Added premium product-experience styling without replacing the existing storefront architecture.
