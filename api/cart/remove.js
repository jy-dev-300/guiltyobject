module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        res.status(204).end()
        return
    }

    if (req.method !== "DELETE") {
        res.status(405).json({ ok: false, message: "Method not allowed." })
        return
    }

    res.status(501).json({
        ok: false,
        message:
            "Cafe24's official documented APIs exposed in this project support cart creation and member-cart retrieval, but not documented item-level cart deletion for this backend flow.",
    })
}
