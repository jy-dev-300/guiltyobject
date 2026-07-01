import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import ReactSlickModule from "react-slick"

type MirrorShopProps = {
    useCafe24: boolean
    showCafe24VariantHelper: boolean
    cafe24BackendUrl: string
    cafe24StoreDomain: string
    cafe24ShopNo: string
    cafe24AccessToken: string
    cafe24ProductHandle: string
    cafe24ProductNo: string
    cafe24VariantId: string
    cafe24BuyNowLabel: string
    title: string
    description: string
    price: string
    buttonLabel: string
    colorLabel: string
    descriptionLabel: string
    sizeGuideLabel: string
    shippingReturnsLabel: string
    sizeGuideText: string
    shippingReturnsText: string
    colorButtons: ColorButtonControl[]
    defaultColorIndex: number
    carouselItems: CarouselItemControl[]
    imageScales: number[]
    imageTopMargins: number[]
    imageBottomMargins: number[]
    imageLeftMargins: number[]
    imageRightMargins: number[]
    imageFits: ("cover" | "contain")[]
    imageFullColumn: boolean[]
    imageColumnModes: ("auto" | "full")[]
    imageCropX: number[]
    imageCropY: number[]
    carouselPaddingLeft: number
    carouselPaddingRight: number
    rightColumnTopMargin: number
    rightColumnPaddingX: number
    rightColumnGap: number
    displayFontFamily: string
    bodyFontFamily: string
    bodyFontSize: number
    titleFontSize: number
    titleLineHeight: number
    titleColor: string
    titleToPriceGap: number
    priceFontSize: number
    buttonFontSize: number
    addToCartWidth: number
    addToCartFill: string
    addToCartBorderColor: string
    addToCartBorderWidth: number
    addToCartBorderRadius: number
    addToCartTextColor: string
    collapsableTextWidth: number
    priceToColorGap: number
    colorButtonHeight: number
    colorButtonWidth: number
    colorButtonRadius: number
    colorLabelGap: number
    colorGridColumns: number
    colorButtonColumnGap: number
    colorButtonRowGap: number
    colorImageScale: number
    colorImageFit: "cover" | "contain"
    carouselArrowColor: string
    carouselArrowSize: number
}

type FramerImage = {
    src?: string
    alt?: string
}

type CarouselItemControl = {
    src?: string
    image?: FramerImage
    video?: string
    fullWidth: boolean
    cropX: number
    cropY: number
    scale?: number
    topMargin?: number
    bottomMargin?: number
    leftMargin?: number
    rightMargin?: number
    autoPlay?: boolean
    muted?: boolean
    loop?: boolean
}

type CarouselMediaItem = {
    src: string
    alt: string
    kind: "image" | "video"
    fullWidth: boolean
    cropX: number
    cropY: number
    scale: number
    topMargin: number
    bottomMargin: number
    leftMargin: number
    rightMargin: number
    autoPlay: boolean
    muted: boolean
    loop: boolean
}

type ColorButtonControl = {
    label: string
    image: string
    link: string
}

const defaultCarouselItems: CarouselItemControl[] = []
const SlickSlider =
    (ReactSlickModule as unknown as { default?: React.ComponentType<any> })
        .default ?? (ReactSlickModule as unknown as React.ComponentType<any>)

function getMediaKind(src: string): "image" | "video" {
    const normalizedSrc = src.split("?")[0].split("#")[0].toLowerCase()
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m4v"]

    return videoExtensions.some((extension) =>
        normalizedSrc.endsWith(extension)
    )
        ? "video"
        : "image"
}

const defaultSizes = [
    "X-Small",
    "Small",
    "Medium",
    "Large",
    "X-Large",
    "XX-Large",
]
const defaultColorButtons: ColorButtonControl[] = defaultSizes.map((label) => ({
    label,
    image: "",
    link: "",
}))

const defaultDescription = [
    "REVERSIBLE PUFFER JACKET",
    "PUFFY ON BOTH SIDES",
    "BLACK SIDE & SILVER SIDE",
    "CONCEALED & FLEECE LINED ZIP POCKETS ON BOTH SIDES",
    "U-SHAPED RUBBER ZIP PULL & BLACK PLASTIC ZIPPER",
    "ADJUSTABLE ELASTIC WITH METAL TOGGLES ON WAIST",
    "ELASTIC CUFFS & HOOD",
    "FAUX DOWN",
    "CHEST AND RIGHT SLEEVE EMBROIDERY",
    "BACK REFLECTIVE PRINT",
    "FITS TRUE TO SIZE",
].join("\n")

function getCarouselItemSource(item: CarouselItemControl): {
    src: string
    alt: string
} {
    const legacySrc = item.src?.trim() || ""
    const imageSrc = item.image?.src?.trim() || ""

    if (legacySrc) {
        return {
            src: legacySrc,
            alt: item.image?.alt?.trim() || "",
        }
    }

    if (imageSrc) {
        return {
            src: imageSrc,
            alt: item.image?.alt?.trim() || "",
        }
    }

    return {
        src: item.video?.trim() || "",
        alt: "",
    }
}

