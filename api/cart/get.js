const { getMemberCart } = require("../../lib/cafe24")

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

    try {
        const memberId = String(req.query?.memberId || "").trim()
        const limit = Number(req.query?.limit || 100)
        const offset = Number(req.query?.offset || 0)

        if (!memberId) {
            res.status(400).json({
                ok: false,
                message:
                    "Missing required query parameter: memberId. Cafe24's documented cart retrieval API is member-based.",
            })
            return
        }

        const result = await getMemberCart({
            memberId,
            limit,
            offset,
        })

        res.status(200).json({
            ok: true,
            memberId,
            cart: result.cart,
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to retrieve Cafe24 cart.",
        })
    }
}
