import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type MenuItem = {
    label: string
    link: string
}

type LogoImage = {
    src: string
    alt?: string
}

type Props = {
    logo: LogoImage
    logoSize: number
    navFontFamily: string
    dropdownFontFamily: string
    useCafe24Cart: boolean
    cafe24BackendUrl: string
    cafe24CartRedirectUrl: string
    cafe24BuyNowRedirectUrl: string
    cartLabel: string
    shopLabel: string
    aboutLabel: string
    campaignLabel: string
    contactLabel: string
    shopLink: string
    aboutLink: string
    campaignLink: string
    contactLink: string
    dropdownItems: MenuItem[]
    navHeight: number
    dropdownHeight: number
    subnavWidth: number
    subnavAlign: "left" | "center" | "right"
    navPaddingX: number
    gap: number
    fontSize: number
    textColor: string
    backgroundColor: string
    borderColor: string
    shadow: boolean
    zIndex: number
}

type ShadowCartItem = {
    productNo: string
    variantCode: string
    quantity: number
    title: string
    optionLabel: string
    priceLabel: string
    previewImage: string
}

function joinUrl(baseUrl: string, path: string): string {
    const normalizedBase = baseUrl.trim().replace(/\/+$/, "")
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    return `${normalizedBase}${normalizedPath}`
}

const shadowCartStorageKey = "mirror-shop-shadow-cart-v1"
const shadowCartSyncStorageKey = "mirror-shop-shadow-cart-sync-v1"
const shadowCartChangeEventName = "mirror-shop-shadow-cart-change"

function readShadowCart(): ShadowCartItem[] {
    if (typeof window === "undefined") return []

    try {
        const rawValue = window.localStorage.getItem(shadowCartStorageKey)
        if (!rawValue) return []

        const parsed = JSON.parse(rawValue)
        if (!Array.isArray(parsed)) return []

        return parsed
            .map((item) => ({
                productNo: String(item?.productNo || "").trim(),
                variantCode: String(item?.variantCode || "").trim(),
                quantity: Math.max(1, Math.floor(Number(item?.quantity) || 1)),
                title: String(item?.title || "").trim(),
                optionLabel: String(item?.optionLabel || "").trim(),
                priceLabel: String(item?.priceLabel || "").trim(),
                previewImage: String(item?.previewImage || "").trim(),
            }))
            .filter((item) => Boolean(item.productNo))
    } catch (_error) {
        return []
    }
}

function writeShadowCart(items: ShadowCartItem[]) {
    if (typeof window === "undefined") return

    window.localStorage.setItem(shadowCartStorageKey, JSON.stringify(items))
    window.dispatchEvent(new Event(shadowCartChangeEventName))
}

function readShadowCartSyncSignature(): string {
    if (typeof window === "undefined") return ""

    return window.localStorage.getItem(shadowCartSyncStorageKey) || ""
}

function writeShadowCartSyncSignature(signature: string) {
    if (typeof window === "undefined") return

    window.localStorage.setItem(shadowCartSyncStorageKey, signature)
}

function clearShadowCartSyncSignature() {
    if (typeof window === "undefined") return

    window.localStorage.removeItem(shadowCartSyncStorageKey)
}

function getShadowCartItemKey(item: {
    productNo: string
    variantCode: string
}) {
    return `${item.productNo.trim()}::${item.variantCode.trim()}`
}

function getShadowCartSignature(items: ShadowCartItem[]): string {
    return items
        .map((item) => ({
            productNo: item.productNo.trim(),
            variantCode: item.variantCode.trim(),
            quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        }))
        .sort((left, right) =>
            getShadowCartItemKey(left).localeCompare(getShadowCartItemKey(right))
        )
        .map((item) => `${item.productNo}:${item.variantCode}:${item.quantity}`)
        .join("|")
}

