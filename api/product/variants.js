const { cafe24FrontFetch, getShopNo, pickVariantArray } = require("../../lib/cafe24")

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
        const productNo = String(req.query?.productNo || "").trim()

        if (!productNo) {
            res.status(400).json({
                ok: false,
                message: "Missing required query parameter: productNo",
            })
            return
        }

        const payload = await cafe24FrontFetch(
            `/api/v2/products/${encodeURIComponent(productNo)}/variants?shop_no=${encodeURIComponent(
                getShopNo()
            )}`,
            {
                method: "GET",
            }
        )

        res.status(200).json({
            ok: true,
            productNo,
            variantCount: pickVariantArray(payload).length,
            variants: pickVariantArray(payload),
            raw: payload,
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to load Cafe24 product variants.",
        })
    }
}
