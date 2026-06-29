import * as React from "react"
import { createPortal } from "react-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const MIRRORS_MENU_LOGO_EVENT = "mirrors-menu-logo-color-change"

// @framerSupportedLayoutWidth any
// @framerSupportedLayoutHeight any
// @framerIntrinsicWidth 400
// @framerIntrinsicHeight 400

export function StickyLogo(props) {
    const {
        logo,
        endScroll,
        endY,
        blackThresholdY,
        blackThresholdOffset,
        centerOnScroll,
        targetSelector,
        useTargetSelector,
        useParentBottomAsBlackY,
        zIndex,
        startColor,
        endColor,
        useOriginalStartColor,
        fullBleed,
    } = props

    const ref = React.useRef<HTMLDivElement>(null)

    const [rect, setRect] = React.useState({
        top: 0,
        left: 0,
        width: 400,
        height: 400,
    })
    const [parentBottom, setParentBottom] = React.useState(874)
    const [targetBottom, setTargetBottom] = React.useState<number | null>(null)
    const [viewportHeight, setViewportHeight] = React.useState(0)
    const [mirrorsMenuLogoOverrideColor, setMirrorsMenuLogoOverrideColor] =
        React.useState<string | null>(null)

    const { scrollY } = useScroll()

    const effectiveEndY =
        useTargetSelector && targetBottom !== null
            ? targetBottom - rect.top - rect.height
            : endY

    const safeEndScroll = Math.max(endScroll, 0)
    const centeredViewportY = Math.max(0, (viewportHeight - rect.height) / 2)
    const effectiveStartColor =
        mirrorsMenuLogoOverrideColor ?? (endScroll <= 0 ? endColor : startColor)
    const effectiveEndColor = mirrorsMenuLogoOverrideColor ?? endColor

    // Keep the logo anchored to its original document position, then add the
    // custom scroll-driven offset on top so it doesn't jitter near the end.
    const y = useTransform(scrollY, latestScrollY => {
        const progress =
            safeEndScroll === 0 ? 1 : Math.min(latestScrollY / safeEndScroll, 1)
        const anchoredY = rect.top - latestScrollY + effectiveEndY * progress

        return centerOnScroll
            ? Math.min(anchoredY, centeredViewportY)
            : anchoredY
    })
    const logoPageTop = useTransform([scrollY, y], ([latestScrollY, currentY]) => {
        return latestScrollY + currentY
    })
    const thresholdClipPath = useTransform(logoPageTop, currentPageTop => {
        const activeThresholdY = useParentBottomAsBlackY
            ? parentBottom + blackThresholdOffset
            : blackThresholdY + blackThresholdOffset
        const clipTop = Math.max(
            0,
            Math.min(rect.height, activeThresholdY - currentPageTop)
        )

        return `inset(${clipTop}px 0px 0px 0px)`
    })

    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const image = logo?.src
    const fixedLeft = fullBleed ? 0 : rect.left
    const fixedWidth = fullBleed ? "100vw" : rect.width

    React.useEffect(() => {
        let targetObserver: ResizeObserver | null = null
        let mutationObserver: MutationObserver | null = null

        const update = () => {
            if (!ref.current) return

            const r = ref.current.getBoundingClientRect()
            const selectorTarget =
                useTargetSelector && targetSelector.trim() !== ""
                    ? document.querySelector(targetSelector)
                    : null
            let thresholdElement: HTMLElement | null = ref.current.parentElement

            while (thresholdElement) {
                const candidateRect = thresholdElement.getBoundingClientRect()

                if (candidateRect.height > r.height + 1) break

                thresholdElement = thresholdElement.parentElement
            }

            const fallbackRect = thresholdElement?.getBoundingClientRect() ?? r
            const selectorRect =
                selectorTarget instanceof Element
                    ? selectorTarget.getBoundingClientRect()
                    : fallbackRect

            setRect({
                top: r.top + window.scrollY,
                left: r.left,
                width: r.width,
                height: r.height,
            })
            setViewportHeight(window.innerHeight)
            setParentBottom(fallbackRect.bottom + window.scrollY)
            setTargetBottom(
                selectorTarget instanceof Element
                    ? selectorRect.bottom + window.scrollY
                    : null
            )
        }

        update()

        window.addEventListener("resize", update)

        const observer = new ResizeObserver(update)
        if (ref.current) observer.observe(ref.current)
        if (useTargetSelector && targetSelector.trim() !== "") {
            const selectorTarget = document.querySelector(targetSelector)

            if (selectorTarget instanceof Element) {
                targetObserver = new ResizeObserver(update)
                targetObserver.observe(selectorTarget)
            }

            mutationObserver = new MutationObserver(update)
            if (document.body) {
                mutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                })
            }
        }

        return () => {
            window.removeEventListener("resize", update)
            observer.disconnect()
            targetObserver?.disconnect()
            mutationObserver?.disconnect()
        }
    }, [targetSelector, useTargetSelector, useParentBottomAsBlackY])

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const handleMirrorsMenuLogoEvent = (event: Event) => {
            const customEvent = event as CustomEvent<{
                active?: boolean
                color?: string | null
            }>
            const nextColor =
                customEvent.detail?.active && customEvent.detail?.color
                    ? customEvent.detail.color
                    : null

            setMirrorsMenuLogoOverrideColor(nextColor)
        }

        window.addEventListener(
            MIRRORS_MENU_LOGO_EVENT,
            handleMirrorsMenuLogoEvent as EventListener
        )

        return () => {
            window.removeEventListener(
                MIRRORS_MENU_LOGO_EVENT,
                handleMirrorsMenuLogoEvent as EventListener
            )
        }
    }, [])

    return (
        <div
            ref={ref}
            style={{
                width: "100%",
                height: "100%",
                minWidth: 20,
                minHeight: 20,
                position: "relative",
            }}
        >
            {isCanvas && image && (
                useOriginalStartColor && endScroll > 0 ? (
                    <img
                        src={image}
                        alt={logo?.alt || "Logo"}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        aria-label={logo?.alt || "Logo"}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            backgroundColor: endScroll <= 0 ? endColor : startColor,
                            WebkitMaskImage: `url("${image}")`,
                            WebkitMaskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            WebkitMaskSize: "contain",
                            maskImage: `url("${image}")`,
                            maskRepeat: "no-repeat",
                            maskPosition: "center",
                            maskSize: "contain",
                        }}
                    />
                )
            )}

            {!isCanvas &&
                image &&
                typeof document !== "undefined" &&
                createPortal(
                    <>
                        {useOriginalStartColor ? (
                            <motion.img
                                src={image}
                                alt={logo?.alt || "Logo"}
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: fixedLeft,
                                    width: fixedWidth,
                                    height: rect.height,
                                    objectFit: "contain",
                                    zIndex,
                                    y,
                                    pointerEvents: "none",
                                }}
                            />
                        ) : (
                            <motion.div
                                aria-label={logo?.alt || "Logo"}
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: fixedLeft,
                                    width: fixedWidth,
                                    height: rect.height,
                                    backgroundColor: effectiveStartColor,
                                    WebkitMaskImage: `url("${image}")`,
                                    WebkitMaskRepeat: "no-repeat",
                                    WebkitMaskPosition: "center",
                                    WebkitMaskSize: "contain",
                                    maskImage: `url("${image}")`,
                                    maskRepeat: "no-repeat",
                                    maskPosition: "center",
                                    maskSize: "contain",
                                    zIndex,
                                    y,
                                    pointerEvents: "none",
                                }}
                            />
                        )}
                        <motion.div
                            aria-label={logo?.alt || "Logo"}
                            style={{
                                position: "fixed",
                                top: 0,
                                left: fixedLeft,
                                width: fixedWidth,
                                height: rect.height,
                                backgroundColor: effectiveEndColor,
                                WebkitMaskImage: `url("${image}")`,
                                WebkitMaskRepeat: "no-repeat",
                                WebkitMaskPosition: "center",
                                WebkitMaskSize: "contain",
                                maskImage: `url("${image}")`,
                                maskRepeat: "no-repeat",
                                maskPosition: "center",
                                maskSize: "contain",
                                zIndex,
                                y,
                                clipPath: thresholdClipPath,
                                pointerEvents: "none",
                            }}
                        />
                    </>,
                    document.body
                )}
        </div>
    )
}

