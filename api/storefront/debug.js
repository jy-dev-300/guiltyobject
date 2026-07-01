const {
    getCafe24StorefrontConfig,
    getCafe24StoreDomain,
    getPublicStoreBaseUrl,
    getShopNo,
    hasOauthRefreshConfig,
} = require("../../lib/cafe24")

function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function maskToken(token) {
    const value = String(token || "").trim()
    if (!value) return ""
    if (value.length <= 12) return `${value.slice(0, 4)}...${value.slice(-2)}`
    return `${value.slice(0, 6)}...${value.slice(-4)}`
}

module.exports = async (req, res) => {
    setCorsHeaders(res)

    if (req.method === "OPTIONS") {
        res.status(204).end()
        return
    }

    if (req.method !== "GET") {
        res.status(405).json({ ok: false, message: "Method not allowed." })
        return
    }

    try {
        const config = await getCafe24StorefrontConfig()

        res.status(200).json({
            ok: true,
            debug: {
                storefrontConfigPath: "/api/storefront/config",
                source: String(config?.source || "").trim(),
                expiresAt: config?.expiresAt || null,
                storeDomain: getCafe24StoreDomain(),
                shopNo: getShopNo(),
                publicStoreUrl: getPublicStoreBaseUrl(),
                hasOauthRefreshConfig: hasOauthRefreshConfig(),
                hasAccessToken: Boolean(String(config?.accessToken || "").trim()),
                accessTokenPreview: maskToken(config?.accessToken || ""),
                accessTokenLength: String(config?.accessToken || "").trim().length,
            },
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to load Cafe24 storefront debug info.",
        })
    }
}
