const fs = require("fs/promises")
const os = require("os")
const path = require("path")

function getOptionalEnv(name, fallback = "") {
    return process.env[name] || fallback
}

function resolveConfiguredTokenStorePath() {
    const explicitPath = getOptionalEnv("CAFE24_TOKEN_STORE_PATH", "").trim()
    if (explicitPath) {
        return {
            path: path.resolve(explicitPath),
            source: "env-path",
            isDurable: true,
        }
    }

    if (process.env.VERCEL) {
        return {
            path: path.join(os.tmpdir(), "cafe24-token-store.json"),
            source: "vercel-temp",
            isDurable: false,
        }
    }

    return {
        path: path.join(process.cwd(), ".local", "cafe24-token-store.json"),
        source: "local-default",
        isDurable: true,
    }
}

function normalizeTokenStorePayload(payload) {
    const refreshToken = String(payload?.refreshToken || "").trim()
    if (!refreshToken) return null

    return {
        refreshToken,
        refreshTokenExpiresAt: String(
            payload?.refreshTokenExpiresAt || ""
        ).trim(),
        accessToken: String(payload?.accessToken || "").trim(),
        accessTokenExpiresAt: String(payload?.accessTokenExpiresAt || "").trim(),
        updatedAt: String(payload?.updatedAt || "").trim(),
    }
}

async function readCafe24TokenStore() {
    const tokenStore = resolveConfiguredTokenStorePath()

    try {
        const raw = await fs.readFile(tokenStore.path, "utf8")
        return normalizeTokenStorePayload(JSON.parse(raw))
    } catch (error) {
        if (error && error.code === "ENOENT") return null
        throw error
    }
}

async function writeCafe24TokenStore(tokenState) {
    const tokenStore = resolveConfiguredTokenStorePath()
    const payload = normalizeTokenStorePayload({
        refreshToken: tokenState?.refreshToken || "",
        refreshTokenExpiresAt: tokenState?.refreshTokenExpiresAt || "",
        accessToken: tokenState?.accessToken || "",
        accessTokenExpiresAt: tokenState?.accessTokenExpiresAt || "",
        updatedAt: new Date().toISOString(),
    })

    if (!payload) {
        return {
            ok: false,
            path: tokenStore.path,
            source: tokenStore.source,
            isDurable: tokenStore.isDurable,
            message: "No refresh token was available to persist.",
        }
    }

    await fs.mkdir(path.dirname(tokenStore.path), { recursive: true })
    await fs.writeFile(tokenStore.path, JSON.stringify(payload, null, 2), "utf8")

    return {
        ok: true,
        path: tokenStore.path,
        source: tokenStore.source,
        isDurable: tokenStore.isDurable,
    }
}

function getCafe24TokenStoreInfo() {
    return resolveConfiguredTokenStorePath()
}

module.exports = {
    getCafe24TokenStoreInfo,
    readCafe24TokenStore,
    writeCafe24TokenStore,
}
