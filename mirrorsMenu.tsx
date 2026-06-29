import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const MIRRORS_MENU_LOGO_EVENT = "mirrors-menu-logo-color-change"
const MIRRORS_MENU_ACTIVE_LOGO_COLOR = "#F3FE57"
const HOVER_ENTER_TRANSITION = "560ms cubic-bezier(0.16, 1, 0.3, 1)"
const HOVER_EXIT_TRANSITION = "340ms cubic-bezier(0.4, 0, 0.2, 1)"
const DIM_ENTER_TRANSITION = "620ms cubic-bezier(0.16, 1, 0.3, 1)"
const DIM_EXIT_TRANSITION = "300ms cubic-bezier(0.4, 0, 0.2, 1)"
const DIM_OVERLAY_OPACITY = 1

type FramerImage = {
    src?: string
    alt?: string
}

type FramerVideo = string

type HoverImageItem = {
    image?: FramerImage
    video?: FramerVideo
    scale?: number
    videoSpeed?: number
}

type FramerLinkValue =
    | string
    | {
          href?: string
          url?: string
          path?: string
      }

type MirrorItem = {
    title?: string
    link?: FramerLinkValue
    coverImage?: FramerImage
    hoverImages?: HoverImageItem[]
}

type MirrorsMenuProps = {
    mirrors: MirrorItem[]
    whiteMirrorVideoBrightness: number
    whiteMirrorVideoContrast: number
    backgroundColor: string
    heading: string
    headingFont: string
    headingSize: number
    headingColor: string
    headingBold: boolean
    headingItalic: boolean
    headingTopSpace: number
    mirrorSize: number
    gap: number
    paddingX: number
    paddingTop: number
    paddingBottom: number
    hoverScale: number
    hoverOpacity: number
    hoverBgColor: string
    sceneDarkness: number
    sceneEffectEnabled: boolean
    mirrorDarkness: number
    graininess: number
    coverImageScale: number
    hoverEffectEnabled: boolean
    hoverEnabled?: boolean
}

