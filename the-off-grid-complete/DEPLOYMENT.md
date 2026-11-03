# Deploy THE OFF GRID website

This repository is the **website only** (Vite + React, including the admin panel).
The API lives in a separate repository: `the-off-grid-backend`. The website and the
Android app both call that one backend.

Hosting: Vercel, root directory `the-off-grid-complete/client`, build `npm run build`.

Environment (Vercel):
- `VITE_API_URL=https://the-off-grid-api.onrender.com/api`
- `VITE_RAZORPAY_KEY_ID` (public key only)
- See `client/.env.example` for the optional values.

The API's `CLIENT_URL` (and `CLIENT_URL_WWW`) must list this website's addresses so the browser may call it.
Payment secrets (`RAZORPAY_KEY_SECRET`) and database settings live only on the backend.
