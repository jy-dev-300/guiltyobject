import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { LiquidGlass } from "@liquidglass/react"

// @framerSupportedLayoutWidth any
// @framerSupportedLayoutHeight any
// @framerIntrinsicWidth 220
// @framerIntrinsicHeight 64

type TextAlign = "left" | "center" | "right"
type FontWeight =
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900"

interface LiquidGlassButtonProps {
    text: string
    buttonWidth: number
    buttonHeight: number
    liquidGlassEnabled: boolean
    hoverEnabled: boolean
    hoverOpacity: number
    textColor: string
    fontFamily: string
    fontSize: number
    fontWeight: FontWeight
    letterSpacing: number
    lineHeight: number
    textAlign: TextAlign
    cornerRadius: number
    radiusPerCorner: boolean
    topLeftRadius: number
    topRightRadius: number
    bottomRightRadius: number
    bottomLeftRadius: number
    paddingX: number
    paddingY: number
    fill: string
    borderColor: string
    borderWidth: number
    blur: number
    contrast: number
    brightness: number
    saturation: number
    glassShadowIntensity: number
    displacementScale: number
    elasticity: number
    zIndex: number
    shadowX: number
    shadowY: number
    shadowBlur: number
    shadowSpread: number
    shadowColor: string
}

export function LiquidGlassButton(props: LiquidGlassButtonProps) {
    const {
        text,
        buttonWidth,
        buttonHeight,
        liquidGlassEnabled,
        hoverEnabled,
        hoverOpacity,
        textColor,
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight,
        textAlign,
        cornerRadius,
        radiusPerCorner,
        topLeftRadius,
        topRightRadius,
        bottomRightRadius,
        bottomLeftRadius,
        paddingX,
        paddingY,
        fill,
        borderColor,
        borderWidth,
        blur,
        contrast,
        brightness,
        saturation,
        glassShadowIntensity,
        displacementScale,
        elasticity,
        zIndex,
        shadowX,
        shadowY,
        shadowBlur,
        shadowSpread,
        shadowColor,
    } = props

    const [isHovered, setIsHovered] = React.useState(false)
    const shadow = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`
    const resolvedRadius = radiusPerCorner
        ? `${topLeftRadius}px ${topRightRadius}px ${bottomRightRadius}px ${bottomLeftRadius}px`
        : `${cornerRadius}px`
    const hoverFill = withAlpha(fill, hoverOpacity)
    const content = (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent:
                    textAlign === "left"
                        ? "flex-start"
                        : textAlign === "right"
                          ? "flex-end"
                          : "center",
                padding: `${paddingY}px ${paddingX}px`,
                borderRadius: resolvedRadius,
                backgroundColor: hoverEnabled && isHovered ? hoverFill : fill,
                border: `${borderWidth}px solid ${borderColor}`,
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            <span
                style={{
                    width: "100%",
                    color: textColor,
                    fontFamily,
                    fontSize,
                    fontWeight,
                    lineHeight: `${lineHeight}em`,
                    letterSpacing: `${letterSpacing}em`,
                    textAlign,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    userSelect: "none",
                }}
            >
                {text}
            </span>
        </div>
    )

    return (
        <div
            style={{
                width: buttonWidth,
                height: buttonHeight,
                minWidth: 1,
                minHeight: 1,
                borderRadius: resolvedRadius,
                boxShadow: shadow,
                overflow: "visible",
                cursor: "pointer",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {liquidGlassEnabled ? (
                <LiquidGlass
                    borderRadius={cornerRadius}
                    blur={blur}
                    contrast={contrast}
                    brightness={brightness}
                    saturation={saturation}
                    shadowIntensity={glassShadowIntensity}
                    displacementScale={displacementScale}
                    elasticity={elasticity}
                    zIndex={zIndex}
                >
                    {content}
                </LiquidGlass>
            ) : (
                content
            )}
        </div>
    )
}

LiquidGlassButton.defaultProps = {
    text: "Liquid Glass",
    buttonWidth: 220,
    buttonHeight: 64,
    liquidGlassEnabled: true,
    hoverEnabled: true,
    hoverOpacity: 0.8,
    textColor: "#FFFFFF",
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 1.2,
    textAlign: "center",
    cornerRadius: 24,
    radiusPerCorner: false,
    topLeftRadius: 24,
    topRightRadius: 24,
    bottomRightRadius: 24,
    bottomLeftRadius: 24,
    paddingX: 24,
    paddingY: 14,
    fill: "rgba(255, 255, 255, 0.10)",
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    blur: 0.45,
    contrast: 1.2,
    brightness: 1.06,
    saturation: 1.15,
    glassShadowIntensity: 0.22,
    displacementScale: 1,
    elasticity: 0.6,
    zIndex: 9999,
    shadowX: 0,
    shadowY: 10,
    shadowBlur: 28,
    shadowSpread: 0,
    shadowColor: "rgba(0, 0, 0, 0.22)",
}

addPropertyControls(LiquidGlassButton, {
    text: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "Liquid Glass",
    },
    buttonWidth: {
        type: ControlType.Number,
        title: "Width",
        defaultValue: 220,
        min: 1,
        max: 2000,
        step: 1,
        displayStepper: true,
    },
    buttonHeight: {
        type: ControlType.Number,
        title: "Height",
        defaultValue: 64,
        min: 1,
        max: 2000,
        step: 1,
        displayStepper: true,
    },
    liquidGlassEnabled: {
        type: ControlType.Boolean,
        title: "Liquid Glass",
        defaultValue: true,
    },
    hoverEnabled: {
        type: ControlType.Boolean,
        title: "Hover Fill",
        defaultValue: true,
    },
    hoverOpacity: {
        type: ControlType.Number,
        title: "Hover Opacity",
        defaultValue: 0.8,
        min: 0,
        max: 1,
        step: 0.01,
        displayStepper: true,
        hidden(props) {
            return !props.hoverEnabled
        },
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#FFFFFF",
    },
    fontFamily: {
        type: ControlType.String,
        title: "Font",
        defaultValue: "Inter",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Size",
        defaultValue: 18,
        min: 8,
        max: 120,
        step: 1,
        displayStepper: true,
    },
    fontWeight: {
        type: ControlType.Enum,
        title: "Weight",
        defaultValue: "600",
        options: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
        optionTitles: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    },
    letterSpacing: {
        type: ControlType.Number,
        title: "Tracking",
        defaultValue: 0,
        min: -0.2,
        max: 1,
        step: 0.01,
    },
    lineHeight: {
        type: ControlType.Number,
        title: "Line Height",
        defaultValue: 1.2,
        min: 0.8,
        max: 3,
        step: 0.05,
    },
    textAlign: {
        type: ControlType.Enum,
        title: "Align",
        defaultValue: "center",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
    },
    cornerRadius: {
        type: ControlType.Number,
        title: "Corners",
        defaultValue: 24,
        min: 0,
        max: 999,
        step: 1,
        displayStepper: true,
    },
    radiusPerCorner: {
        type: ControlType.Boolean,
        title: "Per Corner",
        defaultValue: false,
    },
    topLeftRadius: {
        type: ControlType.Number,
        title: "Top Left",
        defaultValue: 24,
        min: 0,
        max: 999,
        step: 1,
        displayStepper: true,
        hidden(props) {
            return !props.radiusPerCorner
        },
    },
    topRightRadius: {
        type: ControlType.Number,
        title: "Top Right",
        defaultValue: 24,
        min: 0,
        max: 999,
        step: 1,
        displayStepper: true,
        hidden(props) {
            return !props.radiusPerCorner
        },
    },
    bottomRightRadius: {
        type: ControlType.Number,
        title: "Bottom Right",
        defaultValue: 24,
        min: 0,
        max: 999,
        step: 1,
        displayStepper: true,
        hidden(props) {
            return !props.radiusPerCorner
        },
    },
    bottomLeftRadius: {
        type: ControlType.Number,
        title: "Bottom Left",
        defaultValue: 24,
        min: 0,
        max: 999,
        step: 1,
        displayStepper: true,
        hidden(props) {
            return !props.radiusPerCorner
        },
    },
    paddingX: {
        type: ControlType.Number,
        title: "Pad X",
        defaultValue: 24,
        min: 0,
        max: 200,
        step: 1,
        displayStepper: true,
    },
    paddingY: {
        type: ControlType.Number,
        title: "Pad Y",
        defaultValue: 14,
        min: 0,
        max: 200,
        step: 1,
        displayStepper: true,
    },
    fill: {
        type: ControlType.Color,
        title: "Fill",
        defaultValue: "rgba(255, 255, 255, 0.10)",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "rgba(255, 255, 255, 0.22)",
    },
    borderWidth: {
        type: ControlType.Number,
        title: "Stroke",
        defaultValue: 1,
        min: 0,
        max: 20,
        step: 1,
        displayStepper: true,
    },
    blur: {
        type: ControlType.Number,
        title: "Blur",
        defaultValue: 0.45,
        min: 0,
        max: 10,
        step: 0.05,
    },
    contrast: {
        type: ControlType.Number,
        title: "Contrast",
        defaultValue: 1.2,
        min: 0,
        max: 4,
        step: 0.05,
    },
    brightness: {
        type: ControlType.Number,
        title: "Brightness",
        defaultValue: 1.06,
        min: 0,
        max: 4,
        step: 0.05,
    },
    saturation: {
        type: ControlType.Number,
        title: "Saturation",
        defaultValue: 1.15,
        min: 0,
        max: 4,
        step: 0.05,
    },
    glassShadowIntensity: {
        type: ControlType.Number,
        title: "Glass Shadow",
        defaultValue: 0.22,
        min: 0,
        max: 1,
        step: 0.01,
    },
    displacementScale: {
        type: ControlType.Number,
        title: "Displace",
        defaultValue: 1,
        min: 0,
        max: 5,
        step: 0.05,
    },
    elasticity: {
        type: ControlType.Number,
        title: "Elasticity",
        defaultValue: 0.6,
        min: 0,
        max: 2,
        step: 0.05,
    },
    zIndex: {
        type: ControlType.Number,
        title: "Z Index",
        defaultValue: 9999,
        min: 0,
        max: 2147483647,
        step: 1,
        displayStepper: true,
    },
    shadowX: {
        type: ControlType.Number,
        title: "Shadow X",
        defaultValue: 0,
        min: -200,
        max: 200,
        step: 1,
        displayStepper: true,
    },
    shadowY: {
        type: ControlType.Number,
        title: "Shadow Y",
        defaultValue: 10,
        min: -200,
        max: 200,
        step: 1,
        displayStepper: true,
    },
    shadowBlur: {
        type: ControlType.Number,
        title: "Shadow Blur",
        defaultValue: 28,
        min: 0,
        max: 300,
        step: 1,
        displayStepper: true,
    },
    shadowSpread: {
        type: ControlType.Number,
        title: "Spread",
        defaultValue: 0,
        min: -100,
        max: 100,
        step: 1,
        displayStepper: true,
    },
    shadowColor: {
        type: ControlType.Color,
        title: "Shadow Color",
        defaultValue: "rgba(0, 0, 0, 0.22)",
    },
})

function withAlpha(color: string, alpha: number): string {
    const normalizedAlpha = Math.max(0, Math.min(1, alpha))
    const rgbaMatch = color.match(
        /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)$/i
    )

    if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch
        return `rgba(${r}, ${g}, ${b}, ${normalizedAlpha})`
    }

    const hex = color.replace("#", "").trim()
    if (/^[0-9a-f]{3,8}$/i.test(hex)) {
        const expanded =
            hex.length === 3 || hex.length === 4
                ? hex
                      .split("")
                      .map(char => char + char)
                      .join("")
                : hex
        const r = parseInt(expanded.slice(0, 2), 16)
        const g = parseInt(expanded.slice(2, 4), 16)
        const b = parseInt(expanded.slice(4, 6), 16)

        if (![r, g, b].some(Number.isNaN)) {
            return `rgba(${r}, ${g}, ${b}, ${normalizedAlpha})`
        }
    }

    return color
}
