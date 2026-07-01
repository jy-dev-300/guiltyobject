const {
    getCafe24TokenStoreInfo,
    readCafe24TokenStore,
    writeCafe24TokenStore,
} = require("./cafe24TokenStore")

function getRequiredEnv(name) {
    const value = process.env[name]

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value
}

function getOptionalEnv(name, fallback = "") {
    return process.env[name] || fallback
}

function getMallApiBaseUrl() {
    const mallId = getRequiredEnv("CAFE24_MALL_ID")
    return `https://${mallId}.cafe24api.com`
}

function getShopNo() {
    return getOptionalEnv("CAFE24_SHOP_NO", "1")
}

function getPublicStoreBaseUrl() {
    return getOptionalEnv("CAFE24_PUBLIC_STORE_URL", "")
}

function getCafe24StoreDomain() {
    const explicitStoreDomain = getOptionalEnv("CAFE24_STORE_DOMAIN", "").trim()
    if (explicitStoreDomain) return explicitStoreDomain

    const publicStoreUrl = getPublicStoreBaseUrl().trim()
    if (!publicStoreUrl) return ""

    try {
        return new URL(publicStoreUrl).host
    } catch (_error) {
        return publicStoreUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    }
}

function trimTrailingSlashes(value) {
    return value.replace(/\/+$/, "")
}

function buildPublicStoreUrl(path) {
    const baseUrl = trimTrailingSlashes(getPublicStoreBaseUrl())
    if (!baseUrl) return ""

    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    return `${baseUrl}${normalizedPath}`
}

function getFramerHomeUrl() {
    return getOptionalEnv("FRAMER_HOME_URL", "")
}

function getCafe24AccountUrl() {
    return (
        getOptionalEnv("CAFE24_ACCOUNT_URL", "") ||
        buildPublicStoreUrl("/myshop/index.html")
    )
}

function getCafe24LoginUrl() {
    return (
        getOptionalEnv("CAFE24_LOGIN_URL", "") ||
        buildPublicStoreUrl("/member/login.html")
    )
}

function getCafe24CartUrl() {
    return buildPublicStoreUrl("/order/basket.html")
}

function getCafe24CheckoutUrl() {
    return (
        getOptionalEnv("CAFE24_CHECKOUT_URL", "") ||
        buildPublicStoreUrl("/order/orderform.html?basket_type=A0000")
    )
}

let cachedOauthAccessToken = ""
let cachedOauthAccessTokenExpiresAt = 0
let cachedOauthRefreshToken = ""
let cachedOauthRefreshTokenExpiresAt = 0

function getOauthTokenUrl() {
    return (
        getOptionalEnv("CAFE24_OAUTH_TOKEN_URL", "").trim() ||
        `${getMallApiBaseUrl()}/api/v2/oauth/token`
    )
}

function hasOauthRefreshConfig() {
    return Boolean(
        getOptionalEnv("CAFE24_CLIENT_ID", "").trim() &&
            getOptionalEnv("CAFE24_CLIENT_SECRET", "").trim()
    )
}

function parseTokenTimestamp(value, fallbackMs = 0) {
    const parsed = Date.parse(String(value || ""))
    if (Number.isFinite(parsed)) return parsed
    return fallbackMs > 0 ? Date.now() + fallbackMs : 0
}

function getRefreshTokenSourceUrl() {
    return getOptionalEnv("CAFE24_REFRESH_TOKEN_SOURCE_URL", "").trim()
}

function getRefreshTokenSourceAuthHeader() {
    return getOptionalEnv("CAFE24_REFRESH_TOKEN_SOURCE_AUTH_HEADER", "").trim()
}

function normalizeOauthTokenPayload(payload) {
    const accessToken = String(payload?.access_token || "").trim()
    const refreshToken = String(payload?.refresh_token || "").trim()
    const accessTokenExpiresAt = parseTokenTimestamp(
        payload?.expires_at,
        45 * 60 * 1000
    )
    const refreshTokenExpiresAt = parseTokenTimestamp(
        payload?.refresh_token_expires_at,
        13 * 24 * 60 * 60 * 1000
    )

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        payload,
    }
}

function applyOauthTokenState(tokenState) {
    if (tokenState.accessToken) {
        cachedOauthAccessToken = tokenState.accessToken
        cachedOauthAccessTokenExpiresAt = tokenState.accessTokenExpiresAt
    }

    if (tokenState.refreshToken) {
        cachedOauthRefreshToken = tokenState.refreshToken
        cachedOauthRefreshTokenExpiresAt = tokenState.refreshTokenExpiresAt
    }
}

