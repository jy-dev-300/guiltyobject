const {
    getCafe24TokenStoreInfo,
    readCafe24TokenStore,
} = require("../../../lib/cafe24TokenStore")

function setCorsHeaders(req, res) {
    const origin = String(req.headers.origin || "").trim()
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin)
        res.setHeader("Vary", "Origin")
    } else {
        res.setHeader("Access-Control-Allow-Origin", "*")
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

module.exports = async (req, res) => {
    setCorsHeaders(req, res)

    if (req.method === "OPTIONS") {
        res.status(204).end()
        return
    }

    if (req.method !== "GET") {
        res.status(405).json({ ok: false, message: "Method not allowed." })
        return
    }

    try {
        const tokenStoreInfo = getCafe24TokenStoreInfo()
        const tokenStore = await readCafe24TokenStore()

        res.status(200).json({
            ok: true,
            tokenStore: {
                path: tokenStoreInfo.path,
                source: tokenStoreInfo.source,
                isDurable: tokenStoreInfo.isDurable,
                hasRefreshToken: Boolean(tokenStore?.refreshToken),
                refreshTokenExpiresAt:
                    tokenStore?.refreshTokenExpiresAt || null,
                accessTokenExpiresAt: tokenStore?.accessTokenExpiresAt || null,
                updatedAt: tokenStore?.updatedAt || null,
            },
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to inspect Cafe24 token store.",
        })
    }
}