function MirrorCard(props: {
    mirror: MirrorItem
    mirrorIndex: number
    whiteMirrorVideoBrightness: number
    whiteMirrorVideoContrast: number
    width: string
    height: number
    isDimmed: boolean
    hoverOpacity: number
    sceneDarkness: number
    sceneEffectEnabled: boolean
    mirrorDarkness: number
    onHoverStateChange: (activeMirrorIndex: number | null) => void
    hoverScale: number
    coverImageScale: number
    hoverEffectEnabled: boolean
}) {
    const {
        mirror,
        mirrorIndex,
        whiteMirrorVideoBrightness,
        whiteMirrorVideoContrast,
        width,
        height,
        isDimmed,
        hoverOpacity,
        sceneDarkness,
        sceneEffectEnabled,
        mirrorDarkness,
        onHoverStateChange,
        hoverScale,
        coverImageScale,
        hoverEffectEnabled,
    } = props
    const [isHovered, setIsHovered] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)
    const videoRefs = React.useRef<Array<HTMLVideoElement | null>>([])
    const savedVideoTimesRef = React.useRef<Record<number, number>>({})
    const normalizedHref = React.useMemo(() => {
        const rawValue = mirror.link
        const extractedLink =
            typeof rawValue === "string"
                ? rawValue
                : rawValue?.href || rawValue?.url || rawValue?.path || ""
        const rawLink = extractedLink.trim() || "/shop"
        if (rawLink.startsWith("/")) return rawLink
        if (rawLink.startsWith("#")) return rawLink
        if (rawLink.startsWith("?")) return rawLink
        if (rawLink.startsWith("//")) return rawLink
        if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(rawLink)) return rawLink

        return rawLink
    }, [mirror.link])

    const hoverSlides =
        mirror.hoverImages
            ?.map((item) => ({
                media: item.video?.trim()
                    ? {
                          kind: "video" as const,
                          src: item.video.trim(),
                          alt: mirror.title || "Mirror video",
                          playbackRate: item.videoSpeed ?? 1,
                      }
                    : item.image?.src
                      ? {
                            kind: "image" as const,
                            src: item.image.src,
                            alt:
                                item.image.alt ||
                                mirror.title ||
                                "Mirror image",
                            playbackRate: 1,
                        }
                      : null,
                scale: item.scale ?? 1,
            }))
            .filter(
                (
                    item
                ): item is {
                    media: {
                        kind: "image" | "video"
                        src: string
                        alt: string
                        playbackRate: number
                    }
                    scale: number
                } => Boolean(item.media?.src)
            ) ?? []

    const allSlides = [
        mirror.coverImage?.src
            ? {
                  media: {
                      kind: "image" as const,
                      src: mirror.coverImage.src,
                      alt:
                          mirror.coverImage.alt ||
                          mirror.title ||
                          "Mirror image",
                      playbackRate: 1,
                  },
                  scale: coverImageScale,
              }
            : null,
        ...hoverSlides,
    ].filter(
        (
            item
        ): item is {
            media: {
                kind: "image" | "video"
                src: string
                alt: string
                playbackRate: number
            }
            scale: number
        } => Boolean(item?.media?.src)
    )

    const activeSlide = allSlides[activeIndex]
    const hoverTransition = isHovered
        ? HOVER_ENTER_TRANSITION
        : HOVER_EXIT_TRANSITION
    const dimTransition = isDimmed ? DIM_ENTER_TRANSITION : DIM_EXIT_TRANSITION
    const effectiveMirrorDarkness = sceneEffectEnabled ? mirrorDarkness : 0
    const dimmedBrightness = Math.max(0, 1 - effectiveMirrorDarkness)
    const dimmedSaturation = Math.max(0, 1 - effectiveMirrorDarkness)
    const dimmedContrast = 1 + effectiveMirrorDarkness * 0.08
    const activeVideoBrightness =
        mirrorIndex === 1 ? whiteMirrorVideoBrightness : 1
    const activeVideoContrast = mirrorIndex === 1 ? whiteMirrorVideoContrast : 1

    const pauseActiveVideo = React.useCallback(() => {
        if (activeSlide?.media.kind !== "video") return

        const activeVideo = videoRefs.current[activeIndex]
        if (!activeVideo) return

        savedVideoTimesRef.current[activeIndex] = activeVideo.currentTime
        activeVideo.pause()
    }, [activeIndex, activeSlide])

    const resetAllVideos = React.useCallback(() => {
        savedVideoTimesRef.current = {}

        videoRefs.current.forEach((videoElement) => {
            if (!videoElement) return

            videoElement.pause()

            try {
                videoElement.currentTime = 0
            } catch {}
        })
    }, [])

    const playActiveVideo = React.useCallback(() => {
        if (activeSlide?.media.kind !== "video") return

        const activeVideo = videoRefs.current[activeIndex]
        if (!activeVideo) return

        try {
            activeVideo.playbackRate = activeSlide.media.playbackRate
            const savedTime = savedVideoTimesRef.current[activeIndex]

            if (typeof savedTime === "number" && Number.isFinite(savedTime)) {
                activeVideo.currentTime = savedTime
            }

            void activeVideo.play().catch(() => {})
        } catch {}
    }, [activeIndex, activeSlide])

    React.useEffect(() => {
        if (!hoverEffectEnabled) {
            setActiveIndex(0)
            return
        }

        if (!isHovered) {
            setActiveIndex(0)
            return
        }

        if (activeIndex === 0 && allSlides.length > 1) {
            setActiveIndex(1)
        }
    }, [
        activeIndex,
        activeSlide,
        allSlides.length,
        hoverEffectEnabled,
        isHovered,
    ])

    React.useEffect(() => {
        if (!isHovered) return
        if (activeSlide?.media.kind !== "video") return

        playActiveVideo()
    }, [activeSlide, isHovered, playActiveVideo])

    const shouldActivateHoverScene =
        sceneEffectEnabled &&
        isHovered &&
        hoverEffectEnabled &&
        activeSlide?.media.kind === "video"

    React.useEffect(() => {
        onHoverStateChange(shouldActivateHoverScene ? mirrorIndex : null)
    }, [mirrorIndex, onHoverStateChange, shouldActivateHoverScene])

    React.useEffect(() => {
        if (typeof window === "undefined") return

        window.dispatchEvent(
            new CustomEvent(MIRRORS_MENU_LOGO_EVENT, {
                detail: {
                    active: shouldActivateHoverScene,
                    color: shouldActivateHoverScene
                        ? MIRRORS_MENU_ACTIVE_LOGO_COLOR
                        : null,
                },
            })
        )

        return () => {
            window.dispatchEvent(
                new CustomEvent(MIRRORS_MENU_LOGO_EVENT, {
                    detail: {
                        active: false,
                        color: null,
                    },
                })
            )
        }
    }, [shouldActivateHoverScene])

    const mediaContent =
        allSlides.length > 0 ? (
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    background: "transparent",
                    overflow:
                        activeSlide?.media.kind === "video"
                            ? "visible"
                            : "hidden",
                    pointerEvents: "none",
                }}
            >
                {allSlides.map((slide, index) => (
                    <div
                        key={`${slide.media.src}-${index}`}
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow:
                                slide.media.kind === "video"
                                    ? "visible"
                                    : "hidden",
                            transition: "opacity 240ms ease",
                            transform: "translateX(0%)",
                            opacity: index === activeIndex ? 1 : 0,
                            willChange: "opacity",
                            clipPath:
                                slide.media.kind === "video"
                                    ? "none"
                                    : "inset(0)",
                            pointerEvents: "none",
                            filter: "none",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                background: "transparent",
                                overflow:
                                    slide.media.kind === "video"
                                        ? "visible"
                                        : "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                clipPath:
                                    slide.media.kind === "video"
                                        ? "none"
                                        : "inset(0)",
                            }}
                        >
                            {slide.media.kind === "video" ? (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "114%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <video
                                        src={slide.media.src}
                                        muted
                                        loop={allSlides.length <= 1}
                                        playsInline
                                        ref={(element) => {
                                            videoRefs.current[index] = element
                                        }}
                                        onLoadedMetadata={(event) => {
                                            event.currentTarget.playbackRate =
                                                slide.media.playbackRate
                                        }}
                                        onCanPlay={(event) => {
                                            event.currentTarget.playbackRate =
                                                slide.media.playbackRate
                                        }}
                                        onEnded={(event) => {
                                            if (
                                                hoverEffectEnabled &&
                                                isHovered &&
                                                index === activeIndex
                                            ) {
                                                savedVideoTimesRef.current[
                                                    index
                                                ] = 0
                                                event.currentTarget.currentTime = 0
                                                void event.currentTarget
                                                    .play()
                                                    .catch(() => {})
                                            }
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            objectPosition: "center",
                                            display: "block",
                                            pointerEvents: "none",
                                            userSelect: "none",
                                            transform: `scale(${slide.scale})`,
                                            transformOrigin: "center center",
                                            transition: `transform ${hoverTransition}`,
                                            filter: `brightness(${activeVideoBrightness}) contrast(${activeVideoContrast})`,
                                            opacity: 1,
                                        }}
                                    />
                                </div>
                            ) : (
                                <img
                                    src={slide.media.src}
                                    alt={slide.media.alt}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        objectPosition: "center",
                                        display: "block",
                                        pointerEvents: "none",
                                        userSelect: "none",
                                        transform: `scale(${slide.scale})`,
                                        transformOrigin: "center center",
                                        transition: `transform ${hoverTransition}`,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div
                style={{
                    color: "#8A8A8A",
                    fontSize: 14,
                    fontFamily:
                        '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                Add image
            </div>
        )

    const sharedCardStyle: React.CSSProperties = {
        width,
        height,
        flex: `0 0 ${width}`,
        background: "transparent",
        overflow: activeSlide?.media.kind === "video" ? "visible" : "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transform: isHovered ? `scale(${hoverScale})` : "scale(1)",
        transformOrigin: "center center",
        transition: `transform ${hoverTransition}, opacity ${dimTransition}, filter ${dimTransition}`,
        opacity: isDimmed && sceneEffectEnabled ? hoverOpacity : 1,
        filter:
            isDimmed && sceneEffectEnabled
                ? `brightness(${dimmedBrightness}) saturate(${dimmedSaturation}) contrast(${dimmedContrast})`
                : "none",
        willChange: "transform, opacity, filter",
        zIndex: isHovered ? 2 : 1,
        textDecoration: "none",
        pointerEvents: "auto",
    }

    const handleHoverStart = () => {
        setIsHovered(true)
    }

    const handleHoverEnd = () => {
        pauseActiveVideo()
        resetAllVideos()
        setActiveIndex(0)
        setIsHovered(false)
    }

    const navigateToHref = React.useCallback(() => {
        if (typeof window === "undefined") return

        if (normalizedHref.startsWith("/")) {
            let isInIframe = false
            try {
                isInIframe = window.self !== window.top
            } catch {
                isInIframe = true
            }

            const looksLikeFramerPreview =
                isInIframe || window.location.pathname.includes("/preview")

            if (looksLikeFramerPreview) {
                const currentPathname = window.location.pathname
                const previewSegment = "/preview"
                const previewIndex = currentPathname.indexOf(previewSegment)

                if (previewIndex !== -1) {
                    // Preview-safe fallback:
                    // In Framer preview/play, root-relative hrefs can resolve against sandbox routing.
                    // Remap internal links to the current preview base path.
                    const previewBasePath = currentPathname.slice(
                        0,
                        previewIndex + previewSegment.length
                    )
                    const rewrittenTarget = `${window.location.origin}${previewBasePath}${normalizedHref}`
                    window.location.href = rewrittenTarget
                    return
                }
            }

            window.location.href = normalizedHref
            return
        }

        window.location.href = normalizedHref
    }, [normalizedHref])

    const handleCardClick = React.useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (typeof window === "undefined") return
            if (event.defaultPrevented) return
            navigateToHref()
        },
        [navigateToHref]
    )

    return (
        <div
            role="link"
            tabIndex={0}
            aria-label={mirror.title || "Open mirror"}
            onClick={handleCardClick}
            onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return
                event.preventDefault()
                navigateToHref()
            }}
            onMouseEnter={handleHoverStart}
            onMouseLeave={handleHoverEnd}
            onPointerEnter={handleHoverStart}
            onPointerLeave={handleHoverEnd}
            onFocus={handleHoverStart}
            onBlur={handleHoverEnd}
            style={sharedCardStyle}
        >
            {mediaContent}
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 320
 */
export default function MirrorsMenu(props: MirrorsMenuProps) {
    const {
        mirrors,
        whiteMirrorVideoBrightness,
        whiteMirrorVideoContrast,
        backgroundColor,
        heading,
        headingFont,
        headingSize,
        headingColor,
        headingBold,
        headingItalic,
        headingTopSpace,
        mirrorSize,
        gap,
        paddingX,
        paddingTop,
        paddingBottom,
        hoverScale,
        hoverOpacity,
        hoverBgColor,
        sceneDarkness,
        sceneEffectEnabled,
        mirrorDarkness,
        graininess,
        coverImageScale,
        hoverEffectEnabled,
        hoverEnabled,
    } = props
    const effectiveHoverEffectEnabled =
        typeof hoverEffectEnabled === "boolean"
            ? hoverEffectEnabled
            : typeof hoverEnabled === "boolean"
              ? hoverEnabled
              : true
    const [activeMirrorIndex, setActiveMirrorIndex] = React.useState<
        number | null
    >(null)

    const visibleCount = Math.min(Math.max(mirrors.length, 1), 5)
    const edgePadding = `${paddingX}vw`
    const cardWidth = `calc((100% / ${visibleCount}) * ${gap})`
    const effectiveBackgroundColor = backgroundColor
    const isAnyMirrorHovered = sceneEffectEnabled && activeMirrorIndex !== null
    const grainTexture = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`
    const overlayTransition = isAnyMirrorHovered
        ? DIM_ENTER_TRANSITION
        : DIM_EXIT_TRANSITION
    const overlayOpacity = Math.max(
        0,
        Math.min(1, DIM_OVERLAY_OPACITY * sceneDarkness)
    )

    return (
        <section
            id="mirrors-menu"
            data-section="mirrors-menu"
            style={{
                width: "100%",
                height: "100%",
                background: effectiveBackgroundColor,
                position: "relative",
                paddingInline: edgePadding,
                boxSizing: "border-box",
                overflowX: "hidden",
                overflowY: "hidden",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: hoverBgColor,
                    opacity: isAnyMirrorHovered ? overlayOpacity : 0,
                    transition: `opacity ${overlayTransition}`,
                    pointerEvents: "none",
                    willChange: "opacity",
                    zIndex: 1,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: grainTexture,
                    backgroundRepeat: "repeat",
                    backgroundSize: "160px 160px",
                    mixBlendMode: "soft-light",
                    opacity: isAnyMirrorHovered
                        ? graininess * overlayOpacity
                        : 0,
                    transition: `opacity ${overlayTransition}`,
                    pointerEvents: "none",
                    willChange: "opacity",
                    zIndex: 1,
                }}
            />
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    position: "relative",
                    zIndex: 2,
                }}
            >
                <div
                    style={{
                        width: "100%",
                        textAlign: "center",
                        fontSize: headingSize,
                        lineHeight: 1.2,
                        color: headingColor,
                        position: "absolute",
                        top: `${headingTopSpace}px`,
                        left: 0,
                        fontFamily: headingFont,
                        fontWeight: headingBold ? 700 : 400,
                        fontStyle: headingItalic ? "italic" : "normal",
                        zIndex: 4,
                        pointerEvents: "none",
                    }}
                >
                    {heading}
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: `${paddingTop}px`,
                        right: 0,
                        bottom: `${paddingBottom}px`,
                        left: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0,
                        width: mirrors.length > 5 ? "max-content" : "100%",
                        minWidth: "100%",
                        margin: "0 auto",
                    }}
                >
                    {mirrors.map((mirror, index) => (
                        <MirrorCard
                            key={`${mirror.title || "mirror"}-${index}`}
                            mirror={mirror}
                            mirrorIndex={index}
                            whiteMirrorVideoBrightness={
                                whiteMirrorVideoBrightness
                            }
                            whiteMirrorVideoContrast={
                                whiteMirrorVideoContrast
                            }
                            width={cardWidth}
                            height={mirrorSize}
                            isDimmed={
                                sceneEffectEnabled &&
                                activeMirrorIndex !== null &&
                                activeMirrorIndex !== index
                            }
                            hoverOpacity={hoverOpacity}
                            sceneDarkness={sceneDarkness}
                            sceneEffectEnabled={sceneEffectEnabled}
                            mirrorDarkness={mirrorDarkness}
                            onHoverStateChange={setActiveMirrorIndex}
                            hoverScale={hoverScale}
                            coverImageScale={coverImageScale}
                            hoverEffectEnabled={effectiveHoverEffectEnabled}
                        />
                    ))}
                </div>
                <div
                    id="mirrors-menu-bottom-anchor"
                    data-section="mirrors-menu-bottom-anchor"
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 1,
                        pointerEvents: "none",
                        opacity: 0,
                    }}
                />
            </div>
        </section>
    )
}

MirrorsMenu.defaultProps = {
    mirrors: [
        {
            title: "Mirror One",
            link: "/shop",
            coverImage: undefined,
            hoverImages: [],
        },
        {
            title: "Mirror Two",
            link: "/shop",
            coverImage: undefined,
            hoverImages: [],
        },
    ],
    whiteMirrorVideoBrightness: 1,
    whiteMirrorVideoContrast: 1,
    backgroundColor: "#F9F8FD",
    heading: "Mirrors",
    headingFont: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    headingSize: 18,
    headingColor: "#111111",
    headingBold: false,
    headingItalic: false,
    headingTopSpace: 28,
    mirrorSize: 260,
    gap: 1.08,
    paddingX: 4,
    paddingTop: 0,
    paddingBottom: 0,
    hoverScale: 1,
    hoverOpacity: 0.4,
    hoverBgColor: "#000000",
    sceneDarkness: 1,
    sceneEffectEnabled: true,
    mirrorDarkness: 1,
    graininess: 0.18,
    coverImageScale: 0.82,
    hoverEffectEnabled: true,
}

addPropertyControls(MirrorsMenu, {
    whiteMirrorVideoBrightness: {
        type: ControlType.Number,
        title: "White Bright",
        min: 0.25,
        max: 3,
        step: 0.01,
        defaultValue: 1,
    },
    whiteMirrorVideoContrast: {
        type: ControlType.Number,
        title: "White Contrast",
        min: 0.25,
        max: 3,
        step: 0.01,
        defaultValue: 1,
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#F9F8FD",
    },
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Mirrors",
    },
    headingFont: {
        type: ControlType.String,
        title: "Font",
        defaultValue: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    headingSize: {
        type: ControlType.Number,
        title: "Font Size",
        min: 10,
        max: 72,
        step: 1,
        unit: "px",
    },
    headingColor: {
        type: ControlType.Color,
        title: "Font Color",
    },
    headingBold: {
        type: ControlType.Boolean,
        title: "Bold",
        defaultValue: false,
    },
    headingItalic: {
        type: ControlType.Boolean,
        title: "Italic",
        defaultValue: false,
    },
    headingTopSpace: {
        type: ControlType.Number,
        title: "Top Space",
        min: 0,
        max: 120,
        step: 1,
        unit: "px",
    },
    mirrors: {
        type: ControlType.Array,
        title: "Mirrors",
        control: {
            type: ControlType.Object,
            controls: {
                title: {
                    type: ControlType.String,
                    title: "Title",
                    defaultValue: "Mirror",
                },
                link: {
                    type: ControlType.Link,
                    title: "Link",
                    defaultValue: "/shop",
                },
                coverImage: {
                    type: ControlType.ResponsiveImage,
                    title: "Cover",
                },
                hoverImages: {
                    type: ControlType.Array,
                    title: "Hover",
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
                                allowedFileTypes: ["mp4", "webm", "mov", "ogg"],
                            },
                            scale: {
                                type: ControlType.Number,
                                title: "Scale",
                                min: 0.25,
                                max: 2,
                                step: 0.01,
                                defaultValue: 0.82,
                            },
                            videoSpeed: {
                                type: ControlType.Number,
                                title: "Video Speed",
                                min: 0.05,
                                max: 3,
                                step: 0.01,
                                defaultValue: 1,
                            },
                        },
                    },
                    maxCount: 10,
                },
            },
        },
        defaultValue: MirrorsMenu.defaultProps.mirrors,
        maxCount: 12,
    },
    mirrorSize: {
        type: ControlType.Number,
        title: "Mirror Size",
        min: 80,
        max: 600,
        step: 1,
        unit: "px",
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        min: 0.5,
        max: 1.5,
        step: 0.01,
        defaultValue: 1.08,
    },
    paddingX: {
        type: ControlType.Number,
        title: "Pad X",
        min: 0,
        max: 8,
        step: 0.1,
        unit: "vw",
    },
    paddingTop: {
        type: ControlType.Number,
        title: "Pad Top",
        min: 0,
        max: 400,
        step: 1,
        unit: "px",
    },
    paddingBottom: {
        type: ControlType.Number,
        title: "Pad Bottom",
        min: 0,
        max: 400,
        step: 1,
        unit: "px",
    },
    hoverScale: {
        type: ControlType.Number,
        title: "Hover Scale",
        min: 1,
        max: 2,
        step: 0.01,
    },
    hoverOpacity: {
        type: ControlType.Number,
        title: "Hover Opacity",
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 0.4,
        hidden(props) {
            return !props.sceneEffectEnabled
        },
    },
    hoverBgColor: {
        type: ControlType.Color,
        title: "Hover BG",
        defaultValue: "#000000",
        hidden(props) {
            return !props.sceneEffectEnabled
        },
    },
    sceneDarkness: {
        type: ControlType.Number,
        title: "Scene Dark",
        min: 0,
        max: 1.5,
        step: 0.01,
        defaultValue: 1,
        hidden(props) {
            return !props.sceneEffectEnabled
        },
    },
    sceneEffectEnabled: {
        type: ControlType.Boolean,
        title: "Dim Mode",
        defaultValue: true,
    },
    mirrorDarkness: {
        type: ControlType.Number,
        title: "Mirror Dark",
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 1,
        hidden(props) {
            return !props.sceneEffectEnabled
        },
    },
    graininess: {
        type: ControlType.Number,
        title: "Grain",
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 0.18,
        hidden(props) {
            return !props.sceneEffectEnabled
        },
    },
    coverImageScale: {
        type: ControlType.Number,
        title: "Cover Image Scale",
        min: 0.25,
        max: 2,
        step: 0.01,
    },
    hoverEffectEnabled: {
        type: ControlType.Boolean,
        title: "Hover Effect",
        defaultValue: true,
    },
})