function parsePriceValue(priceLabel: string): number | null {
    const normalized = priceLabel.replace(/,/g, "").trim()
    const match = normalized.match(/-?\d+(?:\.\d+)?/)
    if (!match) return null

    const value = Number(match[0])
    return Number.isFinite(value) ? value : null
}

function formatPriceValue(amount: number, sampleLabel: string): string {
    const trimmedSample = sampleLabel.trim()
    if (!trimmedSample) return String(amount)

    if (trimmedSample.includes("KRW")) {
        return `KRW ${Math.round(amount).toLocaleString("en-US")}`
    }

    if (trimmedSample.includes("$")) {
        return `$${amount.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`
    }

    const prefixMatch = trimmedSample.match(/^[^\d-]+/)
    const suffixMatch = trimmedSample.match(/[^\d]+$/)

    if (prefixMatch) {
        return `${prefixMatch[0]}${amount.toLocaleString("en-US")}`
    }

    if (suffixMatch) {
        return `${amount.toLocaleString("en-US")}${suffixMatch[0]}`
    }

    return amount.toLocaleString("en-US")
}

type NavCafe24CartButtonProps = {
    enabled: boolean
    backendUrl: string
    cartRedirectUrl: string
    buyNowRedirectUrl: string
    label: string
    fontFamily: string
    fontSize: number
    textColor: string
}