function escapeHtmlAttribute(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

function joinUrl(baseUrl: string, path: string): string {
    const normalizedBase = baseUrl.trim().replace(/\/+$/, "")
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    return `${normalizedBase}${normalizedPath}`
}

function normalizeStoreDomain(value: string): string {
    const trimmedValue = value.trim()
    if (!trimmedValue) return ""

    try {
        const candidate = /^https?:\/\//i.test(trimmedValue)
            ? trimmedValue
            : `https://${trimmedValue}`
        return new URL(candidate).host.trim()
    } catch (_error) {
        return trimmedValue
            .replace(/^https?:\/\//i, "")
            .replace(/\/.*$/, "")
            .trim()
    }
}

type Cafe24CommerceBridgeProps = {
    enabled: boolean
    showVariantHelper: boolean
    backendUrl: string
    storeDomain: string
    shopNo: string
    accessToken: string
    productHandle: string
    productNo: string
    variantId: string
    addToCartLabel: string
    buyNowLabel: string
    bodyFontFamily: string
    bodyFontSize: number
    buttonFontSize: number
    addToCartWidth: number
    addToCartFill: string
    addToCartBorderColor: string
    addToCartBorderWidth: number
    addToCartBorderRadius: number
    addToCartTextColor: string
}

function Cafe24CommerceBridge(props: Cafe24CommerceBridgeProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null)
    const idsRef = React.useRef<{ storeId: string; cartId: string } | null>(
        null
    )
    const [resolvedProductNo, setResolvedProductNo] = React.useState("")
    const [resolvedSelectedVariantId, setResolvedSelectedVariantId] =
        React.useState("")
    const [contextDebugJson, setContextDebugJson] = React.useState("")
    const [variantRecords, setVariantRecords] = React.useState<any[]>([])
    const [variantLookupMessage, setVariantLookupMessage] = React.useState("")
    const [remoteConfig, setRemoteConfig] = React.useState<{
        storeDomain: string
        shopNo: string
        accessToken: string
        source: string
    }>({
        storeDomain: "",
        shopNo: "",
        accessToken: "",
        source: "",
    })
    const [debugInfo, setDebugInfo] = React.useState<{
        storefrontConfigPath: string
        source: string
        expiresAt: string | null
        storeDomain: string
        shopNo: string
        publicStoreUrl: string
        hasOauthRefreshConfig: boolean
        tokenStorePath: string
        tokenStoreSource: string
        tokenStoreIsDurable: boolean
        hasPersistedRefreshToken: boolean
        persistedRefreshTokenExpiresAt: string | null
        hasAccessToken: boolean
        accessTokenPreview: string
        accessTokenLength: number
    } | null>(null)
    const [debugMessage, setDebugMessage] = React.useState("")
    const [configStatus, setConfigStatus] = React.useState<
        "idle" | "loading" | "ready" | "error"
    >("idle")
    const [configMessage, setConfigMessage] = React.useState("")
    const [scriptStatus, setScriptStatus] = React.useState<
        "idle" | "loading" | "ready" | "error"
    >("idle")
    const [renderStatus, setRenderStatus] = React.useState<
        "idle" | "mounting" | "rendered" | "timeout"
    >("idle")

    if (!idsRef.current) {
        const key = Math.random().toString(36).slice(2, 10)
        idsRef.current = {
            storeId: `cafe24-store-${key}`,
            cartId: `cafe24-cart-${key}`,
        }
    }

    React.useEffect(() => {
        if (!props.enabled || typeof window === "undefined") return

        if (window.customElements?.get("cafe24-store")) {
            setScriptStatus("ready")
            return
        }

        const existingScript = document.querySelector<HTMLScriptElement>(
            'script[data-cafe24-web-components="true"]'
        )

        if (existingScript) {
            setScriptStatus("loading")

            const markReady = () => setScriptStatus("ready")
            const markError = () => setScriptStatus("error")

            existingScript.addEventListener("load", markReady)
            existingScript.addEventListener("error", markError)

            return () => {
                existingScript.removeEventListener("load", markReady)
                existingScript.removeEventListener("error", markError)
            }
        }

        const script = document.createElement("script")
        script.type = "module"
        script.src =
            "https://cdn.cafe24.com/web-components/cafe24-web-components.js"
        script.async = true
        script.dataset.cafe24WebComponents = "true"
        setScriptStatus("loading")
        script.addEventListener("load", () => {
            setScriptStatus("ready")
        })
        script.addEventListener("error", () => {
            setScriptStatus("error")
        })
        document.head.appendChild(script)
    }, [props.enabled])

    React.useEffect(() => {
        const manualStoreDomain = normalizeStoreDomain(props.storeDomain)
        const manualShopNo = props.shopNo.trim()
        const manualAccessToken = props.accessToken.trim()
        const backendUrl = props.backendUrl.trim()

        if (!props.enabled) {
            setRemoteConfig({
                storeDomain: "",
                shopNo: "",
                accessToken: "",
                source: "",
            })
            setDebugInfo(null)
            setDebugMessage("")
            setConfigStatus("idle")
            setConfigMessage("")
            return
        }

        if (!backendUrl && manualStoreDomain && manualShopNo && manualAccessToken) {
            setConfigStatus("ready")
            setConfigMessage("")
            return
        }

        if (!backendUrl) {
            setConfigStatus("idle")
            setConfigMessage("")
            return
        }

        let isCancelled = false
        setConfigStatus("loading")
        setConfigMessage("")
        setDebugMessage("")

        window
            .fetch(joinUrl(backendUrl, "/api/storefront/config"), {
                method: "GET",
            })
            .then(async (response) => {
                const result = await response
                    .json()
                    .catch(() => ({ ok: false, message: "Invalid JSON" }))

                if (!response.ok) {
                    throw new Error(
                        String(
                            result?.message ||
                                "Unable to load Cafe24 storefront config."
                        )
                    )
                }

                if (isCancelled) return

                setRemoteConfig({
                    storeDomain: String(
                        result?.config?.storeDomain || ""
                    ).trim(),
                    shopNo: String(result?.config?.shopNo || "").trim(),
                    accessToken: String(
                        result?.config?.accessToken || ""
                    ).trim(),
                    source: String(result?.config?.source || "").trim(),
                })
                setConfigStatus("ready")
                setConfigMessage("")
            })
            .catch((error) => {
                if (isCancelled) return

                setRemoteConfig({
                    storeDomain: "",
                    shopNo: "",
                    accessToken: "",
                    source: "",
                })
                setConfigStatus("error")
                setConfigMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to load Cafe24 storefront config."
                )
            })

        window
            .fetch(joinUrl(backendUrl, "/api/storefront/debug"), {
                method: "GET",
            })
            .then(async (response) => {
                const result = await response
                    .json()
                    .catch(() => ({ ok: false, message: "Invalid JSON" }))

                if (!response.ok) {
                    throw new Error(
                        String(
                            result?.message ||
                                "Unable to load Cafe24 storefront debug info."
                        )
                    )
                }

                if (isCancelled) return

                setDebugInfo({
                    storefrontConfigPath: String(
                        result?.debug?.storefrontConfigPath || ""
                    ).trim(),
                    source: String(result?.debug?.source || "").trim(),
                    expiresAt: result?.debug?.expiresAt || null,
                    storeDomain: String(result?.debug?.storeDomain || "").trim(),
                    shopNo: String(result?.debug?.shopNo || "").trim(),
                    publicStoreUrl: String(
                        result?.debug?.publicStoreUrl || ""
                    ).trim(),
                    hasOauthRefreshConfig: Boolean(
                        result?.debug?.hasOauthRefreshConfig
                    ),
                    tokenStorePath: String(
                        result?.debug?.tokenStorePath || ""
                    ).trim(),
                    tokenStoreSource: String(
                        result?.debug?.tokenStoreSource || ""
                    ).trim(),
                    tokenStoreIsDurable: Boolean(
                        result?.debug?.tokenStoreIsDurable
                    ),
                    hasPersistedRefreshToken: Boolean(
                        result?.debug?.hasPersistedRefreshToken
                    ),
                    persistedRefreshTokenExpiresAt:
                        result?.debug?.persistedRefreshTokenExpiresAt || null,
                    hasAccessToken: Boolean(result?.debug?.hasAccessToken),
                    accessTokenPreview: String(
                        result?.debug?.accessTokenPreview || ""
                    ).trim(),
                    accessTokenLength: Number(
                        result?.debug?.accessTokenLength || 0
                    ),
                })
            })
            .catch((error) => {
                if (isCancelled) return

                setDebugInfo(null)
                setConfigStatus("error")
                setConfigMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to load Cafe24 storefront debug info."
                )
                setDebugMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to load Cafe24 storefront debug info."
                )
            })

        return () => {
            isCancelled = true
        }
    }, [
        props.accessToken,
        props.backendUrl,
        props.enabled,
        props.shopNo,
        props.storeDomain,
    ])

    React.useEffect(() => {
        const container = containerRef.current
        const ids = idsRef.current
        if (!container || !ids) return

        if (!props.enabled) {
            setResolvedProductNo("")
            setResolvedSelectedVariantId("")
            setContextDebugJson("")
            container.innerHTML = ""
            setRenderStatus("idle")
            return
        }

        if (scriptStatus !== "ready") {
            setResolvedProductNo("")
            setResolvedSelectedVariantId("")
            setContextDebugJson("")
            container.innerHTML = ""
            setRenderStatus("idle")
            return
        }

        const shouldPreferBackendConfig = Boolean(props.backendUrl.trim())
        const storeDomain = shouldPreferBackendConfig
            ? normalizeStoreDomain(remoteConfig.storeDomain) ||
              normalizeStoreDomain(props.storeDomain)
            : normalizeStoreDomain(props.storeDomain) ||
              normalizeStoreDomain(remoteConfig.storeDomain)
        const shopNo = shouldPreferBackendConfig
            ? remoteConfig.shopNo.trim() || props.shopNo.trim()
            : props.shopNo.trim() || remoteConfig.shopNo.trim()
        const accessToken = shouldPreferBackendConfig
            ? remoteConfig.accessToken.trim() || props.accessToken.trim()
            : props.accessToken.trim() || remoteConfig.accessToken.trim()
        const productHandle = props.productHandle.trim()
        const productNo = props.productNo.trim()
        const variantId = props.variantId.trim()
        const normalizedProductHandle = productHandle || productNo
        const productReferenceValue = normalizedProductHandle

        if (!storeDomain || !shopNo || !accessToken || !productReferenceValue) {
            setResolvedProductNo("")
            setResolvedSelectedVariantId("")
            setContextDebugJson("")
            container.innerHTML = ""
            setRenderStatus("idle")
            return
        }

        const buttonRadius = `${props.addToCartBorderRadius}px`
        const buttonBorder = `${props.addToCartBorderWidth}px solid ${props.addToCartBorderColor}`
        const bodyLineHeight = `${Math.round(props.bodyFontSize * 1.6)}px`
        const contextReferenceAttribute = `handle="${escapeHtmlAttribute(
            normalizedProductHandle
        )}"`
        setRenderStatus("mounting")

        setDebugMessage("")

        container.innerHTML = `
            <style>
                .c24-commerce {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: ${props.addToCartWidth}%;
                    font-family: ${escapeHtmlAttribute(props.bodyFontFamily)};
                    color: #000000;
                }

                .c24-commerce__button {
                    appearance: none;
                    border: ${buttonBorder};
                    border-radius: ${buttonRadius};
                    width: 100%;
                    min-height: 52px;
                    cursor: pointer;
                    padding: 14px 18px;
                    font-family: ${escapeHtmlAttribute(props.bodyFontFamily)};
                    font-size: ${props.buttonFontSize}px;
                    line-height: ${bodyLineHeight};
                    transition: opacity 0.2s ease;
                }

                .c24-commerce__button[disabled] {
                    cursor: not-allowed;
                    opacity: 0.45;
                }

                .c24-commerce__button--cart {
                    background: ${props.addToCartFill};
                    color: ${props.addToCartTextColor};
                }

                .c24-commerce__button--buy {
                    background: #ffffff;
                    color: #000000;
                }
            </style>

            <cafe24-store
                id="${escapeHtmlAttribute(ids.storeId)}"
                store-domain="${escapeHtmlAttribute(storeDomain)}"
                shop-no="${escapeHtmlAttribute(shopNo)}"
                access-token="${escapeHtmlAttribute(accessToken)}"
            ></cafe24-store>

            <cafe24-context type="product" ${contextReferenceAttribute}>
                <template>
                    <div class="c24-commerce">
                        <button
                            type="button"
                            class="c24-commerce__button c24-commerce__button--cart"
                            onclick="document.getElementById('${escapeHtmlAttribute(ids.cartId)}')?.addLine(event)?.showModal?.()"
                            cafe24-attr--disabled="!isSelling || !isPurchasable"
                        >
                            ${escapeHtmlAttribute(props.addToCartLabel)}
                        </button>

                        <button
                            type="button"
                            class="c24-commerce__button c24-commerce__button--buy"
                            onclick="document.getElementById('${escapeHtmlAttribute(ids.storeId)}')?.buyNow(event)"
                            cafe24-attr--disabled="!isSelling || !isPurchasable"
                        >
                            ${escapeHtmlAttribute(props.buyNowLabel)}
                        </button>
                    </div>
                </template>
                <div cafe24-loading-placeholder style="font-family: ${escapeHtmlAttribute(props.bodyFontFamily)}; font-size: ${props.bodyFontSize}px; line-height: ${bodyLineHeight}; color: #000000;">
                    Loading Cafe24 buttons...
                </div>
            </cafe24-context>

            <cafe24-cart id="${escapeHtmlAttribute(ids.cartId)}"></cafe24-cart>
        `

        const syncRenderedState = () => {
            const renderedButtons = container.querySelector(
                ".c24-commerce__button"
            )

            if (renderedButtons) {
                setRenderStatus("rendered")
            }
        }

        syncRenderedState()

        const contextElement = container.querySelector<HTMLElement>(
            "cafe24-context"
        )
        const storeElement = container.querySelector<HTMLElement>("cafe24-store")
        const syncContextDebugInfo = () => {
            if (!contextElement) return

            const contextData = (
                contextElement as HTMLElement & {
                    getContextData?: () => {
                        productNo?: string | number
                        product_no?: string | number
                        selectedVariantId?: string | number | null
                        productHandle?: string
                        handle?: string
                        [key: string]: unknown
                    } | null
                }
            ).getContextData?.()

            const nextProductNo = String(
                contextData?.productNo ?? contextData?.product_no ?? ""
            ).trim()
            const nextSelectedVariantId = String(
                contextData?.selectedVariantId ?? ""
            ).trim()

            setResolvedProductNo(nextProductNo)
            setResolvedSelectedVariantId(nextSelectedVariantId)
            setContextDebugJson(
                contextData
                    ? JSON.stringify(contextData, null, 2)
                    : "(getContextData() returned nothing)"
            )
        }
        const applyManualVariantSelection = () => {
            if (!variantId || !contextElement) return

            const setSelectedVariant = (
                contextElement as HTMLElement & {
                    setSelectedVariant?: (nextVariantId: string) => void
                }
            ).setSelectedVariant

            if (typeof setSelectedVariant === "function") {
                setSelectedVariant.call(contextElement, variantId)
            }

            syncContextDebugInfo()
        }

        syncContextDebugInfo()
        applyManualVariantSelection()
        const syncElementDebugInfo = (event?: Event) => {
            const eventType = event?.type || "unknown"
            const detail = (() => {
                const rawDetail = (event as Event & { detail?: unknown })?.detail
                if (!rawDetail) return ""

                try {
                    return JSON.stringify(rawDetail, null, 2)
                } catch (_error) {
                    return String(rawDetail)
                }
            })()

            const storeHtml = storeElement?.outerHTML
                ? storeElement.outerHTML.slice(0, 600)
                : ""
            const contextHtml = contextElement?.outerHTML
                ? contextElement.outerHTML.slice(0, 600)
                : ""

            setDebugMessage(
                [
                    `Last Cafe24 event: ${eventType}`,
                    detail ? `Detail: ${detail}` : "",
                    storeHtml ? `Store snapshot: ${storeHtml}` : "",
                    contextHtml ? `Context snapshot: ${contextHtml}` : "",
                ]
                    .filter(Boolean)
                    .join("\n\n")
            )
        }
        contextElement?.addEventListener(
            "cafe24-context-rendered",
            applyManualVariantSelection as EventListener
        )
        contextElement?.addEventListener(
            "cafe24-variant-changed",
            syncContextDebugInfo as EventListener
        )
        contextElement?.addEventListener(
            "cafe24-context-rendered",
            syncElementDebugInfo as EventListener
        )
        contextElement?.addEventListener(
            "cafe24-variant-changed",
            syncElementDebugInfo as EventListener
        )
        contextElement?.addEventListener(
            "error",
            syncElementDebugInfo as EventListener
        )
        storeElement?.addEventListener(
            "error",
            syncElementDebugInfo as EventListener
        )

        const observer = new MutationObserver(() => {
            syncRenderedState()
            syncContextDebugInfo()
        })
        observer.observe(container, {
            childList: true,
            subtree: true,
        })

        const timeoutId = window.setTimeout(() => {
            setRenderStatus((current) =>
                current === "rendered" ? current : "timeout"
            )
        }, 5000)

        return () => {
            observer.disconnect()
            window.clearTimeout(timeoutId)
            contextElement?.removeEventListener(
                "cafe24-context-rendered",
                applyManualVariantSelection as EventListener
            )
            contextElement?.removeEventListener(
                "cafe24-variant-changed",
                syncContextDebugInfo as EventListener
            )
            contextElement?.removeEventListener(
                "cafe24-context-rendered",
                syncElementDebugInfo as EventListener
            )
            contextElement?.removeEventListener(
                "cafe24-variant-changed",
                syncElementDebugInfo as EventListener
            )
            contextElement?.removeEventListener(
                "error",
                syncElementDebugInfo as EventListener
            )
            storeElement?.removeEventListener(
                "error",
                syncElementDebugInfo as EventListener
            )
        }
    }, [
        props.accessToken,
        props.addToCartBorderColor,
        props.addToCartBorderRadius,
        props.addToCartBorderWidth,
        props.addToCartFill,
        props.addToCartLabel,
        props.addToCartTextColor,
        props.addToCartWidth,
        props.bodyFontFamily,
        props.bodyFontSize,
        props.buttonFontSize,
        props.buyNowLabel,
        props.enabled,
        props.productHandle,
        props.shopNo,
        props.storeDomain,
        props.variantId,
        remoteConfig.accessToken,
        remoteConfig.shopNo,
        remoteConfig.storeDomain,
        scriptStatus,
    ])

    const variantLookupUrl =
        props.backendUrl.trim() &&
        (resolvedProductNo || props.productNo.trim())
            ? joinUrl(
                  props.backendUrl,
                  `/api/product/variants?productNo=${encodeURIComponent(
                      resolvedProductNo || props.productNo.trim()
                  )}`
              )
            : ""

    React.useEffect(() => {
        if (!props.showVariantHelper || !variantLookupUrl) {
            setVariantRecords([])
            setVariantLookupMessage("")
            return
        }

        let isCancelled = false
        setVariantLookupMessage("Loading variant records...")

        window
            .fetch(variantLookupUrl, {
                method: "GET",
            })
            .then(async (response) => {
                const result = await response
                    .json()
                    .catch(() => ({ ok: false, message: "Invalid JSON" }))

                if (!response.ok) {
                    throw new Error(
                        String(
                            result?.message ||
                                "Unable to load Cafe24 variant records."
                        )
                    )
                }

                if (isCancelled) return

                const nextVariants = Array.isArray(result?.variants)
                    ? result.variants
                    : []
                setVariantRecords(nextVariants)
                setVariantLookupMessage(
                    nextVariants.length > 0
                        ? ""
                        : "No variant records were returned for this product."
                )
            })
            .catch((error) => {
                if (isCancelled) return

                setVariantRecords([])
                setVariantLookupMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to load Cafe24 variant records."
                )
            })

        return () => {
            isCancelled = true
        }
    }, [props.showVariantHelper, variantLookupUrl])

    const manualProductNo = props.productNo.trim()
    const manualVariantCode = props.variantId.trim()
    const shouldPreferBackendConfig = Boolean(props.backendUrl.trim())
    const resolvedStoreDomain = shouldPreferBackendConfig
        ? normalizeStoreDomain(remoteConfig.storeDomain) ||
          normalizeStoreDomain(props.storeDomain)
        : normalizeStoreDomain(props.storeDomain) ||
          normalizeStoreDomain(remoteConfig.storeDomain)
    const resolvedShopNo = shouldPreferBackendConfig
        ? remoteConfig.shopNo.trim() || props.shopNo.trim()
        : props.shopNo.trim() || remoteConfig.shopNo.trim()
    const resolvedAccessToken = shouldPreferBackendConfig
        ? remoteConfig.accessToken.trim() || props.accessToken.trim()
        : props.accessToken.trim() || remoteConfig.accessToken.trim()
    const resolvedConfigSource = shouldPreferBackendConfig
        ? remoteConfig.source.trim() || debugInfo?.source || "(not available)"
        : props.accessToken.trim()
          ? "manual-framer-token"
          : remoteConfig.source.trim() || debugInfo?.source || "(not available)"
    const hasNumericOnlyHandle = Boolean(
        props.productHandle.trim() &&
            /^\d+$/.test(props.productHandle.trim())
    )
    const isConfigured = Boolean(
        resolvedStoreDomain &&
            resolvedShopNo &&
            resolvedAccessToken &&
            props.productHandle.trim()
    )

    const helperBlock = props.showVariantHelper ? (
        <div
            style={{
                ...cafe24NoticeStyle,
                marginTop: 10,
                fontFamily: props.bodyFontFamily,
                fontSize: props.bodyFontSize,
                lineHeight: `${Math.round(props.bodyFontSize * 1.6)}px`,
            }}
        >
            Variant helper status:
            <br />
            Product handle:{" "}
            <code>{props.productHandle.trim() || "(missing)"}</code>
            <br />
            Product no: <code>{manualProductNo || "(missing)"}</code>
            <br />
            Variant code field: <code>{manualVariantCode || "(blank)"}</code>
            <br />
            Backend URL: <code>{props.backendUrl.trim() || "(missing)"}</code>
            <br />
            Store domain: <code>{resolvedStoreDomain || "(missing)"}</code>
            <br />
            Shop no: <code>{resolvedShopNo || "(missing)"}</code>
            <br />
            Config status: <code>{configStatus}</code>
            <br />
            Script status: <code>{scriptStatus}</code>
            <br />
            Render status: <code>{renderStatus}</code>
            <br />
            CTA mode: <code>cafe24-web-components</code>
            <br />
            Backend token source: <code>{resolvedConfigSource}</code>
            {debugInfo?.tokenStoreSource ? (
                <>
                    <br />
                    Token store source: <code>{debugInfo.tokenStoreSource}</code>
                </>
            ) : null}
            {debugInfo?.tokenStorePath ? (
                <>
                    <br />
                    Token store path: <code>{debugInfo.tokenStorePath}</code>
                </>
            ) : null}
            {debugInfo ? (
                <>
                    <br />
                    Token store durable:{" "}
                    <code>{String(debugInfo.tokenStoreIsDurable)}</code>
                </>
            ) : null}
            {debugInfo ? (
                <>
                    <br />
                    Persisted refresh token:{" "}
                    <code>{String(debugInfo.hasPersistedRefreshToken)}</code>
                </>
            ) : null}
            {debugInfo?.persistedRefreshTokenExpiresAt ? (
                <>
                    <br />
                    Persisted refresh expiry:{" "}
                    <code>{debugInfo.persistedRefreshTokenExpiresAt}</code>
                </>
            ) : null}
            {hasNumericOnlyHandle ? (
                <>
                    <br />
                    Web Components warning: <code>product handle looks numeric</code>
                </>
            ) : null}
            {resolvedProductNo ? (
                <>
                    <br />
                    Resolved product no: <code>{resolvedProductNo}</code>
                </>
            ) : null}
            {resolvedSelectedVariantId ? (
                <>
                    <br />
                    Selected variant id: <code>{resolvedSelectedVariantId}</code>
                </>
            ) : null}
            {variantLookupUrl ? (
                <>
                    <br />
                    Variant lookup: <code>{variantLookupUrl}</code>
                </>
            ) : null}
            {variantLookupMessage ? (
                <>
                    <br />
                    {variantLookupMessage}
                </>
            ) : null}
            {contextDebugJson ? (
                <>
                    <br />
                    <br />
                    Cafe24 context data:
                    <div
                        style={{
                            marginTop: 8,
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: "rgba(0, 0, 0, 0.04)",
                            fontFamily: "monospace",
                            fontSize: Math.max(12, props.bodyFontSize - 1),
                            lineHeight: "1.45",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                        }}
                    >
                        {contextDebugJson}
                    </div>
                </>
            ) : null}
            {debugMessage ? (
                <>
                    <br />
                    <br />
                    Cafe24 element debug:
                    <div
                        style={{
                            marginTop: 8,
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: "rgba(0, 0, 0, 0.04)",
                            fontFamily: "monospace",
                            fontSize: Math.max(12, props.bodyFontSize - 1),
                            lineHeight: "1.45",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                        }}
                    >
                        {debugMessage}
                    </div>
                </>
            ) : null}
            {variantRecords.length > 0 ? (
                <>
                    <br />
                    <br />
                    Cafe24 variants:
                    {variantRecords.map((variant, index) => {
                        const variantId = String(
                            variant?.variant_id ??
                                variant?.variantId ??
                                variant?.id ??
                                ""
                        ).trim()
                        const variantCode = String(
                            variant?.variants_code ??
                                variant?.variant_code ??
                                variant?.item_code ??
                                variant?.product_code ??
                                ""
                        ).trim()
                        const optionSummary = [
                            variant?.options,
                            variant?.option_value,
                            variant?.option_name,
                            variant?.value,
                        ]
                            .map((value) => String(value || "").trim())
                            .find(Boolean)

                        return (
                            <React.Fragment key={`variant-${index}`}>
                                <br />
                                <code>
                                    #{index + 1}
                                    {variantId ? ` | id: ${variantId}` : ""}
                                    {variantCode ? ` | code: ${variantCode}` : ""}
                                    {optionSummary
                                        ? ` | option: ${optionSummary}`
                                        : ""}
                                </code>
                            </React.Fragment>
                        )
                    })}
                </>
            ) : null}
        </div>
    ) : null

    if (!props.enabled) return null

    if (!isConfigured) {
        return (
            <>
                <div
                    style={{
                        ...cafe24NoticeStyle,
                        fontFamily: props.bodyFontFamily,
                        fontSize: props.bodyFontSize,
                        lineHeight: `${Math.round(props.bodyFontSize * 1.6)}px`,
                    }}
                >
                    Add your Cafe24 `product handle` plus `store-domain`,
                    `shop-no`, and `access-token`, or provide a backend URL
                    that exposes `/api/storefront/config`. Cafe24 Web
                    Components need the product handle/slug for product
                    context.
                </div>
                {helperBlock}
            </>
        )
    }

    return (
        <>
            {configStatus === "loading" ? (
                <div
                    style={{
                        ...cafe24NoticeStyle,
                        marginBottom: 10,
                        fontFamily: props.bodyFontFamily,
                        fontSize: props.bodyFontSize,
                        lineHeight: `${Math.round(props.bodyFontSize * 1.6)}px`,
                    }}
                >
                    Checking Cafe24 backend status...
                </div>
            ) : null}
            {configStatus === "error" ? (
                <div
                    style={{
                        ...cafe24NoticeStyle,
                        marginBottom: 10,
                        fontFamily: props.bodyFontFamily,
                        fontSize: props.bodyFontSize,
                        lineHeight: `${Math.round(props.bodyFontSize * 1.6)}px`,
                    }}
                >
                    {configMessage ||
                        "Cafe24 backend auth/config check failed."}
                </div>
            ) : null}
            {scriptStatus === "error" ? (
                <div
                    style={{
                        ...cafe24NoticeStyle,
                        marginTop: 10,
                        fontFamily: props.bodyFontFamily,
                        fontSize: props.bodyFontSize,
                        lineHeight: `${Math.round(props.bodyFontSize * 1.6)}px`,
                    }}
                >
                    Cafe24 Web Components failed to load.
                </div>
            ) : null}
            <div ref={containerRef} style={{ width: "100%" }} />
            {helperBlock}
        </>
    )
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1259
 * @framerIntrinsicHeight 1700
 */