StickyLogo.defaultProps = {
    logo: { src: "", alt: "Logo" },
    endScroll: 1200,
    endY: -600,
    blackThresholdY: 874,
    blackThresholdOffset: 0,
    centerOnScroll: false,
    targetSelector: "",
    useTargetSelector: false,
    useParentBottomAsBlackY: true,
    zIndex: 999999,
    startColor: "#FFFFFF",
    endColor: "#000000",
    useOriginalStartColor: true,
    fullBleed: false,
}

addPropertyControls(StickyLogo, {
    logo: {
        type: ControlType.ResponsiveImage,
        title: "Logo",
    },

    endScroll: {
        type: ControlType.Number,
        title: "End Scroll",
        defaultValue: 1200,
        min: 0,
        max: 10000,
        step: 10,
        displayStepper: true,
    },

    endY: {
        type: ControlType.Number,
        title: "End Y",
        defaultValue: -600,
        min: -5000,
        max: 5000,
        step: 10,
        displayStepper: true,
    },

    centerOnScroll: {
        type: ControlType.Boolean,
        title: "Center",
        defaultValue: false,
    },

    blackThresholdY: {
        type: ControlType.Number,
        title: "Black Page Y",
        defaultValue: 874,
        min: -5000,
        max: 5000,
        step: 1,
        displayStepper: true,
        hidden(props) {
            return props.useParentBottomAsBlackY || props.useTargetSelector
        },
    },

    blackThresholdOffset: {
        type: ControlType.Number,
        title: "Black Offset",
        defaultValue: 0,
        min: -1000,
        max: 1000,
        step: 1,
        displayStepper: true,
    },

    useTargetSelector: {
        type: ControlType.Boolean,
        title: "Use Target",
        defaultValue: false,
    },

    targetSelector: {
        type: ControlType.String,
        title: "Target Selector",
        defaultValue: "",
        placeholder: "#products",
        hidden(props) {
            return !props.useTargetSelector
        },
    },

    useParentBottomAsBlackY: {
        type: ControlType.Boolean,
        title: "Use Parent Bottom",
        defaultValue: true,
        hidden(props) {
            return props.useTargetSelector
        },
    },

    zIndex: {
        type: ControlType.Number,
        title: "Z Index",
        defaultValue: 999999,
        min: 0,
        max: 2147483647,
        step: 1,
        displayStepper: true,
    },

    startColor: {
        type: ControlType.Color,
        title: "Start Color",
        defaultValue: "#FFFFFF",
        hidden(props) {
            return props.useOriginalStartColor
        },
    },

    endColor: {
        type: ControlType.Color,
        title: "End Color",
        defaultValue: "#000000",
    },

    useOriginalStartColor: {
        type: ControlType.Boolean,
        title: "Use SVG Start",
        defaultValue: true,
    },

    fullBleed: {
        type: ControlType.Boolean,
        title: "Full Bleed",
        defaultValue: false,
    },
})
