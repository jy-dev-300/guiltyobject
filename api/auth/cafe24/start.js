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

function getAuthorizeUrl() {
    return (
        getOptionalEnv("CAFE24_OAUTH_AUTHORIZE_URL", "").trim() ||
        `https://${getMallId()}.cafe24api.com/api/v2/oauth/authorize`
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

function getScopes() {
    return (
        getOptionalEnv(
            "CAFE24_OAUTH_SCOPES",
            "mall.read_personal,mall.write_personal"
        )
            .split(",")
            .map((scope) => scope.trim())
            .filter(Boolean)
            .join(",")
    )
}

module.exports = async (req, res) => {
    try {
        const clientId = getRequiredEnv("CAFE24_CLIENT_ID")
        const redirectUri = getRedirectUri(req)
        const scopes = getScopes()
        const authorizeUrl = new URL(getAuthorizeUrl())

        authorizeUrl.searchParams.set("response_type", "code")
        authorizeUrl.searchParams.set("client_id", clientId)
        authorizeUrl.searchParams.set("redirect_uri", redirectUri)

        if (scopes) {
            authorizeUrl.searchParams.set("scope", scopes)
        }

        res.writeHead(302, {
            Location: authorizeUrl.toString(),
        })
        res.end()
    } catch (error) {
        res.status(500).json({
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to start Cafe24 OAuth flow.",
        })
    }
}