export default function MirrorShopComponent(props: Partial<MirrorShopProps>) {
    const carouselSlideDurationMs = 920
    const useCafe24 = props.useCafe24 ?? false
    const showCafe24VariantHelper = props.showCafe24VariantHelper ?? false
    const cafe24BackendUrl = props.cafe24BackendUrl?.trim() || ""
    const cafe24StoreDomain = props.cafe24StoreDomain?.trim() || ""
    const cafe24ShopNo = props.cafe24ShopNo?.trim() || "1"
    const cafe24AccessToken = props.cafe24AccessToken?.trim() || ""
    const cafe24ProductHandle = props.cafe24ProductHandle?.trim() || ""
    const cafe24ProductNo = props.cafe24ProductNo?.trim() || ""
    const cafe24VariantId = props.cafe24VariantId?.trim() || ""
    const cafe24BuyNowLabel = props.cafe24BuyNowLabel?.trim() || "Buy now"
    const title = props.title?.trim() || "REVERSO PUFFA"
    const description = props.description?.trim() || defaultDescription
    const price = props.price?.trim() || "$139"
    const buttonLabel = props.buttonLabel?.trim() || "Add to cart"
    const colorLabel = props.colorLabel?.trim() || "Color"
    const descriptionLabel = props.descriptionLabel?.trim() || "Description"
    const sizeGuideLabel = props.sizeGuideLabel?.trim() || "Size Guide"
    const shippingReturnsLabel =
        props.shippingReturnsLabel?.trim() || "Shipping & Returns"
    const sizeGuideText =
        props.sizeGuideText?.trim() ||
        "JAMES IS 6'1 / 185 CM WEARING SIZE LARGE.\nSAV IS 5'8 / 173 CM WEARING SIZE SMALL."
    const shippingReturnsText =
        props.shippingReturnsText?.trim() ||
        "Orders are fulfilled from our UK or EU warehouse depending on where you're located. Customers within the UK or EU will not be charged any additional customs or duties."
    const colorButtons =
        props.colorButtons && props.colorButtons.length > 0
            ? props.colorButtons
            : defaultColorButtons
    const carouselItems = props.carouselItems ?? []
    const defaultColorIndex = props.defaultColorIndex ?? 0
    const imageScales = props.imageScales ?? []
    const imageTopMargins = props.imageTopMargins ?? []
    const imageBottomMargins = props.imageBottomMargins ?? []
    const imageLeftMargins = props.imageLeftMargins ?? []
    const imageRightMargins = props.imageRightMargins ?? []
    const imageFits = props.imageFits ?? []
    const imageFullColumn = props.imageFullColumn ?? []
    const imageColumnModes = props.imageColumnModes ?? []
    const imageCropX = props.imageCropX ?? []
    const imageCropY = props.imageCropY ?? []
    const carouselPaddingLeft = props.carouselPaddingLeft ?? 0
    const carouselPaddingRight = props.carouselPaddingRight ?? 0
    const rightColumnTopMargin = props.rightColumnTopMargin ?? 0
    const rightColumnPaddingX = props.rightColumnPaddingX ?? 40
    const rightColumnGap = props.rightColumnGap ?? 14
    const displayFontFamily =
        props.displayFontFamily?.trim() || "Bayon, sans-serif"
    const bodyFontFamily = props.bodyFontFamily?.trim() || "Inter, sans-serif"
    const bodyFontSize = props.bodyFontSize ?? 14
    const titleFontSize = props.titleFontSize ?? 34
    const titleLineHeight = props.titleLineHeight ?? 36
    const titleColor = props.titleColor ?? "#000000"
    const titleToPriceGap = props.titleToPriceGap ?? 8
    const priceFontSize = props.priceFontSize ?? 32
    const buttonFontSize = props.buttonFontSize ?? 14
    const addToCartWidth = props.addToCartWidth ?? 100
    const addToCartFill = props.addToCartFill ?? "#000000"
    const addToCartBorderColor = props.addToCartBorderColor ?? "#000000"
    const addToCartBorderWidth = props.addToCartBorderWidth ?? 0
    const addToCartBorderRadius = props.addToCartBorderRadius ?? 12
    const addToCartTextColor = props.addToCartTextColor ?? "#ffffff"
    const collapsableTextWidth = props.collapsableTextWidth ?? 100
    const priceToColorGap = props.priceToColorGap ?? 6
    const colorButtonHeight = props.colorButtonHeight ?? 45.5
    const colorButtonWidth = props.colorButtonWidth ?? 96
    const colorButtonRadius = props.colorButtonRadius ?? 12
    const colorLabelGap = props.colorLabelGap ?? 0
    const colorGridColumns = props.colorGridColumns ?? 3
    const colorButtonColumnGap = props.colorButtonColumnGap ?? 10
    const colorButtonRowGap = props.colorButtonRowGap ?? 12
    const colorImageScale = props.colorImageScale ?? 100
    const colorImageFit = props.colorImageFit ?? "cover"
    const carouselArrowColor = props.carouselArrowColor ?? "#000000"
    const carouselArrowSize = props.carouselArrowSize ?? 44

    const [selectedColorIndex, setSelectedColorIndex] = React.useState(() =>
        Math.max(0, Math.floor(defaultColorIndex))
    )
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
    const [openPanel, setOpenPanel] = React.useState<
        "description" | "size" | "shipping" | null
    >(null)
    const [isNarrowLayout, setIsNarrowLayout] = React.useState(false)
    const mediaColumnRef = React.useRef<HTMLDivElement | null>(null)
    const carouselMedia = React.useMemo<CarouselMediaItem[]>(() => {
        return carouselItems
            .map((item) => {
                const { src, alt } = getCarouselItemSource(item)

                return {
                    src,
                    alt,
                    kind: getMediaKind(src),
                    fullWidth: item.fullWidth ?? false,
                    cropX: item.cropX ?? 50,
                    cropY: item.cropY ?? 50,
                    scale: item.scale ?? 100,
                    topMargin: item.topMargin ?? 0,
                    bottomMargin: item.bottomMargin ?? 0,
                    leftMargin: item.leftMargin ?? 0,
                    rightMargin: item.rightMargin ?? 0,
                    autoPlay: item.autoPlay ?? true,
                    muted: item.muted ?? true,
                    loop: item.loop ?? true,
                }
            })
            .filter((item) => Boolean(item.src))
    }, [carouselItems])
    const imageCount = carouselMedia.length
    const sliderRef = React.useRef<any>(null)
    const refreshSliderLayout = React.useCallback(() => {
        if (!sliderRef.current) return

        window.requestAnimationFrame(() => {
            sliderRef.current?.innerSlider?.onWindowResized?.()
            sliderRef.current?.slickGoTo?.(currentImageIndex, true)
        })
    }, [currentImageIndex])
    const sliderSettings = React.useMemo(
        () => ({
            dots: false,
            infinite: imageCount > 1,
            speed: Math.min(carouselSlideDurationMs, 500),
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            adaptiveHeight: true,
            beforeChange: (_current: number, next: number) => {
                React.startTransition(() => {
                    setCurrentImageIndex(next)
                })
            },
        }),
        [carouselSlideDurationMs, imageCount]
    )

    React.useEffect(() => {
        if (selectedColorIndex > colorButtons.length - 1) {
            React.startTransition(() => {
                setSelectedColorIndex(0)
            })
        }
    }, [colorButtons.length, selectedColorIndex])

    React.useEffect(() => {
        const nextDefaultIndex = Math.max(0, Math.floor(defaultColorIndex))
        if (colorButtons.length <= 0) {
            if (selectedColorIndex !== 0) {
                React.startTransition(() => {
                    setSelectedColorIndex(0)
                })
            }
            return
        }

        const clampedDefaultIndex = Math.min(
            nextDefaultIndex,
            colorButtons.length - 1
        )

        React.startTransition(() => {
            setSelectedColorIndex(clampedDefaultIndex)
        })
    }, [colorButtons.length, defaultColorIndex])

    React.useEffect(() => {
        if (imageCount <= 0 && currentImageIndex !== 0) {
            React.startTransition(() => {
                setCurrentImageIndex(0)
            })
            return
        }

        if (currentImageIndex > imageCount - 1) {
            React.startTransition(() => {
                setCurrentImageIndex(0)
            })
        }
    }, [currentImageIndex, imageCount])

    const goToPreviousImage = () => {
        sliderRef.current?.slickPrev()
    }

    const goToNextImage = () => {
        sliderRef.current?.slickNext()
    }

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const handleResize = () => {
            const nextIsNarrow = window.innerWidth < 1100
            React.startTransition(() => {
                setIsNarrowLayout(nextIsNarrow)
            })
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    React.useEffect(() => {
        if (typeof window === "undefined" || imageCount <= 0) return

        refreshSliderLayout()
    }, [imageCount, isNarrowLayout, refreshSliderLayout])

    const descriptionLines = description
        .split("\n")
        .map((line) => line.trim())
        .filter(
            (line) =>
                Boolean(line) && line.toLowerCase() !== title.toLowerCase()
        )

    const responsiveRootStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...rootStyle,
            height: "auto",
            minHeight: "calc(100vh - 128px)",
            maxHeight: "none",
            overflow: "visible",
        }),
        []
    )

    const responsivePageStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...pageStyle,
            padding: "0",
            height: "auto",
            minHeight: "calc(100vh - 128px)",
            overflow: "visible",
        }),
        []
    )

    const responsiveGridStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...gridStyle,
            gridTemplateColumns: isNarrowLayout
                ? "1fr"
                : "minmax(0, 1fr) minmax(0, 1fr)",
            rowGap: isNarrowLayout ? 28 : 0,
        }),
        [isNarrowLayout]
    )

    const responsiveRightColumnStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...rightColumnStyle,
            position: isNarrowLayout ? "relative" : "sticky",
            top: isNarrowLayout ? undefined : 48,
        }),
        [isNarrowLayout]
    )

    const responsiveMediaColumnStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...mediaColumnStyle,
            height: "auto",
            maxHeight: "none",
            overflowX: "hidden",
            overflowY: "visible",
            position: "relative",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            overscrollBehaviorY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingLeft: carouselPaddingLeft,
            paddingRight: carouselPaddingRight,
        }),
        [carouselPaddingLeft, carouselPaddingRight]
    )

    const responsiveCarouselViewportStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...mediaItemStyle,
            overflow: "hidden",
            position: "relative",
            background: "#ffffff",
            touchAction: "pan-y",
        }),
        []
    )

    const responsiveMediaItemStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...mediaItemStyle,
            flex: "0 0 100%",
            width: "100%",
            minWidth: "100%",
            maxWidth: "100%",
            height: "auto",
            minHeight: isNarrowLayout ? 0 : "100%",
            alignItems: "flex-start",
            overflow: "hidden",
            position: "relative",
        }),
        [isNarrowLayout]
    )

    const responsiveCarouselArrowStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...carouselArrowStyle,
            width: carouselArrowSize,
            height: carouselArrowSize,
        }),
        [carouselArrowSize]
    )

    const responsiveRightInnerStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...rightInnerStyle,
            gap: rightColumnGap,
            padding: `${rightColumnTopMargin}px ${rightColumnPaddingX}px 0`,
        }),
        [rightColumnGap, rightColumnPaddingX, rightColumnTopMargin]
    )

    const responsiveBodyTextStyle = React.useMemo<React.CSSProperties>(
        () => ({
            fontFamily: bodyFontFamily,
            fontSize: bodyFontSize,
            lineHeight: `${Math.round(bodyFontSize * 1.6)}px`,
        }),
        [bodyFontFamily, bodyFontSize]
    )

    const responsiveTitleStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...titleStyle,
            margin: `14px 0 ${titleToPriceGap}px`,
            fontFamily: displayFontFamily,
            fontSize: titleFontSize,
            lineHeight: `${titleLineHeight}px`,
            color: titleColor,
        }),
        [
            displayFontFamily,
            titleColor,
            titleFontSize,
            titleLineHeight,
            titleToPriceGap,
        ]
    )

    const responsivePriceStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...priceStyle,
            fontFamily: displayFontFamily,
            fontSize: priceFontSize,
            lineHeight: `${priceFontSize}px`,
        }),
        [displayFontFamily, priceFontSize]
    )

    const responsiveSizeHeaderStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...sizeHeaderStyle,
            ...responsiveBodyTextStyle,
            marginTop: priceToColorGap,
        }),
        [priceToColorGap, responsiveBodyTextStyle]
    )

    const responsiveSizeGridStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...sizeGridStyle,
            gridTemplateColumns: `repeat(${colorGridColumns}, ${colorButtonWidth}px)`,
            columnGap: colorButtonColumnGap,
            rowGap: colorButtonRowGap,
            marginTop: colorLabelGap,
        }),
        [
            colorLabelGap,
            colorGridColumns,
            colorButtonWidth,
            colorButtonColumnGap,
            colorButtonRowGap,
        ]
    )

    const responsiveSizeButtonStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...sizeButtonStyle,
            width: colorButtonWidth,
            height: colorButtonHeight,
            borderRadius: colorButtonRadius,
        }),
        [colorButtonWidth, colorButtonHeight, colorButtonRadius]
    )

    const responsiveSizeImageStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...sizeImageStyle,
            width: `${colorImageScale}%`,
            height: `${colorImageScale}%`,
            objectFit: colorImageFit,
        }),
        [colorImageScale, colorImageFit]
    )

    const responsiveButtonTextStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...ctaInnerStyle,
            fontSize: buttonFontSize,
            color: addToCartTextColor,
        }),
        [addToCartTextColor, buttonFontSize]
    )

    const responsiveCtaStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...ctaStyle,
            width: `${addToCartWidth}%`,
            alignSelf: "flex-start",
            background: addToCartFill,
            border: `${addToCartBorderWidth}px solid ${addToCartBorderColor}`,
            borderRadius: addToCartBorderRadius,
        }),
        [
            addToCartBorderColor,
            addToCartBorderRadius,
            addToCartBorderWidth,
            addToCartFill,
            addToCartWidth,
        ]
    )

    const responsiveLinkGroupStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...linkGroupStyle,
            width: `${collapsableTextWidth}%`,
        }),
        [collapsableTextWidth]
    )

    return (
        <div
            style={responsiveRootStyle}
            onContextMenu={(event) => {
                event.preventDefault()
            }}
            onDragStart={(event) => {
                event.preventDefault()
            }}
        >
            <style>{`
                .mirror-shop-media-scroll::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }

                .mirror-shop-slider {
                    width: 100%;
                }

                .mirror-shop-slider .slick-slider,
                .mirror-shop-slider .slick-list,
                .mirror-shop-slider .slick-track {
                    width: 100%;
                }

                .mirror-shop-slider .slick-list {
                    overflow: hidden;
                }

                .mirror-shop-slider .slick-track {
                    display: flex;
                    align-items: flex-start;
                }

                .mirror-shop-slider .slick-slide > div {
                    width: 100%;
                }
            `}</style>
            <div style={responsivePageStyle}>
                <div style={responsiveGridStyle}>
                    <div
                        ref={mediaColumnRef}
                        className="mirror-shop-media-scroll"
                        style={responsiveMediaColumnStyle}
                    >
                        <div style={responsiveCarouselViewportStyle}>
                            {imageCount > 1 ? (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 18,
                                        right: 18,
                                        zIndex: 3,
                                        color: "#000000",
                                        fontFamily: bodyFontFamily,
                                        fontSize: bodyFontSize,
                                        lineHeight: `${Math.round(bodyFontSize * 1.2)}px`,
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    {currentImageIndex + 1} / {imageCount}
                                </div>
                            ) : null}
                            <div className="mirror-shop-slider">
                                <SlickSlider
                                    ref={sliderRef}
                                    {...sliderSettings}
                                >
                                    {carouselMedia.map((mediaItem, index) => {
                                        const topMargin = mediaItem.topMargin
                                        const bottomMargin =
                                            mediaItem.bottomMargin
                                        const leftMargin = mediaItem.leftMargin
                                        const rightMargin =
                                            mediaItem.rightMargin
                                        const imageFit =
                                            imageFits[index] ?? "contain"
                                        const fillsColumn =
                                            mediaItem.fullWidth ?? false
                                        const cropPosition = `${mediaItem.cropX}% ${mediaItem.cropY}%`
                                        const mediaWidth = fillsColumn
                                            ? "100%"
                                            : `${mediaItem.scale}%`

                                        return (
                                            <div
                                                key={`${mediaItem.kind}-${mediaItem.src}-${index}`}
                                            >
                                                <div
                                                    style={
                                                        responsiveMediaItemStyle
                                                    }
                                                >
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            marginLeft: 0,
                                                            marginRight: 0,
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            alignItems:
                                                                "flex-start",
                                                            overflow: "hidden",
                                                            height: fillsColumn
                                                                ? "100%"
                                                                : "auto",
                                                            paddingTop:
                                                                topMargin,
                                                            paddingBottom:
                                                                bottomMargin,
                                                            paddingLeft:
                                                                leftMargin,
                                                            paddingRight:
                                                                rightMargin,
                                                            boxSizing:
                                                                "border-box",
                                                        }}
                                                    >
                                                        {mediaItem.kind ===
                                                        "video" ? (
                                                            <video
                                                                src={
                                                                    mediaItem.src
                                                                }
                                                                draggable={
                                                                    false
                                                                }
                                                                autoPlay={
                                                                    mediaItem.autoPlay
                                                                }
                                                                muted={
                                                                    mediaItem.muted
                                                                }
                                                                loop={
                                                                    mediaItem.loop
                                                                }
                                                                playsInline
                                                                preload="metadata"
                                                                onLoadedData={
                                                                    refreshSliderLayout
                                                                }
                                                                onCanPlay={
                                                                    refreshSliderLayout
                                                                }
                                                                style={{
                                                                    ...imageStyle,
                                                                    width: mediaWidth,
                                                                    height: fillsColumn
                                                                        ? "100%"
                                                                        : "auto",
                                                                    objectFit:
                                                                        fillsColumn
                                                                            ? "cover"
                                                                            : imageFit,
                                                                    objectPosition:
                                                                        cropPosition,
                                                                    maxWidth:
                                                                        fillsColumn
                                                                            ? "100%"
                                                                            : "none",
                                                                    maxHeight:
                                                                        fillsColumn
                                                                            ? "100%"
                                                                            : "none",
                                                                    background:
                                                                        "#000000",
                                                                    userSelect:
                                                                        "none",
                                                                    WebkitUserDrag:
                                                                        "none",
                                                                }}
                                                            />
                                                        ) : (
                                                            <img
                                                                src={
                                                                    mediaItem.src
                                                                }
                                                                alt={
                                                                    mediaItem.alt ||
                                                                    `${title} ${index + 1}`
                                                                }
                                                                draggable={
                                                                    false
                                                                }
                                                                onLoad={
                                                                    refreshSliderLayout
                                                                }
                                                                style={{
                                                                    ...imageStyle,
                                                                    width: mediaWidth,
                                                                    height: fillsColumn
                                                                        ? "100%"
                                                                        : "auto",
                                                                    objectFit:
                                                                        fillsColumn
                                                                            ? "cover"
                                                                            : imageFit,
                                                                    objectPosition:
                                                                        cropPosition,
                                                                    maxWidth:
                                                                        fillsColumn
                                                                            ? "100%"
                                                                            : "none",
                                                                    maxHeight:
                                                                        fillsColumn
                                                                            ? "100%"
                                                                            : "none",
                                                                    userSelect:
                                                                        "none",
                                                                    pointerEvents:
                                                                        "none",
                                                                    WebkitUserDrag:
                                                                        "none",
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </SlickSlider>
                            </div>
                        </div>

                        {imageCount > 1 ? (
                            <>
                                <button
                                    aria-label="Previous image"
                                    onClick={goToPreviousImage}
                                    style={{
                                        ...responsiveCarouselArrowStyle,
                                        left: 28,
                                    }}
                                >
                                    <CarouselChevron
                                        direction="left"
                                        color={carouselArrowColor}
                                        size={carouselArrowSize}
                                    />
                                </button>
                                <button
                                    aria-label="Next image"
                                    onClick={goToNextImage}
                                    style={{
                                        ...responsiveCarouselArrowStyle,
                                        right: 28,
                                    }}
                                >
                                    <CarouselChevron
                                        direction="right"
                                        color={carouselArrowColor}
                                        size={carouselArrowSize}
                                    />
                                </button>
                            </>
                        ) : null}
                    </div>

                    <div style={responsiveRightColumnStyle}>
                        <div style={columnFrameStyle}>
                            <div style={responsiveRightInnerStyle}>
                                <h1 style={responsiveTitleStyle}>{title}</h1>

                                <div style={priceRowStyle}>
                                    <div style={responsivePriceStyle}>
                                        {price}
                                    </div>
                                </div>

                                <div style={responsiveSizeHeaderStyle}>
                                    {colorLabel}
                                </div>
                                <div style={responsiveSizeGridStyle}>
                                    {colorButtons.map((colorButton, index) => {
                                        const colorName =
                                            colorButton.label?.trim() ||
                                            `Color ${index + 1}`
                                        const colorImage =
                                            colorButton.image?.trim() || ""
                                        const colorLink =
                                            colorButton.link?.trim() || ""
                                        const active =
                                            index === selectedColorIndex
                                        return (
                                            <button
                                                key={`${colorName}-${index}`}
                                                aria-label={colorName}
                                                title={colorName}
                                                onClick={() => {
                                                    React.startTransition(
                                                        () => {
                                                            setSelectedColorIndex(
                                                                index
                                                            )
                                                        }
                                                    )
                                                    if (
                                                        colorLink &&
                                                        typeof window !==
                                                            "undefined"
                                                    ) {
                                                        window.location.href =
                                                            colorLink
                                                    }
                                                }}
                                                style={{
                                                    ...responsiveSizeButtonStyle,
                                                    padding: 0,
                                                    overflow: "hidden",
                                                    border: active
                                                        ? "1px solid #000000"
                                                        : "1px solid rgba(0, 0, 0, 0.13)",
                                                }}
                                            >
                                                {colorImage ? (
                                                    <img
                                                        src={colorImage}
                                                        alt={colorName}
                                                        style={
                                                            responsiveSizeImageStyle
                                                        }
                                                    />
                                                ) : (
                                                    <span
                                                        style={{
                                                            ...responsiveBodyTextStyle,
                                                            padding: "0 8px",
                                                            textTransform:
                                                                "uppercase",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {colorName}
                                                    </span>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                                {cafe24VariantId ? (
                                    <div
                                        style={{
                                            ...cafe24NoticeStyle,
                                            fontFamily: bodyFontFamily,
                                            fontSize: bodyFontSize,
                                            lineHeight: `${Math.round(
                                                bodyFontSize * 1.6
                                            )}px`,
                                        }}
                                    >
                                        Manual variant override:{" "}
                                        <code>{cafe24VariantId}</code>
                                    </div>
                                ) : null}

                                {useCafe24 ? (
                                    <>
                                        <Cafe24CommerceBridge
                                            enabled={useCafe24}
                                            showVariantHelper={
                                                showCafe24VariantHelper
                                            }
                                            backendUrl={cafe24BackendUrl}
                                            storeDomain={cafe24StoreDomain}
                                            shopNo={cafe24ShopNo}
                                            accessToken={cafe24AccessToken}
                                            productHandle={cafe24ProductHandle}
                                            productNo={cafe24ProductNo}
                                            variantId={cafe24VariantId}
                                            addToCartLabel={buttonLabel}
                                            buyNowLabel={cafe24BuyNowLabel}
                                            bodyFontFamily={bodyFontFamily}
                                            bodyFontSize={bodyFontSize}
                                            buttonFontSize={buttonFontSize}
                                            addToCartWidth={addToCartWidth}
                                            addToCartFill={addToCartFill}
                                            addToCartBorderColor={
                                                addToCartBorderColor
                                            }
                                            addToCartBorderWidth={
                                                addToCartBorderWidth
                                            }
                                            addToCartBorderRadius={
                                                addToCartBorderRadius
                                            }
                                            addToCartTextColor={
                                                addToCartTextColor
                                            }
                                        />
                                    </>
                                ) : (
                                    <button style={responsiveCtaStyle}>
                                        <span style={responsiveButtonTextStyle}>
                                            <span>{buttonLabel}</span>
                                        </span>
                                    </button>
                                )}

                                <div style={responsiveLinkGroupStyle}>
                                    <button
                                        style={{
                                            ...linkButtonStyle,
                                            ...responsiveBodyTextStyle,
                                        }}
                                        onClick={() => {
                                            React.startTransition(() => {
                                                setOpenPanel(
                                                    openPanel === "description"
                                                        ? null
                                                        : "description"
                                                )
                                            })
                                        }}
                                    >
                                        <span>{descriptionLabel}</span>
                                        <ArrowIcon />
                                    </button>
                                    {openPanel === "description" ? (
                                        <div
                                            style={{
                                                ...descriptionListStyle,
                                                ...responsiveBodyTextStyle,
                                            }}
                                        >
                                            {descriptionLines.map((line) => (
                                                <div
                                                    key={line}
                                                    style={descriptionLineStyle}
                                                >
                                                    <span
                                                        style={{
                                                            ...bulletStyle,
                                                            lineHeight: `${Math.round(
                                                                bodyFontSize *
                                                                    1.6
                                                            )}px`,
                                                        }}
                                                    >
                                                        •
                                                    </span>
                                                    <span>{line}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                    <button
                                        style={{
                                            ...linkButtonStyle,
                                            ...responsiveBodyTextStyle,
                                        }}
                                        onClick={() => {
                                            React.startTransition(() => {
                                                setOpenPanel(
                                                    openPanel === "size"
                                                        ? null
                                                        : "size"
                                                )
                                            })
                                        }}
                                    >
                                        <span>{sizeGuideLabel}</span>
                                        <ArrowIcon />
                                    </button>
                                    {openPanel === "size" ? (
                                        <div
                                            style={{
                                                ...panelTextStyle,
                                                ...responsiveBodyTextStyle,
                                            }}
                                        >
                                            {sizeGuideText}
                                        </div>
                                    ) : null}

                                    <button
                                        style={{
                                            ...linkButtonStyle,
                                            ...responsiveBodyTextStyle,
                                        }}
                                        onClick={() => {
                                            React.startTransition(() => {
                                                setOpenPanel(
                                                    openPanel === "shipping"
                                                        ? null
                                                        : "shipping"
                                                )
                                            })
                                        }}
                                    >
                                        <span>{shippingReturnsLabel}</span>
                                        <ArrowIcon />
                                    </button>
                                    {openPanel === "shipping" ? (
                                        <div
                                            style={{
                                                ...panelTextStyle,
                                                ...responsiveBodyTextStyle,
                                            }}
                                        >
                                            {shippingReturnsText}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

MirrorShopComponent.defaultProps = {
    useCafe24: false,
    showCafe24VariantHelper: false,
    cafe24BackendUrl: "",
    cafe24StoreDomain: "",
    cafe24ShopNo: "1",
    cafe24AccessToken: "",
    cafe24ProductHandle: "",
    cafe24ProductNo: "",
    cafe24VariantId: "",
    cafe24BuyNowLabel: "Buy now",
    title: "REVERSO PUFFA",
    description: defaultDescription,
    price: "$139",
    buttonLabel: "Add to cart",
    colorLabel: "Color",
    descriptionLabel: "Description",
    sizeGuideLabel: "Size Guide",
    shippingReturnsLabel: "Shipping & Returns",
    sizeGuideText:
        "JAMES IS 6'1 / 185 CM WEARING SIZE LARGE.\nSAV IS 5'8 / 173 CM WEARING SIZE SMALL.",
    shippingReturnsText:
        "Orders are fulfilled from our UK or EU warehouse depending on where you're located. Customers within the UK or EU will not be charged any additional customs or duties.",
    colorButtons: defaultColorButtons,
    defaultColorIndex: 0,
    carouselItems: defaultCarouselItems,
    rightColumnPaddingX: 40,
    rightColumnTopMargin: 0,
    rightColumnGap: 14,
    displayFontFamily: "Bayon, sans-serif",
    bodyFontFamily: "Inter, sans-serif",
    bodyFontSize: 14,
    titleFontSize: 34,
    titleLineHeight: 36,
    titleColor: "#000000",
    titleToPriceGap: 8,
    priceFontSize: 32,
    buttonFontSize: 14,
    addToCartWidth: 100,
    addToCartFill: "#000000",
    addToCartBorderColor: "#000000",
    addToCartBorderWidth: 0,
    addToCartBorderRadius: 12,
    addToCartTextColor: "#ffffff",
    collapsableTextWidth: 100,
    priceToColorGap: 6,
    colorButtonHeight: 45.5,
    colorButtonWidth: 96,
    colorButtonRadius: 12,
    colorLabelGap: 0,
    colorGridColumns: 3,
    colorButtonColumnGap: 10,
    colorButtonRowGap: 12,
    colorImageScale: 100,
    colorImageFit: "cover",
    imageFullColumn: [],
    imageColumnModes: [],
    imageCropX: [],
    imageCropY: [],
    carouselPaddingLeft: 0,
    carouselPaddingRight: 0,
    carouselArrowColor: "#000000",
    carouselArrowSize: 44,
}

addPropertyControls(MirrorShopComponent, {
    useCafe24: {
        type: ControlType.Boolean,
        title: "Use Cafe24",
        defaultValue: false,
    },
    showCafe24VariantHelper: {
        type: ControlType.Boolean,
        title: "Show Variant Helper",
        defaultValue: false,
    },
    cafe24BackendUrl: {
        type: ControlType.String,
        title: "Backend URL",
        placeholder: "https://your-app.vercel.app",
        defaultValue: "",
    },
    cafe24StoreDomain: {
        type: ControlType.String,
        title: "Store Domain",
        placeholder: "your-store.cafe24.com",
        defaultValue: "",
    },
    cafe24ShopNo: {
        type: ControlType.String,
        title: "Shop No",
        defaultValue: "1",
    },
    cafe24AccessToken: {
        type: ControlType.String,
        title: "Access Token",
        placeholder: "optional if backend supplies it",
        defaultValue: "",
    },
    cafe24ProductHandle: {
        type: ControlType.String,
        title: "Product Handle",
        placeholder: "product-handle-or-slug",
        defaultValue: "",
    },
    cafe24ProductNo: {
        type: ControlType.String,
        title: "Product No",
        placeholder: "numeric Cafe24 product number",
        defaultValue: "",
    },
    cafe24VariantId: {
        type: ControlType.String,
        title: "Variant ID",
        placeholder: "manual Cafe24 variant id",
        defaultValue: "",
    },
    cafe24BuyNowLabel: {
        type: ControlType.String,
        title: "Buy Now",
        defaultValue: "Buy now",
    },
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "REVERSO PUFFA",
    },
    description: {
        type: ControlType.String,
        title: "Description Text",
        displayTextArea: true,
        defaultValue: defaultDescription,
    },
    price: { type: ControlType.String, title: "Price", defaultValue: "$139" },
    buttonLabel: {
        type: ControlType.String,
        title: "Button",
        defaultValue: "Add to cart",
    },
    colorLabel: {
        type: ControlType.String,
        title: "Color Label",
        defaultValue: "Color",
    },
    descriptionLabel: {
        type: ControlType.String,
        title: "Description Label",
        defaultValue: "Description",
    },
    sizeGuideLabel: {
        type: ControlType.String,
        title: "Size Guide Label",
        defaultValue: "Size Guide",
    },
    shippingReturnsLabel: {
        type: ControlType.String,
        title: "Shipping Label",
        defaultValue: "Shipping & Returns",
    },
    sizeGuideText: {
        type: ControlType.String,
        title: "Size Guide Text",
        displayTextArea: true,
        defaultValue:
            "JAMES IS 6'1 / 185 CM WEARING SIZE LARGE.\nSAV IS 5'8 / 173 CM WEARING SIZE SMALL.",
    },
    shippingReturnsText: {
        type: ControlType.String,
        title: "Shipping Text",
        displayTextArea: true,
        defaultValue:
            "Orders are fulfilled from our UK or EU warehouse depending on where you're located. Customers within the UK or EU will not be charged any additional customs or duties.",
    },
    colorButtons: {
        type: ControlType.Array,
        title: "Color Buttons",
        control: {
            type: ControlType.Object,
            controls: {
                label: {
                    type: ControlType.String,
                    title: "Label",
                    defaultValue: "Color",
                },
                image: {
                    type: ControlType.Image,
                    title: "Image",
                },
                link: {
                    type: ControlType.String,
                    title: "Link",
                    placeholder: "https://...",
                    defaultValue: "",
                },
            },
        },
        defaultValue: defaultColorButtons,
    },
    defaultColorIndex: {
        type: ControlType.Number,
        title: "Default Color",
        min: 0,
        step: 1,
        defaultValue: 0,
    },
    carouselItems: {
        type: ControlType.Array,
        title: "Carousel Items",
        control: {
            type: ControlType.Object,
            controls: {
                image: {
                    type: ControlType.ResponsiveImage,
                    title: "Image",
                },
                video: {
                    type: ControlType.File,
                    title: "Video",
                    allowedFileTypes: ["mp4", "webm", "ogg", "mov", "m4v"],
                },
                fullWidth: {
                    type: ControlType.Boolean,
                    title: "Make Full Width",
                    defaultValue: false,
                },
                autoPlay: {
                    type: ControlType.Boolean,
                    title: "Autoplay",
                    defaultValue: true,
                },
                muted: {
                    type: ControlType.Boolean,
                    title: "Muted",
                    defaultValue: true,
                },
                loop: {
                    type: ControlType.Boolean,
                    title: "Loop",
                    defaultValue: true,
                },
                scale: {
                    type: ControlType.Number,
                    title: "Size",
                    min: 20,
                    max: 160,
                    step: 1,
                    unit: "%",
                    defaultValue: 100,
                },
                leftMargin: {
                    type: ControlType.Number,
                    title: "Left",
                    min: 0,
                    max: 240,
                    step: 1,
                    unit: "px",
                    defaultValue: 0,
                },
                rightMargin: {
                    type: ControlType.Number,
                    title: "Right",
                    min: 0,
                    max: 240,
                    step: 1,
                    unit: "px",
                    defaultValue: 0,
                },
                topMargin: {
                    type: ControlType.Number,
                    title: "Top",
                    min: 0,
                    max: 240,
                    step: 1,
                    unit: "px",
                    defaultValue: 0,
                },
                bottomMargin: {
                    type: ControlType.Number,
                    title: "Bottom",
                    min: 0,
                    max: 240,
                    step: 1,
                    unit: "px",
                    defaultValue: 0,
                },
            },
        },
        defaultValue: [],
    },
    rightColumnTopMargin: {
        type: ControlType.Number,
        title: "Right Top",
        min: 0,
        max: 240,
        step: 1,
        unit: "px",
        defaultValue: 0,
    },
    carouselPaddingLeft: {
        type: ControlType.Number,
        title: "Carousel Left",
        min: 0,
        max: 120,
        step: 1,
        unit: "px",
        defaultValue: 0,
    },
    carouselPaddingRight: {
        type: ControlType.Number,
        title: "Carousel Right",
        min: 0,
        max: 120,
        step: 1,
        unit: "px",
        defaultValue: 0,
    },
    rightColumnPaddingX: {
        type: ControlType.Number,
        title: "Right Padding",
        min: 0,
        max: 120,
        step: 1,
        unit: "px",
        defaultValue: 40,
    },
    rightColumnGap: {
        type: ControlType.Number,
        title: "Right Gap",
        min: 0,
        max: 80,
        step: 1,
        unit: "px",
        defaultValue: 14,
    },
    displayFontFamily: {
        type: ControlType.String,
        title: "Display Font",
        defaultValue: "Bayon, sans-serif",
    },
    bodyFontFamily: {
        type: ControlType.String,
        title: "Body Font",
        defaultValue: "Inter, sans-serif",
    },
    bodyFontSize: {
        type: ControlType.Number,
        title: "Body Size",
        min: 8,
        max: 32,
        step: 1,
        unit: "px",
        defaultValue: 14,
    },
    titleFontSize: {
        type: ControlType.Number,
        title: "Title Size",
        min: 10,
        max: 96,
        step: 1,
        unit: "px",
        defaultValue: 34,
    },
    titleLineHeight: {
        type: ControlType.Number,
        title: "Title Line",
        min: 10,
        max: 120,
        step: 1,
        unit: "px",
        defaultValue: 36,
    },
    titleColor: {
        type: ControlType.Color,
        title: "Title Color",
        defaultValue: "#000000",
    },
    titleToPriceGap: {
        type: ControlType.Number,
        title: "Title-Price",
        min: -40,
        max: 80,
        step: 1,
        unit: "px",
        defaultValue: 8,
    },
    priceFontSize: {
        type: ControlType.Number,
        title: "Price Size",
        min: 12,
        max: 96,
        step: 1,
        unit: "px",
        defaultValue: 32,
    },
    buttonFontSize: {
        type: ControlType.Number,
        title: "Button Text",
        min: 8,
        max: 32,
        step: 1,
        unit: "px",
        defaultValue: 14,
    },
    addToCartWidth: {
        type: ControlType.Number,
        title: "CTA Width",
        min: 20,
        max: 100,
        step: 1,
        unit: "%",
        defaultValue: 100,
    },
    addToCartFill: {
        type: ControlType.Color,
        title: "CTA Fill",
        defaultValue: "#000000",
    },
    addToCartBorderColor: {
        type: ControlType.Color,
        title: "CTA Border",
        defaultValue: "#000000",
    },
    addToCartBorderWidth: {
        type: ControlType.Number,
        title: "CTA Border W",
        min: 0,
        max: 12,
        step: 1,
        unit: "px",
        defaultValue: 0,
    },
    addToCartBorderRadius: {
        type: ControlType.Number,
        title: "CTA Radius",
        min: 0,
        max: 40,
        step: 1,
        unit: "px",
        defaultValue: 12,
    },
    addToCartTextColor: {
        type: ControlType.Color,
        title: "CTA Text",
        defaultValue: "#ffffff",
    },
    collapsableTextWidth: {
        type: ControlType.Number,
        title: "Text Width",
        min: 20,
        max: 100,
        step: 1,
        unit: "%",
        defaultValue: 100,
    },
    priceToColorGap: {
        type: ControlType.Number,
        title: "Price-Color",
        min: -40,
        max: 80,
        step: 1,
        unit: "px",
        defaultValue: 6,
    },
    colorButtonHeight: {
        type: ControlType.Number,
        title: "Color Btn H",
        min: 24,
        max: 160,
        step: 1,
        unit: "px",
        defaultValue: 45.5,
    },
    colorButtonWidth: {
        type: ControlType.Number,
        title: "Color Btn W",
        min: 24,
        max: 240,
        step: 1,
        unit: "px",
        defaultValue: 96,
    },
    colorButtonRadius: {
        type: ControlType.Number,
        title: "Color Btn Radius",
        min: 0,
        max: 40,
        step: 1,
        unit: "px",
        defaultValue: 12,
    },
    colorLabelGap: {
        type: ControlType.Number,
        title: "Color Gap",
        min: -40,
        max: 80,
        step: 1,
        unit: "px",
        defaultValue: 0,
    },
    colorGridColumns: {
        type: ControlType.Number,
        title: "Color Columns",
        min: 1,
        max: 6,
        step: 1,
        defaultValue: 3,
    },
    colorButtonColumnGap: {
        type: ControlType.Number,
        title: "Color Col Gap",
        min: 0,
        max: 40,
        step: 1,
        unit: "px",
        defaultValue: 10,
    },
    colorButtonRowGap: {
        type: ControlType.Number,
        title: "Color Row Gap",
        min: 0,
        max: 40,
        step: 1,
        unit: "px",
        defaultValue: 12,
    },
    colorImageScale: {
        type: ControlType.Number,
        title: "Color Img Size",
        min: 20,
        max: 180,
        step: 1,
        unit: "%",
        defaultValue: 100,
    },
    colorImageFit: {
        type: ControlType.Enum,
        title: "Color Img Fit",
        options: ["cover", "contain"],
        optionTitles: ["Cover", "Contain"],
        defaultValue: "cover",
    },
    carouselArrowColor: {
        type: ControlType.Color,
        title: "Arrow Color",
        defaultValue: "#000000",
    },
    carouselArrowSize: {
        type: ControlType.Number,
        title: "Arrow Size",
        min: 16,
        max: 96,
        step: 1,
        unit: "px",
        defaultValue: 44,
    },
})

function CarouselChevron({
    direction,
    color,
    size,
}: {
    direction: "left" | "right"
    color: string
    size: number
}) {
    const strokeWidth = Math.max(1, size * 0.035)
    const path = direction === "left" ? "M15 5L8 12L15 19" : "M9 5L16 12L9 19"

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d={path}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="square"
                strokeLinejoin="miter"
            />
        </svg>
    )
}

function ArrowIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M11.246 5.318a.51.51 0 0 1 .363 0l4.104 4.104a.513.513 0 0 1 0 .726l-4.104 4.104a.514.514 0 0 1-.726-.727l3.229-3.228H3.039a.513.513 0 1 1 0-1.026h11.073L10.883 6.044a.513.513 0 0 1 .363-.726Z"
                fill="currentColor"
            />
        </svg>
    )
}

const rootStyle: React.CSSProperties = {
    width: "100%",
    height: "calc(100vh - 128px)",
    minHeight: "calc(100vh - 128px)",
    maxHeight: "calc(100vh - 128px)",
    background: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    overflow: "hidden",
}

const pageStyle: React.CSSProperties = {
    width: "100vw",
    maxWidth: "none",
    height: "100%",
    minHeight: 0,
    background: "#ffffff",
    boxSizing: "border-box",
    padding: "34px 0 72px",
    overflow: "hidden",
}

const gridStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
    columnGap: 0,
    alignItems: "start",
}

const mediaColumnStyle: React.CSSProperties = {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 0,
    boxSizing: "border-box",
    paddingInline: 0,
}

const mediaItemStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 720,
    background: "#ffffff",
    overflow: "visible",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
}

const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "auto",
    display: "block",
    objectFit: "contain",
    alignSelf: "flex-start",
    maxWidth: "none",
    maxHeight: "none",
}

const sizeImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
}

const carouselArrowStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    zIndex: 2,
}

const rightColumnStyle: React.CSSProperties = {
    position: "sticky",
    top: 48,
    alignSelf: "start",
    display: "flex",
    justifyContent: "center",
    background: "#ffffff",
}

const rightInnerStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 320,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: "0",
    boxSizing: "border-box",
}

const columnFrameStyle: React.CSSProperties = {
    width: "100%",
    background: "#ffffff",
    boxSizing: "border-box",
}

const titleStyle: React.CSSProperties = {
    margin: "14px 0 0",
    color: "#000000",
    fontFamily: "Bayon, sans-serif",
    fontWeight: 400,
    fontSize: 34,
    lineHeight: "36px",
}

const descriptionListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "#000000",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    lineHeight: "22.4px",
    textTransform: "uppercase",
}

const descriptionLineStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
}

const bulletStyle: React.CSSProperties = {
    display: "inline-block",
    minWidth: 12,
    lineHeight: "22.4px",
}

const priceRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 8,
}

const priceStyle: React.CSSProperties = {
    color: "#000000",
    fontFamily: "Bayon, sans-serif",
    fontSize: 32,
    lineHeight: "32px",
}

const sizeHeaderStyle: React.CSSProperties = {
    marginTop: 6,
    color: "#000000",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    lineHeight: "22.4px",
}

const sizeGridStyle: React.CSSProperties = {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    columnGap: 10,
    rowGap: 12,
}

const sizeButtonStyle: React.CSSProperties = {
    height: 45.5,
    appearance: "none",
    borderRadius: 12,
    background: "#ffffff",
    color: "#000000",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    lineHeight: "22.4px",
    padding: "8px 12.8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
}

const ctaStyle: React.CSSProperties = {
    width: "100%",
    height: 52,
    marginTop: 2,
    appearance: "none",
    border: "none",
    borderRadius: 12,
    background: "#000000",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
}

const ctaInnerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
}

const linkGroupStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 2,
}

const linkButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "none",
    padding: 0,
    color: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    lineHeight: "22.4px",
    cursor: "pointer",
    textAlign: "left",
}

const panelTextStyle: React.CSSProperties = {
    color: "#000000",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    lineHeight: "22.4px",
    whiteSpace: "pre-wrap",
}

const cafe24NoticeStyle: React.CSSProperties = {
    width: "100%",
    border: "1px dashed rgba(0, 0, 0, 0.24)",
    borderRadius: 12,
    padding: "14px 16px",
    background: "#f7f7f4",
    boxSizing: "border-box",
}
