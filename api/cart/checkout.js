const {
    createCart,
    getCafe24CartUrl,
    getCafe24CheckoutUrl,
} = require("../../lib/cafe24")

function collectInterestingCartFields(value, path = "", depth = 0, acc = {}) {
    if (!value || typeof value !== "object" || depth > 3) {
        return acc
    }

    for (const [key, nestedValue] of Object.entries(value)) {
        const nextPath = path ? `${path}.${key}` : key
        const normalizedKey = key.toLowerCase()
        const isInterestingKey =
            normalizedKey.includes("url") ||
            normalizedKey.includes("uri") ||
            normalizedKey.includes("id") ||
            normalizedKey.includes("basket") ||
            normalizedKey.includes("cart") ||
            normalizedKey.includes("token") ||
            normalizedKey.includes("session")

        if (
            isInterestingKey &&
            (typeof nestedValue === "string" ||
                typeof nestedValue === "number" ||
                typeof nestedValue === "boolean" ||
                nestedValue == null)
        ) {
            acc[nextPath] = nestedValue
        }

        if (Array.isArray(nestedValue)) {
            if (isInterestingKey) {
                acc[`${nextPath}.length`] = nestedValue.length
            }

            for (let index = 0; index < nestedValue.length; index += 1) {
                const entry = nestedValue[index]
                if (entry && typeof entry === "object") {
                    collectInterestingCartFields(
                        entry,
                        `${nextPath}[${index}]`,
                        depth + 1,
                        acc
                    )
                }
            }
            continue
        }

        if (nestedValue && typeof nestedValue === "object") {
            collectInterestingCartFields(
                nestedValue,
                nextPath,
                depth + 1,
                acc
            )
        }
    }

    return acc
}

function describePayloadShape(value, depth = 0) {
    if (depth > 4) return "[MaxDepth]"
    if (value == null) return value

    if (Array.isArray(value)) {
        if (value.length <= 0) return []
        return [describePayloadShape(value[0], depth + 1)]
    }

    if (typeof value !== "object") {
        return typeof value
    }

    const shape = {}

    for (const [key, nestedValue] of Object.entries(value)) {
        shape[key] = describePayloadShape(nestedValue, depth + 1)
    }

    return shape
}

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
            const cartDebug = collectInterestingCartFields(cartPayload)
            const cartResponseKeys =
                cartPayload && typeof cartPayload === "object"
                    ? Object.keys(cartPayload)
                    : []
            const cartResponseShape = describePayloadShape(cartPayload)

            results.push({
                productNo: item.productNo,
                resolvedVariantCode: result.resolvedVariantCode,
                cartDebug,
                cartResponseKeys,
                cartResponseShape,
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
