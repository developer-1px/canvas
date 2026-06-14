import {
  useLayoutEffect,
  useState,
} from 'react'
import {
  createFigmaCloneDomOverlayRectStyle,
  type FigmaCloneDomScaledOverlayRect,
} from './FigmaCloneDomOverlayGeometry'

type BoxModelRect = FigmaCloneDomScaledOverlayRect

type BoxModelSides = {
  bottom: number
  left: number
  right: number
  top: number
}

type BoxModelMetrics = {
  border: BoxModelSides
  margin: BoxModelSides
  padding: BoxModelSides
}

export function FigmaCloneDomBoxModelOverlay({
  rect,
  target,
}: {
  rect: BoxModelRect
  target: HTMLElement
}) {
  const [metrics, setMetrics] = useState<BoxModelMetrics | null>(null)

  useLayoutEffect(() => {
    setMetrics(measureFigmaCloneBoxModel(target))
  }, [
    rect.h,
    rect.w,
    rect.x,
    rect.y,
    target,
  ])

  if (!metrics) {
    return null
  }

  const contentRect = getFigmaCloneContentRect(rect, metrics)
  const paddingRects = getFigmaClonePaddingRects(rect, metrics)
  const marginRects = getFigmaCloneMarginRects(rect, metrics)

  return (
    <>
      {marginRects.map((marginRect) => (
        <FigmaCloneBoxModelBand
          key={`margin:${marginRect.side}`}
          className="figma-boxmodel-margin"
          rect={marginRect}
        />
      ))}
      <div
        className="figma-boxmodel-border"
        style={createFigmaCloneDomOverlayRectStyle(rect)}
      />
      {paddingRects.map((paddingRect) => (
        <FigmaCloneBoxModelBand
          key={`padding:${paddingRect.side}`}
          className="figma-boxmodel-padding"
          rect={paddingRect}
        />
      ))}
      <div
        className="figma-boxmodel-content"
        style={createFigmaCloneDomOverlayRectStyle(contentRect)}
      />
      {hasAnySide(metrics.margin) ? (
        <span
          className="figma-boxmodel-value figma-boxmodel-value--margin"
          style={{
            left: rect.x - metrics.margin.left,
            top: rect.y - metrics.margin.top - 4,
          }}
        >
          Mar {formatFigmaCloneSides(metrics.margin)}
        </span>
      ) : null}
      {hasAnySide(metrics.padding) ? (
        <span
          className="figma-boxmodel-value figma-boxmodel-value--padding"
          style={{
            left: rect.x + metrics.border.left + metrics.padding.left,
            top: rect.y + metrics.border.top + metrics.padding.top,
          }}
        >
          Pad {formatFigmaCloneSides(metrics.padding)}
        </span>
      ) : null}
    </>
  )
}

function FigmaCloneBoxModelBand({
  className,
  rect,
}: {
  className: string
  rect: BoxModelRect & { side: keyof BoxModelSides }
}) {
  if (rect.h <= 0.5 || rect.w <= 0.5) {
    return null
  }

  return (
    <div
      className={className}
      style={createFigmaCloneDomOverlayRectStyle(rect)}
    />
  )
}

function measureFigmaCloneBoxModel(target: HTMLElement): BoxModelMetrics {
  const style = getComputedStyle(target)

  return {
    border: {
      bottom: parsePx(style.borderBottomWidth),
      left: parsePx(style.borderLeftWidth),
      right: parsePx(style.borderRightWidth),
      top: parsePx(style.borderTopWidth),
    },
    margin: {
      bottom: parsePx(style.marginBottom),
      left: parsePx(style.marginLeft),
      right: parsePx(style.marginRight),
      top: parsePx(style.marginTop),
    },
    padding: {
      bottom: parsePx(style.paddingBottom),
      left: parsePx(style.paddingLeft),
      right: parsePx(style.paddingRight),
      top: parsePx(style.paddingTop),
    },
  }
}

function getFigmaCloneContentRect(
  rect: BoxModelRect,
  metrics: BoxModelMetrics,
): BoxModelRect {
  const leftInset = metrics.border.left + metrics.padding.left
  const rightInset = metrics.border.right + metrics.padding.right
  const topInset = metrics.border.top + metrics.padding.top
  const bottomInset = metrics.border.bottom + metrics.padding.bottom

  return {
    h: Math.max(0, rect.h - topInset - bottomInset),
    scale: rect.scale,
    w: Math.max(0, rect.w - leftInset - rightInset),
    x: rect.x + leftInset,
    y: rect.y + topInset,
  }
}

function getFigmaClonePaddingRects(
  rect: BoxModelRect,
  metrics: BoxModelMetrics,
): Array<BoxModelRect & { side: keyof BoxModelSides }> {
  const innerX = rect.x + metrics.border.left
  const innerY = rect.y + metrics.border.top
  const innerW = Math.max(0, rect.w - metrics.border.left - metrics.border.right)
  const innerH = Math.max(0, rect.h - metrics.border.top - metrics.border.bottom)

  return [
    {
      h: metrics.padding.top,
      scale: rect.scale,
      side: 'top',
      w: innerW,
      x: innerX,
      y: innerY,
    },
    {
      h: innerH,
      scale: rect.scale,
      side: 'right',
      w: metrics.padding.right,
      x: rect.x + rect.w - metrics.border.right - metrics.padding.right,
      y: innerY,
    },
    {
      h: metrics.padding.bottom,
      scale: rect.scale,
      side: 'bottom',
      w: innerW,
      x: innerX,
      y: rect.y + rect.h - metrics.border.bottom - metrics.padding.bottom,
    },
    {
      h: innerH,
      scale: rect.scale,
      side: 'left',
      w: metrics.padding.left,
      x: innerX,
      y: innerY,
    },
  ]
}

function getFigmaCloneMarginRects(
  rect: BoxModelRect,
  metrics: BoxModelMetrics,
): Array<BoxModelRect & { side: keyof BoxModelSides }> {
  return [
    {
      h: metrics.margin.top,
      scale: rect.scale,
      side: 'top',
      w: rect.w + metrics.margin.left + metrics.margin.right,
      x: rect.x - metrics.margin.left,
      y: rect.y - metrics.margin.top,
    },
    {
      h: rect.h,
      scale: rect.scale,
      side: 'right',
      w: metrics.margin.right,
      x: rect.x + rect.w,
      y: rect.y,
    },
    {
      h: metrics.margin.bottom,
      scale: rect.scale,
      side: 'bottom',
      w: rect.w + metrics.margin.left + metrics.margin.right,
      x: rect.x - metrics.margin.left,
      y: rect.y + rect.h,
    },
    {
      h: rect.h,
      scale: rect.scale,
      side: 'left',
      w: metrics.margin.left,
      x: rect.x - metrics.margin.left,
      y: rect.y,
    },
  ]
}

function parsePx(value: string): number {
  const parsed = Number.parseFloat(value)

  return Number.isFinite(parsed)
    ? Math.max(0, parsed)
    : 0
}

function hasAnySide(sides: BoxModelSides): boolean {
  return Object.values(sides).some((value) => value > 0.5)
}

function formatFigmaCloneSides(sides: BoxModelSides): string {
  const values = [sides.top, sides.right, sides.bottom, sides.left]
    .map((value) => Math.round(value))
  const uniqueValues = new Set(values)

  return uniqueValues.size === 1
    ? String(values[0])
    : values.join('/')
}
