const { writeCafe24TokenStore } = require("../../../lib/cafe24TokenStore")

function getRequiredEnv(name) {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

function getOptionalEnv(name, fallback = "") {
    return process.env[name] || fallback
}

function getMallId() {
    return getRequiredEnv("CAFE24_MALL_ID")
}

function getTokenUrl() {
    return (
        getOptionalEnv("CAFE24_OAUTH_TOKEN_URL", "").trim() ||
        `https://${getMallId()}.cafe24api.com/api/v2/oauth/token`
    )
}

function getRedirectUri(req) {
    const explicitRedirectUri = getOptionalEnv(
        "CAFE24_OAUTH_REDIRECT_URI",
        ""
    ).trim()
    if (explicitRedirectUri) return explicitRedirectUri

    const host = req.headers["x-forwarded-host"] || req.headers.host || ""
    const protocol =
        req.headers["x-forwarded-proto"] ||
        (host.includes("localhost") ? "http" : "https")

    return `${protocol}://${host}/api/auth/cafe24/callback`
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

function getBasicAuthorizationHeader(clientId, clientSecret) {
    return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
}

function parseTokenTimestamp(value, fallbackMs = 0) {
    const parsed = Date.parse(String(value || ""))
    if (Number.isFinite(parsed)) return parsed
    return fallbackMs > 0 ? Date.now() + fallbackMs : 0
}

function normalizeOauthTokenPayload(payload) {
    const accessToken = String(payload?.access_token || "").trim()
    const refreshToken = String(payload?.refresh_token || "").trim()
    const accessTokenExpiresAt = parseTokenTimestamp(
        payload?.expires_at,
        45 * 60 * 1000
    )
    const refreshTokenExpiresAt = parseTokenTimestamp(
        payload?.refresh_token_expires_at,
        13 * 24 * 60 * 60 * 1000
    )

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
    }
}

async function parseResponsePayload(response) {
    const rawText = await response.text()

    if (!rawText) {
        return {
            rawText: "",
            payload: null,
        }
    }

    try {
        return {
            rawText,
            payload: JSON.parse(rawText),
        }
    } catch (_error) {
        return {
            rawText,
            payload: null,
        }
    }
}

async function tryTokenExchange({
    code,
    clientId,
    clientSecret,
    redirectUri,
}) {
    const attempts = [
        {
            label: "basic-auth-with-redirect-uri",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                Authorization: getBasicAuthorizationHeader(
                    clientId,
                    clientSecret
                ),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
            }).toString(),
        },
        {
            label: "basic-auth-without-redirect-uri",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                Authorization: getBasicAuthorizationHeader(
                    clientId,
                    clientSecret
                ),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
            }).toString(),
        },
        {
            label: "form-client-credentials",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
            }).toString(),
        },
        {
            label: "form-client-credentials-without-redirect-uri",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: clientId,
                client_secret: clientSecret,
            }).toString(),
        },
        {
            label: "basic-auth-with-mall-id",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                Authorization: getBasicAuthorizationHeader(
                    clientId,
                    clientSecret
                ),
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                mall_id: getMallId(),
            }).toString(),
        },
        {
            label: "form-with-mall-id",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                mall_id: getMallId(),
            }).toString(),
        },
    ]

    const failures = []

    for (const attempt of attempts) {
        const response = await fetch(getTokenUrl(), {
            method: "POST",
            headers: attempt.headers,
            body: attempt.body,
        })

        const { payload, rawText } = await parseResponsePayload(response)

        if (response.ok) {
            return {
                payload,
                strategy: attempt.label,
            }
        }

        failures.push({
            strategy: attempt.label,
            status: response.status,
            detail:
                payload?.error_description ||
                payload?.error?.message ||
                payload?.error ||
                payload?.message ||
                rawText ||
                "Cafe24 OAuth token exchange failed.",
        })
    }

    const error = new Error(
        failures[failures.length - 1]?.detail ||
            "Cafe24 OAuth token exchange failed."
    )
    error.failures = failures
    throw error
}

