const { buildAuthorizeUrl, createState } = require("../../../lib/cafe24")

module.exports = async (_req, res) => {
    try {
        const state = createState()

        res.setHeader(
            "Set-Cookie",
            `cafe24_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
        )
        res.redirect(buildAuthorizeUrl(state))
    } catch (error) {
        res.status(500).send(
            error instanceof Error
                ? error.message
                : "Unable to start Cafe24 OAuth."
        )
    }
}
