# Token Maintenance

## Overview

This project uses Cafe24 OAuth tokens on the backend.

There are two different flows:

- Initial admin authorization
- Ongoing automatic token refresh

These are not the same thing.

## The Three Important URLs

### 1. App start URL

This is our backend route:

`/api/auth/cafe24/start`

Purpose:

- Starts the Cafe24 OAuth login and consent flow
- Redirects the browser to Cafe24

Use this when:

- connecting the app for the first time
- reconnecting after token expiry or revocation
- recovering from a broken token chain

This is not the token endpoint.

### 2. App callback URL

This is our backend route:

`/api/auth/cafe24/callback`

Purpose:

- Receives the one-time `code` from Cafe24
- Exchanges that code for:
  - `access_token`
  - `refresh_token`

### 3. Cafe24 token endpoint

This is the real Cafe24 token endpoint:

`https://{mall_id}.cafe24api.com/api/v2/oauth/token`

In this project it is built from:

- `CAFE24_MALL_ID`
- or overridden by `CAFE24_OAUTH_TOKEN_URL`

Code references:

- [api/auth/cafe24/callback.js](C:\Users\jsy30\guiltyobbj\api\auth\cafe24\callback.js)
- [lib/cafe24.js](C:\Users\jsy30\guiltyobbj\lib\cafe24.js)

## Token Lifecycle

### Step 1. Initial authorization

An admin visits:

`/api/auth/cafe24/start`

Flow:

1. Backend redirects to Cafe24 authorize URL
2. Admin logs in and approves access
3. Cafe24 redirects back to `/api/auth/cafe24/callback?code=...`
4. Backend exchanges the `code` at the Cafe24 token endpoint
5. Cafe24 returns:
   - `access_token`
   - `refresh_token`
   - `expires_at`
   - `refresh_token_expires_at`

Important:

- The authorization `code` is one-time use
- The `code` is short-lived
- `/start` is only for this bootstrap or recovery step

## Step 2. Normal refresh flow

After initial setup, the backend should not send the user back through `/api/auth/cafe24/start`.

Instead, it should call the same Cafe24 token endpoint with:

- `grant_type=refresh_token`
- the current `refresh_token`

Cafe24 responds with:

- a new `access_token`
- a new `refresh_token`

Important:

- access token lifetime is short
- refresh token lifetime is 14 days
- if refreshed before expiry, Cafe24 returns a brand new refresh token
- the old refresh token becomes invalid immediately

This means the backend must save the newly returned refresh token every time.

## Why 14 Days Does Not Automatically Mean Manual Login

Each individual refresh token expires in 14 days.

But the backend can keep the integration alive indefinitely if it:

1. refreshes before the current refresh token expires
2. stores the newly returned refresh token
3. uses that new token for the next refresh

So:

- static refresh token in `.env` only = eventually breaks
- rotated refresh token persisted after each refresh = can keep running

## What Our Backend Currently Does

Current refresh logic lives in:

- [lib/cafe24.js](C:\Users\jsy30\guiltyobbj\lib\cafe24.js)

Relevant functions:

- `getOauthTokenUrl()`
- `ensureOauthRefreshToken()`
- `fetchOauthAccessToken()`
- `getOauthAccessToken()`
- `getCafe24StorefrontAccessToken()`

Current behavior:

- Uses `CAFE24_REFRESH_TOKEN` from env, or
- pulls a refresh token from `CAFE24_REFRESH_TOKEN_SOURCE_URL`, or
- uses an in-memory cached token during runtime

Current limitation:

- the backend updates the in-memory cached refresh token
- but does not persist the newly rotated refresh token back into durable storage by itself

That means a redeploy or cold restart can fall back to an older env token unless another token source is keeping the latest token.

## Recommended Production Setup

For reliable long-term operation, use one of these models:

### Option 1. External token source

Store the latest refresh token in a secure external system and expose it to the backend through:

- `CAFE24_REFRESH_TOKEN_SOURCE_URL`
- optional `CAFE24_REFRESH_TOKEN_SOURCE_AUTH_HEADER`

This lets the backend fetch the latest valid refresh token instead of relying on a stale env var.

### Option 2. Database-backed token persistence

Store the latest refresh token in a database or secure KV store.

Every time Cafe24 returns a new refresh token:

1. overwrite the old stored token
2. save its new expiry
3. use that stored value next time

This is the cleanest long-term setup.

### Option 3. Manual env updates

This works only for temporary testing.

Flow:

1. get refresh token from `/api/auth/cafe24/callback`
2. paste into Vercel env vars
3. repeat when it expires

This is not a production-grade maintenance model.

## When `/api/auth/cafe24/start` Is Needed Again

You only need `/api/auth/cafe24/start` again if:

- the refresh token expired before being rotated
- the token chain was broken
- the app was revoked or disconnected in Cafe24
- the latest refresh token was lost
- the stored token source became stale

If refresh rotation is healthy, normal operation should not require humans to revisit `/start`.

## Mental Model

Use this rule:

- `/api/auth/cafe24/start` = human re-auth flow
- `https://{mall_id}.cafe24api.com/api/v2/oauth/token` = machine token issuance and refresh flow

Or more simply:

```text
First connection:
  browser -> /api/auth/cafe24/start -> Cafe24 login -> /callback -> token endpoint

Normal operation:
  backend -> token endpoint with refresh_token
```

## Example Refresh Request

Typical refresh request shape:

```text
POST https://{mall_id}.cafe24api.com/api/v2/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
refresh_token=...
client_id=...
client_secret=...
```

## Example Auth Code Exchange Request

Typical initial token request shape:

```text
POST https://{mall_id}.cafe24api.com/api/v2/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
code=...
client_id=...
client_secret=...
redirect_uri=...
```

## Relevant Environment Variables

- `CAFE24_MALL_ID`
- `CAFE24_CLIENT_ID`
- `CAFE24_CLIENT_SECRET`
- `CAFE24_REFRESH_TOKEN`
- `CAFE24_REFRESH_TOKEN_EXPIRES_AT`
- `CAFE24_OAUTH_TOKEN_URL`
- `CAFE24_REFRESH_TOKEN_SOURCE_URL`
- `CAFE24_REFRESH_TOKEN_SOURCE_AUTH_HEADER`
- `CAFE24_ACCESS_TOKEN`
- `CAFE24_WEB_COMPONENT_ACCESS_TOKEN`

## References

- Cafe24 auth code docs: https://developers.cafe24.com/docs/en/api/#get-authentication-code
- Cafe24 access token docs: https://developers.cafe24.com/docs/en/api/#get-access-token
- Cafe24 refresh token docs: https://developers.cafe24.com/docs/en/api/#get-access-token-using-refresh-token