module.exports = async (req, res) => {
    const code = String(req.query?.code || "").trim()
    const oauthError = String(req.query?.error || "").trim()

    if (oauthError) {
        res.status(400).send(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cafe24 OAuth Failed</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #f6f3ed; color: #111; }
      main { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 16px; padding: 24px; }
      code { font-family: Consolas, monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>Cafe24 OAuth failed</h1>
      <p><code>${escapeHtml(oauthError)}</code></p>
    </main>
  </body>
</html>`)
        return
    }

    if (!code) {
        res.status(400).send(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cafe24 OAuth Missing Code</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #f6f3ed; color: #111; }
      main { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 16px; padding: 24px; }
      code { font-family: Consolas, monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>Cafe24 OAuth code missing</h1>
      <p>This callback did not receive a <code>code</code> query parameter.</p>
    </main>
  </body>
</html>`)
        return
    }

    try {
        const clientId = getRequiredEnv("CAFE24_CLIENT_ID")
        const clientSecret = getRequiredEnv("CAFE24_CLIENT_SECRET")
        const redirectUri = getRedirectUri(req)
        const { payload, strategy } = await tryTokenExchange({
            code,
            clientId,
            clientSecret,
            redirectUri,
        })
        const tokenState = normalizeOauthTokenPayload(payload)
        const tokenStoreResult = await writeCafe24TokenStore({
            accessToken: tokenState.accessToken,
            accessTokenExpiresAt: new Date(
                tokenState.accessTokenExpiresAt
            ).toISOString(),
            refreshToken: tokenState.refreshToken,
            refreshTokenExpiresAt: new Date(
                tokenState.refreshTokenExpiresAt
            ).toISOString(),
        })

        res.status(200).send(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cafe24 OAuth Complete</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #f6f3ed; color: #111; }
      main { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 16px; padding: 24px; }
      code, pre { font-family: Consolas, monospace; }
      pre { white-space: pre-wrap; word-break: break-word; background: #f7f7f7; padding: 16px; border-radius: 12px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Cafe24 OAuth complete</h1>
      <p>The backend exchanged the authorization code successfully.</p>
      <p>Successful token exchange strategy: <code>${escapeHtml(strategy)}</code></p>
      <p>Token store write result:</p>
      <p><code>${escapeHtml(
          tokenStoreResult.ok
              ? `persisted (${tokenStoreResult.source}) at ${tokenStoreResult.path}`
              : tokenStoreResult.message || "not persisted"
      )}</code></p>
      <p><code>refresh_token_expires_at=${escapeHtml(payload?.refresh_token_expires_at || "")}</code></p>
      <p><code>scope=${escapeHtml(Array.isArray(payload?.scopes) ? payload.scopes.join(",") : payload?.scope || "")}</code></p>
      <p><code>mall_id=${escapeHtml(payload?.mall_id || "")}</code></p>
      <p>Current token response</p>
      <pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
      <p>The backend will now try to reuse and rotate the stored refresh token automatically.</p>
    </main>
  </body>
</html>`)
    } catch (error) {
        const failureDetails = Array.isArray(error?.failures)
            ? error.failures
                  .map(
                      (failure) =>
                          `${failure.strategy} (${failure.status}): ${failure.detail}`
                  )
                  .join("\n")
            : ""
        res.status(500).send(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cafe24 OAuth Exchange Failed</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #f6f3ed; color: #111; }
      main { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 16px; padding: 24px; }
      code { font-family: Consolas, monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>Cafe24 OAuth token exchange failed</h1>
      <p><code>${escapeHtml(error instanceof Error ? error.message : "Unknown error")}</code></p>
      <p>Redirect URI used:</p>
      <p><code>${escapeHtml(getRedirectUri(req))}</code></p>
      ${
          failureDetails
              ? `<p>Attempt details:</p><pre>${escapeHtml(failureDetails)}</pre>`
              : ""
      }
      <p>If this looks like a redirect mismatch, set <code>CAFE24_OAUTH_REDIRECT_URI</code> in Vercel to the exact URI registered in Cafe24.</p>
    </main>
  </body>
</html>`)
    }
}
