# Cafe24 Vercel Setup

This backend sits behind your Framer product page and uses Cafe24 Front API
credentials instead of the OAuth refresh-token flow.

## What it does

- `POST /api/cart/add`
  Creates a Cafe24 cart line for a single product and returns native cart and
  checkout URLs.
- `POST /api/cart/checkout`
  Creates Cafe24 cart lines for multiple items, then returns native cart and
  checkout URLs.
- `GET /api/cart/urls`
  Returns the native Cafe24 cart, checkout, account, login, and home URLs used
  by the Framer component.

## Vercel environment variables

Set these in your Vercel project:

```bash
CAFE24_CLIENT_ID=...
CAFE24_FRONT_API_KEY=...
CAFE24_MALL_ID=...
CAFE24_SHOP_NO=1
CAFE24_PUBLIC_STORE_URL=https://your-store-domain.com
CAFE24_ACCOUNT_URL=
CAFE24_LOGIN_URL=
CAFE24_CHECKOUT_URL=
FRAMER_HOME_URL=
```

Notes:

- `CAFE24_FRONT_API_KEY` should come from the Cafe24 app credentials for the
  storefront/front API setup.
- `CAFE24_PUBLIC_STORE_URL` is what powers the native cart and checkout
  redirects.
- `CAFE24_ACCOUNT_URL`, `CAFE24_LOGIN_URL`, and `CAFE24_CHECKOUT_URL` are
  optional overrides.

## Framer fields to fill in

Use these in `mirrorShopComponent.tsx`:

- `Use Cafe24`: `true`
- `Backend URL`: `https://your-vercel-project.vercel.app`
- `Product No`: your Cafe24 product number
- `Variant Code`: leave blank first if the product only has one item code
- `Cart URL`: your native cart page, usually `https://your-store-domain.com/order/basket.html`
- `Buy URL`: your preferred post-add redirect, often cart or checkout

## Important limitation

This backend creates the Cafe24 cart through the API, then your Framer page
redirects to a native Cafe24 page. It does not embed the full Cafe24 checkout
inside Framer.
