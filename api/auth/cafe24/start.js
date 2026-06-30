module.exports = async (_req, res) => {
    res.status(410).json({
        ok: false,
        message:
            "This project now uses Cafe24 Front API credentials instead of the OAuth refresh-token flow. Set CAFE24_CLIENT_ID, CAFE24_FRONT_API_KEY, and CAFE24_MALL_ID in Vercel.",
    })
}