async function hydrateRefreshTokenFromSource() {
    const sourceUrl = getRefreshTokenSourceUrl()
    if (!sourceUrl) return null

    const headers = {
        Accept: "application/json",
    }
    const authHeader = getRefreshTokenSourceAuthHeader()
    if (authHeader) {
        headers.Authorization = authHeader
    }

    const response = await fetch(sourceUrl, {
        method: "GET",
        headers,
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
        const detail =
            payload?.error_description ||
            payload?.error?.message ||
            payload?.error ||
            payload?.message ||
            "Cafe24 refresh token source request failed."
        throw new Error(detail)
    }

    const tokenState = normalizeOauthTokenPayload(payload)
    if (!tokenState.refreshToken) {
        throw new Error(
            "Refresh token source response did not include refresh_token."
        )
    }

    applyOauthTokenState(tokenState)
    return tokenState
}

async function ensureOauthRefreshToken() {
    const refreshBufferMs = 24 * 60 * 60 * 1000

    if (
        cachedOauthRefreshToken &&
        cachedOauthRefreshTokenExpiresAt - refreshBufferMs > Date.now()
    ) {
        return cachedOauthRefreshToken
    }

    const envRefreshToken = getOptionalEnv("CAFE24_REFRESH_TOKEN", "").trim()
    if (envRefreshToken && !cachedOauthRefreshToken) {
        cachedOauthRefreshToken = envRefreshToken
        cachedOauthRefreshTokenExpiresAt = parseTokenTimestamp(
            getOptionalEnv("CAFE24_REFRESH_TOKEN_EXPIRES_AT", ""),
            13 * 24 * 60 * 60 * 1000
        )

        if (
            !cachedOauthRefreshTokenExpiresAt ||
            cachedOauthRefreshTokenExpiresAt - refreshBufferMs > Date.now()
        ) {
            return cachedOauthRefreshToken
        }
    }

    const storedTokenState = await readCafe24TokenStore()
    if (storedTokenState?.refreshToken) {
        cachedOauthRefreshToken = storedTokenState.refreshToken
        cachedOauthRefreshTokenExpiresAt = parseTokenTimestamp(
            storedTokenState.refreshTokenExpiresAt,
            13 * 24 * 60 * 60 * 1000
        )
        cachedOauthAccessToken = storedTokenState.accessToken || ""
        cachedOauthAccessTokenExpiresAt = parseTokenTimestamp(
            storedTokenState.accessTokenExpiresAt,
            0
        )

        if (
            !cachedOauthRefreshTokenExpiresAt ||
            cachedOauthRefreshTokenExpiresAt - refreshBufferMs > Date.now()
        ) {
            return cachedOauthRefreshToken
        }
    }

    const sourcedTokenState = await hydrateRefreshTokenFromSource()
    if (sourcedTokenState?.refreshToken) {
        return sourcedTokenState.refreshToken
    }

    if (cachedOauthRefreshToken) {
        return cachedOauthRefreshToken
    }

    throw new Error(
        "No Cafe24 refresh token is available. Set CAFE24_REFRESH_TOKEN or CAFE24_REFRESH_TOKEN_SOURCE_URL."
    )
}

function getFrontApiAuthorization() {
    const clientId = getRequiredEnv("CAFE24_CLIENT_ID")
    const frontApiKey = getRequiredEnv("CAFE24_FRONT_API_KEY")
    const encoded = Buffer.from(`${clientId}:${frontApiKey}`).toString(
        "base64"
    )

    return `Basic ${encoded}`
}

async function fetchOauthAccessToken() {
    const clientId = getRequiredEnv("CAFE24_CLIENT_ID")
    const clientSecret = getRequiredEnv("CAFE24_CLIENT_SECRET")
    const refreshToken = await ensureOauthRefreshToken()

    const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
    })

    const response = await fetch(getOauthTokenUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: params.toString(),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
        const detail =
            payload?.error_description ||
            payload?.error?.message ||
            payload?.error ||
            payload?.message ||
            "Cafe24 OAuth token refresh failed."
        throw new Error(detail)
    }

    const tokenState = normalizeOauthTokenPayload(payload)
    if (!tokenState.accessToken) {
        throw new Error("Cafe24 OAuth token response did not include access_token.")
    }
    applyOauthTokenState(tokenState)
    await writeCafe24TokenStore({
        accessToken: tokenState.accessToken,
        accessTokenExpiresAt: new Date(
            tokenState.accessTokenExpiresAt
        ).toISOString(),
        refreshToken: tokenState.refreshToken,
        refreshTokenExpiresAt: new Date(
            tokenState.refreshTokenExpiresAt
        ).toISOString(),
    })

    return {
        accessToken: tokenState.accessToken,
        expiresAt: tokenState.accessTokenExpiresAt,
        payload,
    }
}

