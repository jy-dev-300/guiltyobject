module.exports = async (_req, res) => {
    res.status(410).send(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cafe24 OAuth Removed</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; background: #f6f3ed; color: #111; }
      main { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #ddd; border-radius: 16px; padding: 24px; }
      code { font-family: Consolas, monospace; }
    </style>
  </head>
  <body>
    <main>
      <h1>Cafe24 OAuth is no longer used here</h1>
      <p>This backend now expects Cafe24 Front API credentials instead of a refresh token.</p>
      <p>Set these Vercel environment variables:</p>
      <p><code>CAFE24_CLIENT_ID</code></p>
      <p><code>CAFE24_FRONT_API_KEY</code></p>
      <p><code>CAFE24_MALL_ID</code></p>
      <p><code>CAFE24_SHOP_NO</code> (usually <code>1</code>)</p>
      <p><code>CAFE24_PUBLIC_STORE_URL</code></p>
    </main>
  </body>
</html>`)
}