function NavCafe24CartButton(props: NavCafe24CartButtonProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [status, setStatus] = React.useState<
        "idle" | "submitting" | "success" | "error"
    >("idle")
    const [items, setItems] = React.useState<ShadowCartItem[]>([])
    const [cartCount, setCartCount] = React.useState(0)
    const [message, setMessage] = React.useState("")

    const hasBackend = Boolean(props.backendUrl.trim())

    const syncCartCount = React.useCallback(() => {
        const nextItems = readShadowCart()
        setItems(nextItems)
        const nextCount = nextItems.reduce(
            (total, item) => total + item.quantity,
            0
        )
        setCartCount(nextCount)
    }, [])

    React.useEffect(() => {
        syncCartCount()

        if (typeof window === "undefined") return

        const handleStorage = (event: StorageEvent) => {
            if (event.key && event.key !== shadowCartStorageKey) return
            syncCartCount()
        }
        const handleShadowCartChange = () => {
            syncCartCount()
        }

        window.addEventListener("storage", handleStorage)
        window.addEventListener(
            shadowCartChangeEventName,
            handleShadowCartChange
        )
        return () => {
            window.removeEventListener("storage", handleStorage)
            window.removeEventListener(
                shadowCartChangeEventName,
                handleShadowCartChange
            )
        }
    }, [syncCartCount])

    React.useEffect(() => {
        if (typeof document === "undefined") return

        if (!isOpen) {
            document.body.style.overflow = ""
            return
        }

        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
        }
    }, [isOpen])

    React.useEffect(() => {
        if (typeof window === "undefined" || !isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen])

    const updateCartItems = React.useCallback((nextItems: ShadowCartItem[]) => {
        writeShadowCart(nextItems)
        clearShadowCartSyncSignature()
        setItems(nextItems)
        const nextCount = nextItems.reduce(
            (total, item) => total + item.quantity,
            0
        )
        setCartCount(nextCount)
    }, [])

    const handleRemoveItem = React.useCallback(
        (targetItem: ShadowCartItem) => {
            const nextItems = items.filter(
                (item) =>
                    getShadowCartItemKey(item) !== getShadowCartItemKey(targetItem)
            )
            updateCartItems(nextItems)
        },
        [items, updateCartItems]
    )

    const handleQuantityChange = React.useCallback(
        (targetItem: ShadowCartItem, delta: number) => {
            const nextItems = items
                .map((item) => {
                    if (
                        getShadowCartItemKey(item) !== getShadowCartItemKey(targetItem)
                    ) {
                        return item
                    }

                    return {
                        ...item,
                        quantity: Math.max(1, item.quantity + delta),
                    }
                })
                .filter((item) => item.quantity > 0)

            updateCartItems(nextItems)
        },
        [items, updateCartItems]
    )

    const handleCheckout = React.useCallback(async () => {
        if (!hasBackend || typeof window === "undefined") return

        const itemsToSync = readShadowCart()
        if (itemsToSync.length <= 0) {
            setStatus("error")
            setMessage("Add an item before checkout.")
            return
        }

        syncCartCount()
        const nextSignature = getShadowCartSignature(itemsToSync)
        const lastSyncedSignature = readShadowCartSyncSignature()

        let directRedirectUrl =
            props.buyNowRedirectUrl.trim() || props.cartRedirectUrl.trim()

        setStatus("submitting")
        setMessage("")

        if (!directRedirectUrl) {
            try {
                const response = await window.fetch(
                    joinUrl(props.backendUrl, "/api/cart/urls"),
                    {
                        method: "GET",
                    }
                )
                const result = await response.json().catch(() => ({ ok: false }))

                if (response.ok) {
                    directRedirectUrl =
                        result?.urls?.checkoutUrl ||
                        result?.urls?.cartUrl ||
                        ""
                }
            } catch (_error) {
                directRedirectUrl = ""
            }
        }

        if (nextSignature && nextSignature === lastSyncedSignature) {
            if (directRedirectUrl) {
                window.location.href = directRedirectUrl
                return
            }
        }

        try {
            const response = await window.fetch(
                joinUrl(props.backendUrl, "/api/cart/checkout"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        items: itemsToSync,
                    }),
                }
            )

            const result = await response
                .json()
                .catch(() => ({ ok: false, message: "Invalid JSON" }))

            if (!response.ok) {
                throw new Error(result?.message || "Cafe24 cart sync failed.")
            }

            writeShadowCartSyncSignature(nextSignature)

            const nextRedirectUrl =
                result?.checkoutRedirectUrl ||
                directRedirectUrl ||
                result?.cartRedirectUrl ||
                props.buyNowRedirectUrl.trim() ||
                props.cartRedirectUrl.trim()

            if (nextRedirectUrl) {
                setIsOpen(false)
                window.location.href = nextRedirectUrl
                return
            }

            setStatus("success")
            setMessage("Cafe24 cart is ready.")
        } catch (error) {
            clearShadowCartSyncSignature()
            setStatus("error")
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to open the Cafe24 cart."
            )

            if (directRedirectUrl) {
                setIsOpen(false)
                window.location.href = directRedirectUrl
            }
        }
    }, [
        hasBackend,
        props.backendUrl,
        props.buyNowRedirectUrl,
        props.cartRedirectUrl,
        syncCartCount,
    ])

    if (!props.enabled) return null

    return (
        <>
            <button
                type="button"
                disabled={false}
                onClick={() => {
                    syncCartCount()
                    setMessage("")
                    setIsOpen(true)
                }}
                style={{
                    ...navButtonStyle,
                fontFamily: props.fontFamily,
                fontSize: props.fontSize,
                color: props.textColor,
                    opacity: 1,
                }}
                title={
                    message || "Open cart"
                }
            >
                {props.label}
                {cartCount > 0 ? ` (${cartCount})` : ""}
            </button>

            {isOpen ? (
                <>
                    <button
                        type="button"
                        aria-label="Close cart"
                        onClick={() => {
                            setIsOpen(false)
                        }}
                        style={cartBackdropStyle}
                    />

                    <div style={cartDrawerStyle}>
                        <div style={cartDrawerHeaderStyle}>
                            <div
                                style={{
                                    ...cartDrawerTitleStyle,
                                    fontFamily: props.fontFamily,
                                }}
                            >
                                {props.label}
                                {cartCount > 0 ? ` (${cartCount})` : ""}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false)
                                }}
                                style={cartCloseButtonStyle}
                                aria-label="Close cart"
                            >
                                ×
                            </button>
                        </div>

                        <div style={cartDrawerBodyStyle}>
                            <div
                                style={{
                                    ...cartSectionLabelStyle,
                                    fontFamily: props.fontFamily,
                                }}
                            >
                                Products
                            </div>

                            {items.length > 0 ? (
                                items.map((item) => {
                                    const unitPrice =
                                        parsePriceValue(item.priceLabel) ?? 0
                                    const lineTotal = unitPrice * item.quantity
                                    const lineTotalLabel =
                                        item.priceLabel && unitPrice > 0
                                            ? formatPriceValue(
                                                  lineTotal,
                                                  item.priceLabel
                                              )
                                            : ""

                                    return (
                                        <div
                                            key={getShadowCartItemKey(item)}
                                            style={cartItemStyle}
                                        >
                                            <div style={cartItemMediaStyle}>
                                                {item.previewImage ? (
                                                    <img
                                                        src={item.previewImage}
                                                        alt={item.title}
                                                        style={cartItemImageStyle}
                                                    />
                                                ) : null}
                                            </div>

                                            <div style={cartItemContentStyle}>
                                                <div
                                                    style={{
                                                        ...cartItemTitleStyle,
                                                        fontFamily:
                                                            props.fontFamily,
                                                    }}
                                                >
                                                    {item.title || "Product"}
                                                </div>
                                                {item.priceLabel ? (
                                                    <div
                                                        style={cartItemPriceStyle}
                                                    >
                                                        {item.priceLabel}
                                                    </div>
                                                ) : null}
                                                {item.optionLabel ? (
                                                    <div
                                                        style={cartItemOptionStyle}
                                                    >
                                                        {item.optionLabel}
                                                    </div>
                                                ) : null}

                                                <div
                                                    style={
                                                        cartQuantityControlsStyle
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleQuantityChange(
                                                                item,
                                                                -1
                                                            )
                                                        }}
                                                        style={
                                                            cartQuantityButtonStyle
                                                        }
                                                    >
                                                        −
                                                    </button>
                                                    <div
                                                        style={
                                                            cartQuantityValueStyle
                                                        }
                                                    >
                                                        {item.quantity}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleQuantityChange(
                                                                item,
                                                                1
                                                            )
                                                        }}
                                                        style={
                                                            cartQuantityButtonStyle
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleRemoveItem(item)
                                                    }}
                                                    style={cartRemoveButtonStyle}
                                                >
                                                    Remove
                                                </button>

                                                {lineTotalLabel ? (
                                                    <div
                                                        style={
                                                            cartLineTotalStyle
                                                        }
                                                    >
                                                        Total: {lineTotalLabel}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div style={cartEmptyStateStyle}>
                                    Your cart is empty.
                                </div>
                            )}
                        </div>

                        <div style={cartFooterStyle}>
                            <div style={cartSubtotalRowStyle}>
                                <span>Subtotal</span>
                                <span>
                                    {(() => {
                                        const pricedItems = items
                                            .map((item) => ({
                                                value:
                                                    parsePriceValue(
                                                        item.priceLabel
                                                    ) ?? 0,
                                                sample: item.priceLabel,
                                                quantity: item.quantity,
                                            }))
                                            .filter((item) => item.value > 0)

                                        if (pricedItems.length <= 0) {
                                            return "Calculated at checkout"
                                        }

                                        const subtotal = pricedItems.reduce(
                                            (total, item) =>
                                                total +
                                                item.value * item.quantity,
                                            0
                                        )

                                        return formatPriceValue(
                                            subtotal,
                                            pricedItems[0].sample
                                        )
                                    })()}
                                </span>
                            </div>

                            {message ? (
                                <div style={cartMessageStyle}>{message}</div>
                            ) : null}

                            <button
                                type="button"
                                disabled={
                                    !hasBackend ||
                                    status === "submitting" ||
                                    items.length <= 0
                                }
                                onClick={() => {
                                    void handleCheckout()
                                }}
                                style={{
                                    ...cartCheckoutButtonStyle,
                                    opacity:
                                        !hasBackend ||
                                        status === "submitting" ||
                                        items.length <= 0
                                            ? 0.55
                                            : 1,
                                }}
                            >
                                {status === "submitting"
                                    ? "Opening..."
                                    : "Checkout"}
                            </button>
                        </div>
                    </div>
                </>
            ) : null}
        </>
    )
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 64
 */
