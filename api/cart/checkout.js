const {
    createCart,
    getCafe24CartUrl,
    getCafe24CheckoutUrl,
} = require("../../lib/cafe24")

function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function parseJsonBody(req) {
    if (typeof req.body === "string") {
        return JSON.parse(req.body)
    }

    return req.body || {}
}

module.exports = async (req, res) => {
    setCorsHeaders(res)

    if (req.method === "OPTIONS") {
        res.status(204).end()
        return
    }

    if (req.method !== "POST") {
        res.status(405).json({ ok: false, message: "Method not allowed." })
        return
    }

    try {
        const body = parseJsonBody(req)
        const items = Array.isArray(body.items) ? body.items : []

        if (items.length <= 0) {
            res.status(400).json({
                ok: false,
                message: "Missing required field: items",
            })
            return
        }

        const normalizedItems = items
            .map((item) => ({
                productNo: String(item?.productNo || "").trim(),
                variantCode: String(item?.variantCode || "").trim(),
                quantity: Math.max(1, Math.floor(Number(item?.quantity) || 1)),
            }))
            .filter((item) => Boolean(item.productNo))

        if (normalizedItems.length <= 0) {
            res.status(400).json({
                ok: false,
                message: "No valid cart items were provided.",
            })
            return
        }

        const results = []

        for (const item of normalizedItems) {
            const result = await createCart(item)
            const cartPayload = result?.cart || null

            results.push({
                productNo: item.productNo,
                resolvedVariantCode: result.resolvedVariantCode,
                cart: cartPayload,
            })
        }

        res.status(200).json({
            ok: true,
            message: "Guest cart synced to Cafe24.",
            itemCount: normalizedItems.length,
            results,
            cartRedirectUrl: getCafe24CartUrl(),
            checkoutRedirectUrl: getCafe24CheckoutUrl(),
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to sync the guest cart to Cafe24.",
        })
    }
}
