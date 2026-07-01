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

        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
        })

        const response = await fetch(getTokenUrl(), {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: params.toString(),
        })

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
            const detail =
                payload?.error_description ||
                payload?.error?.message ||
                payload?.error ||
                payload?.message ||
                "Cafe24 OAuth token exchange failed."
            throw new Error(detail)
        }

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
      <p>Copy the values below into your Vercel environment variables before testing the Framer button.</p>
      <p>Set these in Vercel:</p>
      <p><code>CAFE24_REFRESH_TOKEN=${escapeHtml(payload?.refresh_token || "")}</code></p>
      <p><code>CAFE24_REFRESH_TOKEN_EXPIRES_AT=${escapeHtml(payload?.refresh_token_expires_at || "")}</code></p>
      <p><code>CAFE24_SCOPES=${escapeHtml(Array.isArray(payload?.scopes) ? payload.scopes.join(",") : payload?.scope || "")}</code></p>
      <p><code>CAFE24_MALL_ID=${escapeHtml(payload?.mall_id || "")}</code></p>
      <p>Current token response</p>
      <pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
      <p>The access token expires quickly, so the backend should use the refresh token for future requests.</p>
    </main>
  </body>
</html>`)
    } catch (error) {
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
    </main>
  </body>
</html>`)
    }
}