export default function OverlayNavigationSubnavFixed(props: Partial<Props>) {
    const {
        logo = { src: "", alt: "Logo" },
        logoSize = 120,
        navFontFamily = "Inter, sans-serif",
        dropdownFontFamily = "Inter, sans-serif",
        useCafe24Cart = false,
        cafe24BackendUrl = "",
        cafe24CartRedirectUrl = "",
        cafe24BuyNowRedirectUrl = "",
        cartLabel = "CART",
        shopLabel = "SHOP",
        aboutLabel = "ABOUT",
        campaignLabel = "CAMPAIGN",
        contactLabel = "CONTACT",
        shopLink = "",
        aboutLink = "",
        campaignLink = "",
        contactLink = "",
        dropdownItems = [
            { label: "NEW PRODUCTS", link: "" },
            { label: "HOME COLLECTION", link: "" },
        ],
        navHeight = 64,
        dropdownHeight = 100,
        subnavWidth = 100,
        subnavAlign = "left",
        navPaddingX = 28,
        gap = 28,
        fontSize = 14,
        textColor = "#333333",
        backgroundColor = "#ffffff",
        borderColor = "rgba(0, 0, 0, 0.12)",
        shadow = true,
        zIndex = 999999,
    } = props

    const [open, setOpen] = React.useState(false)
    const closeTimer = React.useRef<number | null>(null)

    const safeSubnavWidth = Math.min(100, Math.max(1, subnavWidth))
    const subnavLeft =
        subnavAlign === "center"
            ? `calc((100vw - ${safeSubnavWidth}vw) / 2)`
            : subnavAlign === "right"
              ? `calc(100vw - ${safeSubnavWidth}vw)`
              : 0

    const clearCloseTimer = React.useCallback(() => {
        if (closeTimer.current !== null) {
            window.clearTimeout(closeTimer.current)
            closeTimer.current = null
        }
    }, [])

    const openMenu = React.useCallback(() => {
        clearCloseTimer()
        setOpen(true)
    }, [clearCloseTimer])

    const scheduleClose = React.useCallback(() => {
        clearCloseTimer()
        closeTimer.current = window.setTimeout(() => {
            setOpen(false)
        }, 90)
    }, [clearCloseTimer])

    React.useEffect(() => {
        return () => {
            clearCloseTimer()
        }
    }, [clearCloseTimer])

    const go = (link: string) => {
        if (!link || typeof window === "undefined") return
        window.location.href = link
    }

    return (
        <>
            <div
                style={{
                    width: "100%",
                    height: navHeight,
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex,
                    background: backgroundColor,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    padding: `0 ${navPaddingX}px`,
                    overflow: "visible",
                }}
                onMouseLeave={scheduleClose}
            >
                {logo?.src ? (
                    <button
                        type="button"
                        aria-label="Go to home page"
                        onClick={() => go("/")}
                        style={{
                            ...logoButtonStyle,
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: logoSize,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <img
                            src={logo.src}
                            alt={logo.alt || "Logo"}
                            style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "contain",
                                display: "block",
                            }}
                        />
                    </button>
                ) : null}

                <button
                    type="button"
                    onMouseEnter={openMenu}
                    onFocus={openMenu}
                    onClick={() => go(shopLink)}
                    style={{
                        ...navButtonStyle,
                        fontFamily: navFontFamily,
                        marginRight: gap,
                        fontSize,
                        color: textColor,
                    }}
                >
                    {shopLabel}
                </button>

                <button
                    type="button"
                    onMouseEnter={scheduleClose}
                    onClick={() => go(aboutLink)}
                    style={{
                        ...navButtonStyle,
                        fontFamily: navFontFamily,
                        marginRight: gap,
                        fontSize,
                        color: textColor,
                    }}
                >
                    {aboutLabel}
                </button>

                <button
                    type="button"
                    onMouseEnter={scheduleClose}
                    onClick={() => go(campaignLink)}
                    style={{
                        ...navButtonStyle,
                        fontFamily: navFontFamily,
                        marginRight: gap,
                        fontSize,
                        color: textColor,
                    }}
                >
                    {campaignLabel}
                </button>

                <button
                    type="button"
                    onMouseEnter={scheduleClose}
                    onClick={() => go(contactLink)}
                    style={{
                        ...navButtonStyle,
                        fontFamily: navFontFamily,
                        fontSize,
                        color: textColor,
                    }}
                >
                    {contactLabel}
                </button>

                <div
                    style={{
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <NavCafe24CartButton
                        enabled={useCafe24Cart}
                        backendUrl={cafe24BackendUrl}
                        cartRedirectUrl={cafe24CartRedirectUrl}
                        buyNowRedirectUrl={cafe24BuyNowRedirectUrl}
                        label={cartLabel}
                        fontFamily={navFontFamily}
                        fontSize={fontSize}
                        textColor={textColor}
                    />
                </div>
            </div>

            <div
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
                style={{
                    position: "fixed",
                    top: navHeight,
                    left: subnavLeft,
                    width: `${safeSubnavWidth}vw`,
                    height: dropdownHeight,
                    zIndex,
                    background: backgroundColor,
                    borderTop: `1px solid ${borderColor}`,
                    boxShadow: shadow
                        ? "0 22px 36px rgba(0, 0, 0, 0.08)"
                        : "none",
                    opacity: open ? 1 : 0,
                    visibility: open ? "visible" : "hidden",
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 140ms ease, visibility 140ms ease",
                    boxSizing: "border-box",
                    padding: `20px ${navPaddingX}px`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                }}
            >
                {dropdownItems.map((item, index) => (
                    <button
                        key={`${item.label}-${index}`}
                        type="button"
                        onClick={() => go(item.link)}
                        style={{
                            ...dropdownButtonStyle,
                            fontFamily: dropdownFontFamily,
                            fontSize,
                            color: textColor,
                        }}
                    >
                        {item.label || `ITEM ${index + 1}`}
                    </button>
                ))}
            </div>
        </>
    )
}

const navButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    fontWeight: 400,
    lineHeight: "1",
    letterSpacing: "0",
}

const dropdownButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    width: "fit-content",
    fontFamily: "Inter, sans-serif",
    fontWeight: 400,
    lineHeight: "1",
    textAlign: "left",
}

const logoButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    cursor: "pointer",
}

const cartBackdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    border: "none",
    background: "rgba(0, 0, 0, 0.34)",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    zIndex: 999997,
}

const cartDrawerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    right: 0,
    width: "clamp(320px, 25vw, 420px)",
    maxWidth: "92vw",
    height: "100vh",
    background: "#ffffff",
    zIndex: 999998,
    display: "flex",
    flexDirection: "column",
    boxShadow: "-18px 0 40px rgba(0, 0, 0, 0.12)",
}

const cartDrawerHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "22px 20px",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
}

const cartDrawerTitleStyle: React.CSSProperties = {
    fontSize: 18,
    lineHeight: "22px",
    textTransform: "uppercase",
}

const cartCloseButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    fontSize: 30,
    lineHeight: "30px",
    cursor: "pointer",
    color: "#111111",
}

const cartDrawerBodyStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "18px 20px 0",
}

const cartSectionLabelStyle: React.CSSProperties = {
    fontSize: 12,
    lineHeight: "16px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#555555",
    marginBottom: 14,
}

const cartItemStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "96px minmax(0, 1fr)",
    gap: 16,
    padding: "0 0 20px",
    marginBottom: 20,
    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
}

const cartItemMediaStyle: React.CSSProperties = {
    width: 96,
    height: 120,
    background: "#f4f4f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
}

const cartItemImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
}

const cartItemContentStyle: React.CSSProperties = {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
}

const cartItemTitleStyle: React.CSSProperties = {
    fontSize: 16,
    lineHeight: "20px",
    color: "#1a1a1a",
}

const cartItemPriceStyle: React.CSSProperties = {
    fontSize: 15,
    lineHeight: "19px",
    color: "#111111",
}

const cartItemOptionStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: "17px",
    color: "#666666",
}

const cartQuantityControlsStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "36px 52px 36px",
    width: "fit-content",
    border: "1px solid rgba(0, 0, 0, 0.14)",
    marginTop: 2,
}

const cartQuantityButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "#ffffff",
    padding: 0,
    height: 36,
    cursor: "pointer",
    fontSize: 22,
    lineHeight: "36px",
    color: "#111111",
}

const cartQuantityValueStyle: React.CSSProperties = {
    height: 36,
    display: "grid",
    placeItems: "center",
    borderLeft: "1px solid rgba(0, 0, 0, 0.14)",
    borderRight: "1px solid rgba(0, 0, 0, 0.14)",
    fontSize: 14,
    color: "#111111",
}

const cartRemoveButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    width: "fit-content",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: "18px",
    color: "#1a1a1a",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
}

const cartLineTotalStyle: React.CSSProperties = {
    marginTop: 2,
    paddingTop: 10,
    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
    fontSize: 13,
    lineHeight: "17px",
    color: "#111111",
    textTransform: "uppercase",
}