async function getOauthAccessToken() {
    const refreshBufferMs = 60 * 1000

    if (
        cachedOauthAccessToken &&
        cachedOauthAccessTokenExpiresAt - refreshBufferMs > Date.now()
    ) {
        return {
            accessToken: cachedOauthAccessToken,
            expiresAt: cachedOauthAccessTokenExpiresAt,
        }
    }

    const result = await fetchOauthAccessToken()
    return {
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
    }
}

async function getApiAuthorization() {
    const staticBearerToken = getOptionalEnv("CAFE24_ACCESS_TOKEN", "").trim()
    if (staticBearerToken) {
        return `Bearer ${staticBearerToken}`
    }

    if (hasOauthRefreshConfig()) {
        const { accessToken } = await getOauthAccessToken()
        return `Bearer ${accessToken}`
    }

    return getFrontApiAuthorization()
}

async function getCafe24StorefrontAccessToken() {
    const manualWebComponentToken = getOptionalEnv(
        "CAFE24_WEB_COMPONENT_ACCESS_TOKEN",
        ""
    ).trim()
    if (manualWebComponentToken) {
        return {
            accessToken: manualWebComponentToken,
            expiresAt: null,
            source: "env-web-component-token",
        }
    }

    const staticBearerToken = getOptionalEnv("CAFE24_ACCESS_TOKEN", "").trim()
    if (staticBearerToken) {
        return {
            accessToken: staticBearerToken,
            expiresAt: null,
            source: "env-access-token",
        }
    }

    if (hasOauthRefreshConfig()) {
        const { accessToken, expiresAt } = await getOauthAccessToken()
        return {
            accessToken,
            expiresAt,
            source: "oauth-refresh-token",
        }
    }

    throw new Error(
        "Missing Cafe24 storefront token configuration. Set CAFE24_WEB_COMPONENT_ACCESS_TOKEN, or set CAFE24_CLIENT_ID, CAFE24_CLIENT_SECRET, and CAFE24_REFRESH_TOKEN."
    )
}

async function getCafe24StorefrontConfig() {
    const { accessToken, expiresAt, source } =
        await getCafe24StorefrontAccessToken()

    return {
        storeDomain: getCafe24StoreDomain(),
        shopNo: getShopNo(),
        accessToken,
        expiresAt,
        source,
    }
}

