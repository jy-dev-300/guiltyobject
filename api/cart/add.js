const { createCart, getCafe24CartUrl, getCafe24CheckoutUrl } = require("../../lib/cafe24")

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
        const productNo = String(body.productNo || "").trim()
        const variantCode = String(body.variantCode || "").trim()
        const quantity = Number(body.quantity || 1)

        if (!productNo) {
            res.status(400).json({
                ok: false,
                message: "Missing required field: productNo",
            })
            return
        }

        const result = await createCart({
            productNo,
            variantCode,
            quantity,
        })

        res.status(200).json({
            ok: true,
            message: "Cart created successfully.",
            resolvedVariantCode: result.resolvedVariantCode,
            strategy: result.strategy || "",
            cart: result.cart,
            cartRedirectUrl: getCafe24CartUrl(),
            checkoutRedirectUrl: getCafe24CheckoutUrl(),
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create Cafe24 cart.",
            failures: Array.isArray(error?.failures) ? error.failures : [],
        })
    }
}
