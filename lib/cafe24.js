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

function getFrontApiAuthorization() {
    const clientId = getRequiredEnv("CAFE24_CLIENT_ID")
    const frontApiKey = getRequiredEnv("CAFE24_FRONT_API_KEY")
    const encoded = Buffer.from(`${clientId}:${frontApiKey}`).toString(
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

async function cafe24FrontFetch(path, options = {}) {
    const response = await fetch(`${getMallApiBaseUrl()}${path}`, {
        ...options,
        headers: {
            Authorization: getFrontApiAuthorization(),
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

    const payload = await cafe24FrontFetch("/api/v2/carts", {
        method: "POST",
        body: JSON.stringify(requestBody),
    })

    return {
        cart: payload,
        resolvedVariantCode,
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
    getCafe24Urls,
    getFramerHomeUrl,
    getPublicStoreBaseUrl,
    getShopNo,
    pickVariantArray,
}
