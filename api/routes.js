const { getCafe24Urls } = require("../lib/cafe24")

function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
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

    res.status(200).json({
        ok: true,
        routes: {
            ...getCafe24Urls(),
            storefrontConfigPath: "/api/storefront/config",
            storefrontDebugPath: "/api/storefront/debug",
        },
    })
}
