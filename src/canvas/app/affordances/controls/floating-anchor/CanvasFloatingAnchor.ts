import {
  clamp,
  type Bounds,
  type CanvasViewportRect,
  type Viewport,
} from '../../../../core'

export type CanvasFloatingAnchorPlacement = 'above' | 'below'

export type CanvasFloatingAnchor = {
  placement: CanvasFloatingAnchorPlacement
  x: number
  y: number
}

export type CanvasFloatingAnchorSize = {
  height: number
  width: number
}

export type CanvasFloatingAnchorForBoundsInput = {
  bounds: Bounds | null | undefined
  floatingSize: CanvasFloatingAnchorSize
  frameBounds?: Bounds | null
  screenGap?: number
  screenMargin?: number
  stageRect?: CanvasViewportRect | null
  viewport: Viewport
}

const DEFAULT_CANVAS_FLOATING_ANCHOR_SCREEN_GAP = 10
const DEFAULT_CANVAS_FLOATING_ANCHOR_SCREEN_MARGIN = 8

export function getCanvasFloatingAnchorForBounds({
  bounds,
  floatingSize,
  frameBounds,
  screenGap = DEFAULT_CANVAS_FLOATING_ANCHOR_SCREEN_GAP,
  screenMargin = DEFAULT_CANVAS_FLOATING_ANCHOR_SCREEN_MARGIN,
  stageRect,
  viewport,
}: CanvasFloatingAnchorForBoundsInput): CanvasFloatingAnchor | null {
  if (!bounds) {
    return null
  }

  const worldGap = screenGap / viewport.scale
  const floatingHalfWidth = floatingSize.width / 2 / viewport.scale
  const frameLeft = frameBounds?.x ?? Number.NEGATIVE_INFINITY
  const frameRight = frameBounds
    ? frameBounds.x + frameBounds.w
    : Number.POSITIVE_INFINITY
  const centerX = bounds.x + bounds.w / 2
  const aboveY = bounds.y - worldGap
  const belowY = bounds.y + bounds.h + worldGap
  const xRange = getCanvasFloatingAnchorXRange({
    floatingHalfWidth,
    frameLeft,
    frameRight,
    screenMargin,
    stageRect,
    viewport,
  })
  const placement = getCanvasFloatingAnchorPlacement({
    aboveY,
    belowY,
    floatingHeight: floatingSize.height,
    screenMargin,
    stageRect,
    viewport,
  })

  return {
    placement,
    x: clamp(centerX, xRange.min, xRange.max),
    y: placement === 'above' ? aboveY : belowY,
  }
}

function getCanvasFloatingAnchorXRange({
  floatingHalfWidth,
  frameLeft,
  frameRight,
  screenMargin,
  stageRect,
  viewport,
}: {
  floatingHalfWidth: number
  frameLeft: number
  frameRight: number
  screenMargin: number
  stageRect: CanvasViewportRect | null | undefined
  viewport: Viewport
}) {
  if (!stageRect) {
    const min = Math.min(
      frameLeft + floatingHalfWidth,
      frameRight - floatingHalfWidth,
    )

    return {
      max: Math.max(min, frameRight - floatingHalfWidth),
      min,
    }
  }

  const visibleLeft = clamp(
    (screenMargin - viewport.x) / viewport.scale,
    frameLeft,
    frameRight,
  )
  const visibleRight = clamp(
    (stageRect.width - screenMargin - viewport.x) / viewport.scale,
    frameLeft,
    frameRight,
  )
  const min = Math.min(
    visibleLeft + floatingHalfWidth,
    frameRight - floatingHalfWidth,
  )

  return {
    max: Math.max(min, visibleRight - floatingHalfWidth),
    min,
  }
}

function getCanvasFloatingAnchorPlacement({
  aboveY,
  belowY,
  floatingHeight,
  screenMargin,
  stageRect,
  viewport,
}: {
  aboveY: number
  belowY: number
  floatingHeight: number
  screenMargin: number
  stageRect: CanvasViewportRect | null | undefined
  viewport: Viewport
}): CanvasFloatingAnchorPlacement {
  if (!stageRect) {
    return 'above'
  }

  const aboveScreenY = viewport.y + aboveY * viewport.scale
  const belowScreenY = viewport.y + belowY * viewport.scale
  const aboveFits = aboveScreenY - floatingHeight >= screenMargin
  const belowFits = belowScreenY + floatingHeight <= stageRect.height - screenMargin

  return aboveFits || !belowFits ? 'above' : 'below'
}
