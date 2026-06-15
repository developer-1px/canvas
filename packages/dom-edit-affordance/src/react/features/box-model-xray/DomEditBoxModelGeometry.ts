import type {
  DomEditScaledOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'

export type DomEditBoxModelRect = DomEditScaledOverlayRect

export type DomEditBoxModelSide = 'bottom' | 'left' | 'right' | 'top'

export type DomEditBoxModelSides = Record<DomEditBoxModelSide, number>

export type DomEditBoxModelMetrics = {
  border: DomEditBoxModelSides
  margin: DomEditBoxModelSides
  padding: DomEditBoxModelSides
}

export type DomEditBoxModelSideRect =
  DomEditBoxModelRect & { side: DomEditBoxModelSide }

export type DomEditBoxModelRects = {
  border: DomEditBoxModelRect
  content: DomEditBoxModelRect
  margin: DomEditBoxModelSideRect[]
  padding: DomEditBoxModelSideRect[]
}

export type DomEditComputedBoxStyle = Pick<
  CSSStyleDeclaration,
  | 'borderBottomWidth'
  | 'borderLeftWidth'
  | 'borderRightWidth'
  | 'borderTopWidth'
  | 'marginBottom'
  | 'marginLeft'
  | 'marginRight'
  | 'marginTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingTop'
>

export function readDomEditBoxModelMetrics(
  style: DomEditComputedBoxStyle,
): DomEditBoxModelMetrics {
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

export function getDomEditBoxModelRects({
  metrics,
  rect,
}: {
  metrics: DomEditBoxModelMetrics
  rect: DomEditBoxModelRect
}): DomEditBoxModelRects {
  return {
    border: rect,
    content: getDomEditContentRect(rect, metrics),
    margin: getDomEditMarginRects(rect, metrics),
    padding: getDomEditPaddingRects(rect, metrics),
  }
}

function getDomEditContentRect(
  rect: DomEditBoxModelRect,
  metrics: DomEditBoxModelMetrics,
): DomEditBoxModelRect {
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

function getDomEditPaddingRects(
  rect: DomEditBoxModelRect,
  metrics: DomEditBoxModelMetrics,
): DomEditBoxModelSideRect[] {
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

function getDomEditMarginRects(
  rect: DomEditBoxModelRect,
  metrics: DomEditBoxModelMetrics,
): DomEditBoxModelSideRect[] {
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