async function cafe24FrontFetch(path, options = {}) {
    const authorization = await getApiAuthorization()
    const response = await fetch(`${getMallApiBaseUrl()}${path}`, {
        ...options,
        headers: {
            Authorization: authorization,
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
        const detail =
            payload?.error?.message ||
            payload?.error_description ||
            payload?.error ||
            payload?.message ||
            "Cafe24 Front API request failed."
        throw new Error(detail)
    }

    return payload
}

function pickVariantArray(payload) {
    if (!payload) return []
    if (Array.isArray(payload.variants)) return payload.variants
    if (Array.isArray(payload.resource?.variants)) return payload.resource.variants
    if (Array.isArray(payload.resource)) return payload.resource
    return []
}

function pickVariantCodeCandidate(item) {
    if (!item || typeof item !== "object") return ""

    const candidateKeys = [
        "variants_code",
        "variant_code",
        "item_code",
        "product_code",
        "custom_variant_code",
        "option_value",
    ]

    for (const key of candidateKeys) {
        const value = String(item[key] || "").trim()
        if (value) return value
    }

    return ""
}

async function resolveVariantCode(productNo, explicitVariantCode) {
    if (explicitVariantCode) return explicitVariantCode

    const payload = await cafe24FrontFetch(
        `/api/v2/products/${encodeURIComponent(productNo)}/variants?shop_no=${encodeURIComponent(
            getShopNo()
        )}`,
        {
            method: "GET",
        }
    )
    const [firstVariant] = pickVariantArray(payload)
    const fallbackCode = pickVariantCodeCandidate(firstVariant)

    if (!fallbackCode) {
        throw new Error(
            "No Cafe24 item code was found for this product. Add the Variant Code field in Framer only if you have one, or inspect /api/product/variants?productNo=... to see what Cafe24 returned for this product."
        )
    }

    return fallbackCode
}

async function createCart({
    productNo,
    quantity = 1,
    variantCode = "",
}) {
    const resolvedVariantCode = await resolveVariantCode(productNo, variantCode)
    const normalizedQuantity = Math.max(1, Number(quantity) || 1)
    const shopNo = Number(getShopNo())
    const baseRequestFields = {
        basket_type: "A0000",
        duplicated_item_check: "T",
        prepaid_shipping_fee: "P",
    }
    const attempts = [
        {
            label: "variants-array",
            body: {
                shop_no: shopNo,
                request: {
                    product_no: Number(productNo),
                    ...baseRequestFields,
                    variants: [
                        {
                            quantity: normalizedQuantity,
                            variants_code: resolvedVariantCode,
                        },
                    ],
                },
            },
        },
        {
            label: "variants-array-variant-code",
            body: {
                shop_no: shopNo,
                request: {
                    product_no: Number(productNo),
                    ...baseRequestFields,
                    variants: [
                        {
                            quantity: normalizedQuantity,
                            variant_code: resolvedVariantCode,
                        },
                    ],
                },
            },
        },
        {
            label: "top-level-variants-code",
            body: {
                shop_no: shopNo,
                request: {
                    product_no: Number(productNo),
                    quantity: normalizedQuantity,
                    variants_code: resolvedVariantCode,
                    ...baseRequestFields,
                },
            },
        },
        {
            label: "top-level-variant-code",
            body: {
                shop_no: shopNo,
                request: {
                    product_no: Number(productNo),
                    quantity: normalizedQuantity,
                    variant_code: resolvedVariantCode,
                    ...baseRequestFields,
                },
            },
        },
        {
            label: "products-array",
            body: {
                shop_no: shopNo,
                request: {
                    ...baseRequestFields,
                    products: [
                        {
                            product_no: Number(productNo),
                            quantity: normalizedQuantity,
                            variants_code: resolvedVariantCode,
                        },
                    ],
                },
            },
        },
        {
            label: "items-array",
            body: {
                shop_no: shopNo,
                request: {
                    ...baseRequestFields,
                    items: [
                        {
                            product_no: Number(productNo),
                            quantity: normalizedQuantity,
                            variants_code: resolvedVariantCode,
                        },
                    ],
                },
            },
        },
    ]

    const failures = []
    let payload = null
    let successfulStrategy = ""

    for (const attempt of attempts) {
        const authorization = await getApiAuthorization()
        const response = await fetch(`${getMallApiBaseUrl()}/api/v2/carts`, {
            method: "POST",
            headers: {
                Authorization: authorization,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(attempt.body),
        })

        const attemptPayload = await response.json().catch(() => null)

        if (response.ok) {
            payload = attemptPayload
            successfulStrategy = attempt.label
            break
        }

        failures.push({
            strategy: attempt.label,
            status: response.status,
            detail:
                attemptPayload?.error?.message ||
                attemptPayload?.error_description ||
                attemptPayload?.error ||
                attemptPayload?.message ||
                "Cafe24 cart request failed.",
        })
    }

    if (!payload) {
        const error = new Error(
            failures[failures.length - 1]?.detail ||
                "Failed to create Cafe24 cart."
        )
        error.failures = failures
        throw error
    }

    return {
        cart: payload,
        resolvedVariantCode,
        strategy: successfulStrategy,
    }
}

function getCafe24Urls() {
    return {
        homeUrl: getFramerHomeUrl(),
        accountUrl: getCafe24AccountUrl(),
        loginUrl: getCafe24LoginUrl(),
        cartUrl: getCafe24CartUrl(),
        checkoutUrl: getCafe24CheckoutUrl(),
    }
}

module.exports = {
    cafe24FrontFetch,
    createCart,
    getCafe24AccountUrl,
    getCafe24CartUrl,
    getCafe24CheckoutUrl,
    getCafe24LoginUrl,
    getCafe24StoreDomain,
    getCafe24StorefrontConfig,
    getCafe24TokenStoreInfo,
    getCafe24Urls,
    getFramerHomeUrl,
    getPublicStoreBaseUrl,
    getShopNo,
    hasOauthRefreshConfig,
    pickVariantArray,
}