const cartEmptyStateStyle: React.CSSProperties = {
    padding: "24px 0",
    fontSize: 15,
    lineHeight: "22px",
    color: "#666666",
}

const cartFooterStyle: React.CSSProperties = {
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    padding: "18px 20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "#ffffff",
}

const cartSubtotalRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    fontSize: 18,
    lineHeight: "22px",
    color: "#111111",
    textTransform: "uppercase",
}

const cartMessageStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: "18px",
    color: "#444444",
}

const cartCheckoutButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "#000000",
    color: "#ffffff",
    width: "100%",
    minHeight: 52,
    cursor: "pointer",
    fontSize: 20,
    lineHeight: "24px",
    textTransform: "uppercase",
}

OverlayNavigationSubnavFixed.defaultProps = {
    logo: { src: "", alt: "Logo" },
    logoSize: 120,
    navFontFamily: "Inter, sans-serif",
    dropdownFontFamily: "Inter, sans-serif",
    useCafe24Cart: false,
    cafe24BackendUrl: "",
    cafe24CartRedirectUrl: "",
    cafe24BuyNowRedirectUrl: "",
    cartLabel: "CART",
    shopLabel: "SHOP",
    aboutLabel: "ABOUT",
    campaignLabel: "CAMPAIGN",
    contactLabel: "CONTACT",
    shopLink: "",
    aboutLink: "",
    campaignLink: "",
    contactLink: "",
    dropdownItems: [
        { label: "NEW PRODUCTS", link: "" },
        { label: "HOME COLLECTION", link: "" },
    ],
    navHeight: 64,
    dropdownHeight: 100,
    subnavWidth: 100,
    subnavAlign: "left",
    navPaddingX: 28,
    gap: 28,
    fontSize: 14,
    textColor: "#333333",
    backgroundColor: "#ffffff",
    borderColor: "rgba(0, 0, 0, 0.12)",
    shadow: true,
    zIndex: 999999,
}

