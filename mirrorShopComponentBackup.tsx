import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import ReactSlickModule from "react-slick"

type MirrorShopProps = {
    width: number
    height: number
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
    sizes: string[]
    carouselItems: CarouselItemControl[]
    media: string[]
    images: string[]
    videos: string[]
    sizeImages: string[]
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

type CarouselItemControl = {
    src: string
    fullWidth: boolean
    cropX: number
    cropY: number
}

type CarouselMediaItem = {
    src: string
    kind: "image" | "video"
    fullWidth: boolean
    cropX: number
    cropY: number
}

const defaultImages: string[] = []
const defaultVideos: string[] = []
const defaultMedia: string[] = []
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

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1259
 * @framerIntrinsicHeight 1700
 */
export default function MirrorShopComponent(props: Partial<MirrorShopProps>) {
    const carouselSlideDurationMs = 920
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
    const sizes =
        props.sizes && props.sizes.length > 0 ? props.sizes : defaultSizes
    const carouselItems = props.carouselItems ?? []
    const media = props.media ?? []
    const images = props.images ?? []
    const videos = props.videos ?? []
    const sizeImages = props.sizeImages ?? []
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

    const [selectedColorIndex, setSelectedColorIndex] = React.useState(0)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
    const [openPanel, setOpenPanel] = React.useState<
        "description" | "size" | "shipping" | null
    >(null)
    const [isNarrowLayout, setIsNarrowLayout] = React.useState(false)
    const mediaColumnRef = React.useRef<HTMLDivElement | null>(null)
    const carouselMedia = React.useMemo<CarouselMediaItem[]>(() => {
        if (carouselItems.length > 0) {
            return carouselItems
                .filter((item) => Boolean(item?.src))
                .map((item) => ({
                    src: item.src,
                    kind: getMediaKind(item.src),
                    fullWidth: item.fullWidth ?? false,
                    cropX: item.cropX ?? 50,
                    cropY: item.cropY ?? 50,
                }))
        }

        if (media.length > 0) {
            return media.map((src, index) => ({
                src,
                kind: getMediaKind(src),
                fullWidth:
                    imageColumnModes[index] === "full" ||
                    (imageFullColumn[index] ?? false),
                cropX: imageCropX[index] ?? 50,
                cropY: imageCropY[index] ?? 50,
            }))
        }

        const mixedMedia: CarouselMediaItem[] = []
        const maxLength = Math.max(images.length, videos.length)

        for (let index = 0; index < maxLength; index += 1) {
            const image = images[index]
            const video = videos[index]

            if (image) {
                mixedMedia.push({
                    src: image,
                    kind: "image",
                    fullWidth:
                        imageColumnModes[index] === "full" ||
                        (imageFullColumn[index] ?? false),
                    cropX: imageCropX[index] ?? 50,
                    cropY: imageCropY[index] ?? 50,
                })
            }

            if (video) {
                mixedMedia.push({
                    src: video,
                    kind: "video",
                    fullWidth:
                        imageColumnModes[index] === "full" ||
                        (imageFullColumn[index] ?? false),
                    cropX: imageCropX[index] ?? 50,
                    cropY: imageCropY[index] ?? 50,
                })
            }
        }

        return mixedMedia
    }, [
        carouselItems,
        imageCropX,
        imageCropY,
        imageColumnModes,
        imageFullColumn,
        images,
        media,
        videos,
    ])
    const imageCount = carouselMedia.length
    const sliderRef = React.useRef<any>(null)
    const sliderSettings = React.useMemo(
        () => ({
            dots: false,
            infinite: imageCount > 1,
            speed: Math.min(carouselSlideDurationMs, 500),
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            adaptiveHeight: true,
            afterChange: (index: number) => {
                React.startTransition(() => {
                    setCurrentImageIndex(index)
                })
            },
        }),
        [carouselSlideDurationMs, imageCount]
    )

    React.useEffect(() => {
        if (selectedColorIndex > sizeImages.length - 1) {
            React.startTransition(() => {
                setSelectedColorIndex(0)
            })
        }
    }, [sizeImages.length, selectedColorIndex])

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
            fontSize: bodyFontSize,
            lineHeight: `${Math.round(bodyFontSize * 1.6)}px`,
        }),
        [bodyFontSize]
    )

    const responsiveTitleStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...titleStyle,
            margin: `14px 0 ${titleToPriceGap}px`,
            fontSize: titleFontSize,
            lineHeight: `${titleLineHeight}px`,
            color: titleColor,
        }),
        [titleColor, titleFontSize, titleLineHeight, titleToPriceGap]
    )

    const responsivePriceStyle = React.useMemo<React.CSSProperties>(
        () => ({
            ...priceStyle,
            fontSize: priceFontSize,
            lineHeight: `${priceFontSize}px`,
        }),
        [priceFontSize]
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
        <div style={responsiveRootStyle}>
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
                                        fontFamily: "Inter, sans-serif",
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
                                        const topMargin =
                                            imageTopMargins[index] ?? 0
                                        const bottomMargin =
                                            imageBottomMargins[index] ?? 72
                                        const leftMargin =
                                            imageLeftMargins[index] ?? 0
                                        const rightMargin =
                                            imageRightMargins[index] ?? 0
                                        const imageFit =
                                            imageFits[index] ?? "contain"
                                        const fillsColumn =
                                            mediaItem.fullWidth ?? false
                                        const cropPosition = `${mediaItem.cropX}% ${mediaItem.cropY}%`
                                        const mediaWidth = fillsColumn
                                            ? "100%"
                                            : `${imageScales[index] ?? 100}%`

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
                                                                controls
                                                                playsInline
                                                                preload="metadata"
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
                                                                }}
                                                            />
                                                        ) : (
                                                            <img
                                                                src={
                                                                    mediaItem.src
                                                                }
                                                                alt={`${title} ${index + 1}`}
                                                                draggable={
                                                                    false
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
                                    {sizeImages.map((sizeImage, index) => {
                                        const colorName =
                                            sizes[index]?.trim() ||
                                            `Color ${index + 1}`
                                        const active =
                                            index === selectedColorIndex
                                        return (
                                            <button
                                                key={`${sizeImage}-${index}`}
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
                                                <img
                                                    src={sizeImage}
                                                    alt={colorName}
                                                    style={
                                                        responsiveSizeImageStyle
                                                    }
                                                />
                                            </button>
                                        )
                                    })}
                                </div>

                                <button style={responsiveCtaStyle}>
                                    <span style={responsiveButtonTextStyle}>
                                        <span>{buttonLabel}</span>
                                    </span>
                                </button>

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
                                                            lineHeight:
                                                                responsiveBodyTextStyle.lineHeight,
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
    width: 1259,
    height: 1700,
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
    carouselItems: defaultCarouselItems,
    media: defaultMedia,
    images: defaultImages,
    videos: defaultVideos,
    rightColumnPaddingX: 40,
    rightColumnTopMargin: 0,
    rightColumnGap: 14,
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
    sizes: {
        type: ControlType.Array,
        title: "Color Options",
        control: { type: ControlType.String },
        defaultValue: defaultSizes,
    },
    carouselItems: {
        type: ControlType.Array,
        title: "Carousel Items",
        control: {
            type: ControlType.Object,
            controls: {
                src: {
                    type: ControlType.File,
                    title: "Media",
                    allowedFileTypes: [
                        "jpg",
                        "jpeg",
                        "png",
                        "webp",
                        "gif",
                        "avif",
                        "mp4",
                        "webm",
                        "ogg",
                        "mov",
                        "m4v",
                    ],
                },
                fullWidth: {
                    type: ControlType.Boolean,
                    title: "Make Full Width",
                    defaultValue: false,
                },
                cropX: {
                    type: ControlType.Number,
                    title: "Crop X",
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: "%",
                    defaultValue: 50,
                },
                cropY: {
                    type: ControlType.Number,
                    title: "Crop Y",
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: "%",
                    defaultValue: 50,
                },
            },
        },
        defaultValue: [],
    },
    images: {
        type: ControlType.Array,
        title: "Legacy Images",
        control: { type: ControlType.Image },
        defaultValue: [],
    },
    media: {
        type: ControlType.Array,
        title: "Carousel Media",
        control: {
            type: ControlType.File,
            allowedFileTypes: [
                "jpg",
                "jpeg",
                "png",
                "webp",
                "gif",
                "avif",
                "mp4",
                "webm",
                "ogg",
                "mov",
                "m4v",
            ],
        },
        defaultValue: [],
    },
    videos: {
        type: ControlType.Array,
        title: "Legacy Videos",
        control: {
            type: ControlType.File,
            allowedFileTypes: ["mp4", "webm", "ogg", "mov"],
        },
        defaultValue: [],
    },
    imageLeftMargins: {
        type: ControlType.Array,
        title: "Image Left",
        control: {
            type: ControlType.Number,
            min: 0,
            max: 240,
            step: 1,
            unit: "px",
        },
        defaultValue: [],
    },
    imageRightMargins: {
        type: ControlType.Array,
        title: "Image Right",
        control: {
            type: ControlType.Number,
            min: 0,
            max: 240,
            step: 1,
            unit: "px",
        },
        defaultValue: [],
    },
    imageTopMargins: {
        type: ControlType.Array,
        title: "Image Top",
        control: {
            type: ControlType.Number,
            min: 0,
            max: 240,
            step: 1,
            unit: "px",
        },
        defaultValue: [],
    },
    imageBottomMargins: {
        type: ControlType.Array,
        title: "Image Bottom",
        control: {
            type: ControlType.Number,
            min: 0,
            max: 240,
            step: 1,
            unit: "px",
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
    sizeImages: {
        type: ControlType.Array,
        title: "Color Images",
        control: { type: ControlType.Image },
        defaultValue: [],
    },
    imageScales: {
        type: ControlType.Array,
        title: "Image Sizes",
        control: {
            type: ControlType.Number,
            min: 20,
            max: 160,
            step: 1,
            unit: "%",
        },
        defaultValue: [],
    },
    imageFits: {
        type: ControlType.Array,
        title: "Image Fit",
        control: {
            type: ControlType.Enum,
            options: ["cover", "contain"],
            optionTitles: ["Cover", "Contain"],
            defaultValue: "contain",
        },
        defaultValue: [],
    },
    imageCropX: {
        type: ControlType.Array,
        title: "Image Crop X",
        control: {
            type: ControlType.Number,
            min: 0,
            max: 100,
            step: 1,
            unit: "%",
        },
        defaultValue: [],
    },
    imageCropY: {
        type: ControlType.Array,
        title: "Image Crop Y",
        control: {
            type: ControlType.Number,
            min: 0,
            max: 100,
            step: 1,
            unit: "%",
        },
        defaultValue: [],
    },
    imageColumnModes: {
        type: ControlType.Array,
        title: "Image Width",
        control: {
            type: ControlType.Enum,
            options: ["auto", "full"],
            optionTitles: ["Auto", "Full"],
            defaultValue: "auto",
        },
        defaultValue: [],
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
