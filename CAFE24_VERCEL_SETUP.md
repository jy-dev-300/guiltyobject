# Cafe24 Vercel Setup

This backend sits behind your Framer product page and can use either:

- Cafe24 Front API credentials for server-side cart creation
- Cafe24 OAuth refresh-token cycling for Web Components so Framer does not need
  a manually pasted short-lived access token

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
- `GET /api/storefront/config`
  Returns the Cafe24 `store-domain`, `shop-no`, and a short-lived access token
  for Cafe24 Web Components.

## Vercel environment variables

Set these in your Vercel project:

```bash
CAFE24_CLIENT_ID=...
CAFE24_FRONT_API_KEY=...
CAFE24_CLIENT_SECRET=...
CAFE24_REFRESH_TOKEN=...
CAFE24_MALL_ID=...
CAFE24_SHOP_NO=1
CAFE24_PUBLIC_STORE_URL=https://your-store-domain.com
CAFE24_STORE_DOMAIN=your-store-domain.com
CAFE24_ACCOUNT_URL=
CAFE24_LOGIN_URL=
CAFE24_CHECKOUT_URL=
FRAMER_HOME_URL=
```

Notes:

- `CAFE24_FRONT_API_KEY` should come from the Cafe24 app credentials for the
  storefront/front API setup.
- `CAFE24_CLIENT_SECRET` and `CAFE24_REFRESH_TOKEN` are used to mint fresh
  short-lived access tokens for Cafe24 Web Components.
- If your refresh token comes from a separate URI that returns token JSON, set
  `CAFE24_REFRESH_TOKEN_SOURCE_URL` and the backend will extract
  `refresh_token` from that JSON automatically.
- If that source URI requires auth, set
  `CAFE24_REFRESH_TOKEN_SOURCE_AUTH_HEADER` to the full header value, for
  example `Bearer ...`.
- `CAFE24_STORE_DOMAIN` is optional, but useful when the storefront host is not
  obvious from `CAFE24_PUBLIC_STORE_URL`.
- `CAFE24_PUBLIC_STORE_URL` is what powers the native cart and checkout
  redirects.
- `CAFE24_ACCOUNT_URL`, `CAFE24_LOGIN_URL`, and `CAFE24_CHECKOUT_URL` are
  optional overrides.

## Framer fields to fill in

Use these in `mirrorShopComponent.tsx`:

- `Use Cafe24`: `true`
- `Backend URL`: `https://your-vercel-project.vercel.app`
- `Product Handle`: required for Cafe24 Web Components
- `Product No`: only needed for the backend cart-sync flow
- `Variant Code`: optional for the backend cart-sync flow
- `Cart URL`: your native cart page, usually `https://your-store-domain.com/order/basket.html`
- `Buy URL`: your preferred post-add redirect, often cart or checkout

For the Web Components route, you can now leave the Framer `Access Token`
field blank if your backend is configured with `CAFE24_CLIENT_SECRET` and
`CAFE24_REFRESH_TOKEN`.

If the refresh token itself rotates every two weeks, the better setup is:

```bash
CAFE24_CLIENT_ID=...
CAFE24_CLIENT_SECRET=...
CAFE24_REFRESH_TOKEN_SOURCE_URL=https://your-token-source.example.com/token.json
CAFE24_REFRESH_TOKEN_SOURCE_AUTH_HEADER=Bearer ...
CAFE24_MALL_ID=...
CAFE24_SHOP_NO=1
CAFE24_PUBLIC_STORE_URL=https://your-store-domain.com
CAFE24_STORE_DOMAIN=your-store-domain.com
```

Expected JSON shape from the source URI:

```json
{
  "access_token": "...",
  "expires_at": "2026-07-01T12:00:00.000Z",
  "refresh_token": "...",
  "refresh_token_expires_at": "2026-07-15T12:00:00.000Z"
}
```

Only `refresh_token` is strictly required from that source response, but the
expiry fields help the backend decide when to refetch before expiration.

## Important limitation

This backend creates the Cafe24 cart through the API, then your Framer page
redirects to a native Cafe24 page. It does not embed the full Cafe24 checkout
inside Framer.
