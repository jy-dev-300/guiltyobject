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

OverlayNavigationSubnavFixed.defaultProps = {
    logo: { src: "", alt: "Logo" },
    logoSize: 120,
    navFontFamily: "Inter, sans-serif",
    dropdownFontFamily: "Inter, sans-serif",
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
