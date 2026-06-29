const { exchangeAuthorizationCode } = require("../../../lib/cafe24")

function readCookie(req, name) {
    const header = req.headers.cookie || ""
    const prefix = `${name}=`

    for (const part of header.split(";")) {
        const trimmed = part.trim()
        if (trimmed.startsWith(prefix)) {
            return decodeURIComponent(trimmed.slice(prefix.length))
        }
    }

    return ""
}

module.exports = async (req, res) => {
    try {
        const code = String(req.query.code || "").trim()
        const state = String(req.query.state || "").trim()
        const storedState = readCookie(req, "cafe24_oauth_state")

        if (!code) {
            res.status(400).send("Missing Cafe24 authorization code.")
            return
        }

        if (!state || !storedState || state !== storedState) {
            res.status(400).send("Cafe24 OAuth state validation failed.")
            return
        }

        const tokenPayload = await exchangeAuthorizationCode(code)

        res.setHeader(
            "Set-Cookie",
            "cafe24_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
        )
        res.setHeader("Content-Type", "text/html; charset=utf-8")
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
      pre { white-space: pre-wrap; word-break: break-word; background: #f7f7f7; padding: 16px; border-radius: 12px; }
      code { font-family: Consolas, monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>Cafe24 OAuth complete</h1>
      <p>Copy the values below into your Vercel environment variables before testing the Framer button.</p>
      <p><strong>Set these in Vercel:</strong></p>
      <pre><code>CAFE24_REFRESH_TOKEN=${tokenPayload.refresh_token || ""}
CAFE24_SCOPES=${Array.isArray(tokenPayload.scopes) ? tokenPayload.scopes.join(",") : ""}
CAFE24_MALL_ID=${tokenPayload.mall_id || ""}</code></pre>
      <p><strong>Current token response</strong></p>
      <pre><code>${JSON.stringify(tokenPayload, null, 2)}</code></pre>
      <p>The access token expires quickly, so the backend will use the refresh token for future cart requests.</p>
    </main>
  </body>
</html>`)
    } catch (error) {
        res.status(500).send(
            error instanceof Error
                ? error.message
                : "Unable to finish Cafe24 OAuth."
        )
    }
}