addPropertyControls(OverlayNavigationSubnavFixed, {
    logo: {
        type: ControlType.ResponsiveImage,
        title: "Logo",
    },
    logoSize: {
        type: ControlType.Number,
        title: "Logo Size",
        min: 20,
        max: 600,
        step: 1,
        unit: "px",
        defaultValue: 120,
    },
    navFontFamily: {
        type: ControlType.String,
        title: "Nav Font",
        defaultValue: "Inter, sans-serif",
    },
    useCafe24Cart: {
        type: ControlType.Boolean,
        title: "Use Cart",
        defaultValue: false,
    },
    cafe24BackendUrl: {
        type: ControlType.String,
        title: "Backend URL",
        placeholder: "https://your-app.vercel.app",
        defaultValue: "",
    },
    cafe24CartRedirectUrl: {
        type: ControlType.String,
        title: "Cart URL",
        placeholder: "https://your-store.com/order/basket.html",
        defaultValue: "",
    },
    cafe24BuyNowRedirectUrl: {
        type: ControlType.String,
        title: "Buy URL",
        placeholder: "https://your-store.com/order/orderform.html",
        defaultValue: "",
    },
    cartLabel: {
        type: ControlType.String,
        title: "Cart Label",
        defaultValue: "CART",
    },
    dropdownFontFamily: {
        type: ControlType.String,
        title: "Dropdown Font",
        defaultValue: "Inter, sans-serif",
    },
    shopLabel: {
        type: ControlType.String,
        title: "Shop Label",
        defaultValue: "SHOP",
    },
    aboutLabel: {
        type: ControlType.String,
        title: "About Label",
        defaultValue: "ABOUT",
    },
    campaignLabel: {
        type: ControlType.String,
        title: "Campaign Label",
        defaultValue: "CAMPAIGN",
    },
    contactLabel: {
        type: ControlType.String,
        title: "Contact Label",
        defaultValue: "CONTACT",
    },
    shopLink: {
        type: ControlType.String,
        title: "Shop Link",
        defaultValue: "",
    },
    aboutLink: {
        type: ControlType.String,
        title: "About Link",
        defaultValue: "",
    },
    campaignLink: {
        type: ControlType.String,
        title: "Campaign Link",
        defaultValue: "",
    },
    contactLink: {
        type: ControlType.String,
        title: "Contact Link",
        defaultValue: "",
    },
    dropdownItems: {
        type: ControlType.Array,
        title: "Dropdown",
        control: {
            type: ControlType.Object,
            controls: {
                label: {
                    type: ControlType.String,
                    title: "Label",
                    defaultValue: "NEW PRODUCTS",
                },
                link: {
                    type: ControlType.String,
                    title: "Link",
                    defaultValue: "",
                },
            },
        },
        defaultValue: [
            { label: "NEW PRODUCTS", link: "" },
            { label: "HOME COLLECTION", link: "" },
        ],
    },
    navHeight: {
        type: ControlType.Number,
        title: "Nav Height",
        min: 32,
        max: 160,
        step: 1,
        unit: "px",
        defaultValue: 64,
    },
    dropdownHeight: {
        type: ControlType.Number,
        title: "Menu Height",
        min: 40,
        max: 400,
        step: 1,
        unit: "px",
        defaultValue: 100,
    },
    subnavWidth: {
        type: ControlType.Number,
        title: "Subnav Width",
        min: 1,
        max: 100,
        step: 1,
        unit: "vw",
        defaultValue: 100,
    },
    subnavAlign: {
        type: ControlType.Enum,
        title: "Subnav Align",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
        defaultValue: "left",
    },
    navPaddingX: {
        type: ControlType.Number,
        title: "Padding X",
        min: 0,
        max: 160,
        step: 1,
        unit: "px",
        defaultValue: 28,
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        min: 0,
        max: 120,
        step: 1,
        unit: "px",
        defaultValue: 28,
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        min: 8,
        max: 32,
        step: 1,
        unit: "px",
        defaultValue: 14,
    },
    textColor: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#333333",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#ffffff",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "rgba(0, 0, 0, 0.12)",
    },
    shadow: {
        type: ControlType.Boolean,
        title: "Shadow",
        defaultValue: true,
    },
    zIndex: {
        type: ControlType.Number,
        title: "Z Index",
        min: 0,
        max: 999999,
        step: 1,
        defaultValue: 999999,
    },
})
