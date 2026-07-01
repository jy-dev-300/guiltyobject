# Architecture

## Overview

This project is a Framer storefront wired to a Vercel backend for Cafe24.

Main split:

- Frontend: Framer components in `mirrorShopComponent.tsx`, `OverlayNavigation.tsx`, and `LandingOverlayNavigation.tsx`
- Backend: Vercel serverless routes in `api/`
- Shared Cafe24 logic: `lib/cafe24.js`

High-level shape:

```text
Framer page
  |
  |-- MirrorShopComponent.tsx
  |     |-- Cafe24CommerceBridge
  |     |-- Cafe24BackendCommerceBridge
  |     '-- Cafe24GuestCommerceBridge
  |
  |-- OverlayNavigation.tsx
  |     '-- NavCafe24CartButton
  |
  '-- LandingOverlayNavigation.tsx

          |
          v

Vercel API
  |
  |-- /api/storefront/config
  |-- /api/cart/add
  |-- /api/cart/checkout
  |-- /api/cart/urls
  |-- /api/product/variants
  '-- /api/auth/cafe24/*

          |
          v

lib/cafe24.js
  |
  '-- Cafe24 OAuth / token refresh / Front API / URL helpers
```

## Frontend Components

### `mirrorShopComponent.tsx`

Primary product-detail component.

Main internal bridges:

- `Cafe24CommerceBridge`
  - Preferred path
  - Loads Cafe24 Web Components script
  - Fetches runtime config from `/api/storefront/config`
  - Renders Cafe24 Web Component `Add to cart` and `Buy now`
- `Cafe24BackendCommerceBridge`
  - Fallback for direct backend-powered cart creation
  - Calls `/api/cart/add`
  - Redirects to native Cafe24 cart or checkout URL
- `Cafe24GuestCommerceBridge`
  - Legacy guest/shadow-cart fallback
  - Stores cart state in browser storage
  - Later syncs multiple items through `/api/cart/checkout`

Decision flow:

```text
MirrorShopComponent
  |
  |-- if useCafe24 + productHandle + backend/config available
  |      '-- use Cafe24CommerceBridge
  |
  |-- else if useCafe24 + backendUrl + productNo available
  |      '-- use backend fallback bridges
  |
  '-- else
         '-- use local static CTA
```

### `OverlayNavigation.tsx`

Fixed navigation with dropdowns and a simple Cafe24 cart button.

- `NavCafe24CartButton`
  - No backend token work
  - Just opens native Cafe24 cart URL or buy URL fallback

### `LandingOverlayNavigation.tsx`

Landing-page version of the nav.

- Similar dropdown behavior
- Adds logo reveal behavior based on scroll position and a trigger selector
- Does not contain the Cafe24 cart logic

## Backend Files

### `lib/cafe24.js`

Shared backend core. Almost every API route depends on this file.

Responsibilities:

- Read env vars
- Build Cafe24 API base URLs
- Build public storefront URLs
- Create and refresh OAuth access tokens
- Optionally load refresh tokens from an external source URI
- Support Front API authorization
- Resolve product variant codes
- Create Cafe24 cart entries
- Return storefront config for web components

Token strategy:

```text
Need storefront access token
  |
  |-- use CAFE24_WEB_COMPONENT_ACCESS_TOKEN if present
  |-- else use CAFE24_ACCESS_TOKEN if present
  |-- else use OAuth refresh flow
         |
         |-- use cached refresh token
         |-- or env refresh token
         '-- or fetch refresh token from source URI
```

### `api/storefront/config.js`

Purpose:

- Returns the runtime config needed by Cafe24 Web Components

Response shape:

```text
{
  ok: true,
  config: {
    storeDomain,
    shopNo,
    accessToken,
    expiresAt,
    source
  }
}
```

Used by:

- `Cafe24CommerceBridge` in `mirrorShopComponent.tsx`

### `api/cart/add.js`

Purpose:

- Create one Cafe24 cart line item

Uses:

- `createCart`
- `getCafe24CartUrl`
- `getCafe24CheckoutUrl`

Used by:

- `Cafe24BackendCommerceBridge`

### `api/cart/checkout.js`

Purpose:

- Sync multiple guest/shadow-cart items into Cafe24

Uses:

- `createCart` in a loop
- collects debug data from each Cafe24 response

Used by:

- `Cafe24GuestCommerceBridge`

### `api/cart/urls.js`

Purpose:

- Return native Cafe24 URLs for home, account, login, cart, and checkout

### `api/product/variants.js`

Purpose:

- Inspect Cafe24 variant data for a product number
- Useful for troubleshooting `variantCode` / `item code`

### `api/routes.js`

Purpose:

- Lightweight route discovery endpoint
- Includes `storefrontConfigPath`

### `api/auth/cafe24/start.js`

Purpose:

- Starts Cafe24 OAuth flow
- Redirects browser to Cafe24 authorize URL

### `api/auth/cafe24/callback.js`

Purpose:

- Handles OAuth callback
- Exchanges auth code for tokens
- Displays refresh token and related values for Vercel env setup

### `api/cart/get.js`

Current status:

- Stub route
- Returns `501`
- Explains member cart lookup is not part of the current supported backend flow

### `api/cart/remove.js`

Current status:

- Stub route
- Returns `501`
- Explains item-level deletion is not implemented in this backend flow

### `api/cart/update.js`

Current status:

- Stub route
- Returns `501`
- Explains item-level quantity updates are not implemented in this backend flow

## Main Runtime Flows

### 1. Web Component product flow

```text
Framer product page
  |
  '-- MirrorShopComponent
         |
         '-- Cafe24CommerceBridge
                |
                '-- GET /api/storefront/config
                       |
                       '-- lib/cafe24.js
                              |
                              '-- returns storeDomain + shopNo + accessToken
                |
                '-- renders Cafe24 Web Components
                       |-- Add to cart
                       '-- Buy now
```

### 2. Backend fallback cart flow

```text
Framer button click
  |
  '-- POST /api/cart/add
         |
         '-- lib/cafe24.js
                |
                |-- resolve variant code if needed
                '-- create Cafe24 cart line
         |
         '-- return cart URL / checkout URL
```

### 3. Guest shadow-cart sync flow

```text
Guest adds items locally
  |
  '-- browser localStorage shadow cart
         |
         '-- POST /api/cart/checkout
                |
                '-- createCafe24 cart lines one by one
                |
                '-- return native Cafe24 redirect URLs
```

### 4. OAuth bootstrap flow

```text
Browser
  |
  '-- /api/auth/cafe24/start
         |
         '-- redirects to Cafe24 authorize page
                |
                '-- redirects back to /api/auth/cafe24/callback
                       |
                       '-- exchanges code for tokens
                              |
                              '-- shows refresh token values to save in Vercel
```

## What Lives Where

Secrets stay on Vercel:

- `CAFE24_CLIENT_ID`
- `CAFE24_CLIENT_SECRET`
- `CAFE24_REFRESH_TOKEN`
- `CAFE24_REFRESH_TOKEN_SOURCE_URL`
- `CAFE24_FRONT_API_KEY`
- `CAFE24_ACCESS_TOKEN`

Framer normally gets only:

- `Backend URL`
- `Product Handle`
- optional native `Cart URL`
- optional native `Buy URL`

## Recommended Mental Model

```text
Framer = UI and button rendering
Vercel API = secure token + Cafe24 API bridge
lib/cafe24.js = backend brain
Cafe24 Web Components = preferred product CTA experience
Native Cafe24 URLs = final cart / checkout destination
```
