const crypto = require("crypto")

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

function getBasicAuthorization() {
    const clientId = getRequiredEnv("CAFE24_CLIENT_ID")
    const clientSecret = getRequiredEnv("CAFE24_CLIENT_SECRET")
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
        "base64"
    )

    return `Basic ${encoded}`
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

async function requestCafe24Token(body) {
    const response = await fetch(`${getMallApiBaseUrl()}/api/v2/oauth/token`, {
        method: "POST",
        headers: {
            Authorization: getBasicAuthorization(),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(body).toString(),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
        const detail =
            payload?.error_description ||
            payload?.error ||
            "Cafe24 token request failed."
        throw new Error(detail)
    }

    return payload
}

async function exchangeAuthorizationCode(code) {
    return requestCafe24Token({
        grant_type: "authorization_code",
        code,
        redirect_uri: getRequiredEnv("CAFE24_REDIRECT_URI"),
    })
}

async function refreshAccessToken() {
    return requestCafe24Token({
        grant_type: "refresh_token",
        refresh_token: getRequiredEnv("CAFE24_REFRESH_TOKEN"),
    })
}

async function cafe24Fetch(path, options = {}) {
    const tokenPayload = await refreshAccessToken()
    const response = await fetch(`${getMallApiBaseUrl()}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${tokenPayload.access_token}`,
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
        const detail =
            payload?.error?.message ||
            payload?.message ||
            "Cafe24 API request failed."
        throw new Error(detail)
    }

    return {
        tokenPayload,
        payload,
    }
}

function pickVariantArray(payload) {
    if (!payload) return []
    if (Array.isArray(payload.variants)) return payload.variants
    if (Array.isArray(payload.resource?.variants)) return payload.resource.variants
    if (Array.isArray(payload.resource)) return payload.resource
    return []
}

async function resolveVariantCode(productNo, explicitVariantCode) {
    if (explicitVariantCode) return explicitVariantCode

    const { payload } = await cafe24Fetch(
        `/api/v2/products/${encodeURIComponent(productNo)}/variants?shop_no=${encodeURIComponent(
            getShopNo()
        )}`,
        {
            method: "GET",
        }
    )
    const [firstVariant] = pickVariantArray(payload)

    if (!firstVariant?.variants_code) {
        throw new Error(
            "No Cafe24 variant code was found for this product. Add the Variant Code in Framer or verify the product number."
        )
    }

    return firstVariant.variants_code
}

async function createCart({
    productNo,
    quantity = 1,
    variantCode = "",
}) {
    const resolvedVariantCode = await resolveVariantCode(productNo, variantCode)
    const requestBody = {
        shop_no: Number(getShopNo()),
        request: {
            product_no: Number(productNo),
            basket_type: "A0000",
            duplicated_item_check: "T",
            prepaid_shipping_fee: "P",
            variants: [
                {
                    quantity: Math.max(1, Number(quantity) || 1),
                    variants_code: resolvedVariantCode,
                },
            ],
        },
    }

    const { payload, tokenPayload } = await cafe24Fetch("/api/v2/carts", {
        method: "POST",
        body: JSON.stringify(requestBody),
    })

    return {
        cart: payload,
        token: tokenPayload,
        resolvedVariantCode,
    }
}

async function getMemberCart({
    memberId,
    limit = 100,
    offset = 0,
}) {
    const normalizedMemberId = String(memberId || "").trim()

    if (!normalizedMemberId) {
        throw new Error("Missing required field: memberId")
    }

    const query = new URLSearchParams({
        shop_no: getShopNo(),
        member_id: normalizedMemberId,
        limit: String(Math.min(100, Math.max(1, Number(limit) || 100))),
        offset: String(Math.max(0, Number(offset) || 0)),
    })

    const { payload, tokenPayload } = await cafe24Fetch(
        `/api/v2/admin/carts?${query.toString()}`,
        {
            method: "GET",
        }
    )

    return {
        cart: payload,
        token: tokenPayload,
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

function buildAuthorizeUrl(state) {
    const authorizeUrl = new URL(
        `${getMallApiBaseUrl()}/api/v2/oauth/authorize`
    )
    authorizeUrl.searchParams.set("response_type", "code")
    authorizeUrl.searchParams.set("client_id", getRequiredEnv("CAFE24_CLIENT_ID"))
    authorizeUrl.searchParams.set("state", state)
    authorizeUrl.searchParams.set(
        "redirect_uri",
        getRequiredEnv("CAFE24_REDIRECT_URI")
    )
    authorizeUrl.searchParams.set(
        "scope",
        getRequiredEnv("CAFE24_SCOPES")
    )

    return authorizeUrl.toString()
}

function createState() {
    return crypto.randomBytes(24).toString("hex")
}

module.exports = {
    buildAuthorizeUrl,
    cafe24Fetch,
    createCart,
    createState,
    exchangeAuthorizationCode,
    getCafe24AccountUrl,
    getCafe24CartUrl,
    getCafe24CheckoutUrl,
    getCafe24LoginUrl,
    getCafe24Urls,
    getFramerHomeUrl,
    getMemberCart,
    getPublicStoreBaseUrl,
    getShopNo,
}
