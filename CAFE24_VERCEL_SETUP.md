# Cafe24 Vercel Setup

This backend is meant to sit behind your Framer product page.

## What it does

- `GET /api/auth/cafe24/start`
  Starts the Cafe24 OAuth flow.
- `GET /api/auth/cafe24/callback`
  Exchanges the authorization code and shows you the `refresh_token` to save in Vercel.
- `POST /api/cart/add`
  Refreshes the Cafe24 access token, resolves a variant code when possible, and creates a cart through the Front API.

## Vercel environment variables

Set these in your Vercel project:

```bash
CAFE24_CLIENT_ID=...
CAFE24_CLIENT_SECRET=...
CAFE24_MALL_ID=...
CAFE24_SHOP_NO=1
CAFE24_SCOPES=mall.write_personal
CAFE24_REDIRECT_URI=https://your-vercel-project.vercel.app/api/auth/cafe24/callback
CAFE24_REFRESH_TOKEN=...
CAFE24_PUBLIC_STORE_URL=https://your-store-domain.com
```

## One-time OAuth setup

1. Deploy this repo to Vercel.
2. In Cafe24 Developer Admin, set the Redirect URI to:
   `https://your-vercel-project.vercel.app/api/auth/cafe24/callback`
3. In Vercel, add every env var except `CAFE24_REFRESH_TOKEN` if you do not have it yet.
4. Visit:
   `https://your-vercel-project.vercel.app/api/auth/cafe24/start`
5. Approve the app.
6. On the callback page, copy the shown `CAFE24_REFRESH_TOKEN` into Vercel env vars.
7. Redeploy after saving the refresh token.

## Framer fields to fill in

Use these in `mirrorShopComponent.tsx`:

- `Use Cafe24`: `true`
- `Backend URL`: `https://your-vercel-project.vercel.app`
- `Product No`: your Cafe24 product number
- `Variant Code`: leave blank first if the product only has one item code
- `Cart URL`: your native cart page, usually `https://your-store-domain.com/order/basket.html`
- `Buy URL`: your preferred post-add redirect, often cart or checkout

## Important limitation

This backend creates the Cafe24 cart through the API, then your Framer page should redirect to a native Cafe24 URL. It does not try to keep the whole checkout embedded inside Framer.
