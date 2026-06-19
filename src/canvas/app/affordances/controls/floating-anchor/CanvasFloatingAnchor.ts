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

export type CanvasFloatingAnchorSurfaceAttributes = {
  'data-placement': CanvasFloatingAnchorPlacement
}

export type CanvasFloatingAnchorSurfaceCoordinateStyle = Record<string, string>

export type CanvasFloatingAnchorSurfaceStyle =
  CanvasFloatingAnchorSurfaceCoordinateStyle & {
    left: string
    top: string
    transform: string
    transformOrigin: string
  }

export type CanvasFloatingAnchorSurfaceDescriptor = {
  anchor: CanvasFloatingAnchor
  attributes: CanvasFloatingAnchorSurfaceAttributes
  placement: CanvasFloatingAnchorPlacement
  style: CanvasFloatingAnchorSurfaceStyle
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

export type CanvasFloatingAnchorSurfaceStyleInput = {
  anchor: CanvasFloatingAnchor
  offset?: number
  xProperty?: string
  yProperty?: string
}

export type CanvasFloatingAnchorSurfaceCoordinateStyleInput = Pick<
  CanvasFloatingAnchorSurfaceStyleInput,
  'anchor' | 'xProperty' | 'yProperty'
>

export type CanvasFloatingAnchorSurfaceDescriptorInput =
  Omit<CanvasFloatingAnchorSurfaceStyleInput, 'anchor'> & {
    anchor: CanvasFloatingAnchor | null | undefined
  }

const DEFAULT_CANVAS_FLOATING_ANCHOR_SCREEN_GAP = 10
const DEFAULT_CANVAS_FLOATING_ANCHOR_SCREEN_MARGIN = 8
const DEFAULT_CANVAS_FLOATING_ANCHOR_SURFACE_OFFSET = 10
const DEFAULT_CANVAS_FLOATING_ANCHOR_X_PROPERTY = '--canvas-floating-anchor-x'
const DEFAULT_CANVAS_FLOATING_ANCHOR_Y_PROPERTY = '--canvas-floating-anchor-y'

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
  const floatingWidth = getCanvasFloatingAnchorScreenWidth({
    floatingWidth: floatingSize.width,
    screenMargin,
    stageRect,
  })
  const floatingHalfWidth = floatingWidth / 2 / viewport.scale
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

export function getCanvasFloatingAnchorSurfaceDescriptor({
  anchor,
  offset,
  xProperty,
  yProperty,
}: CanvasFloatingAnchorSurfaceDescriptorInput):
  CanvasFloatingAnchorSurfaceDescriptor | null {
  if (!anchor) {
    return null
  }

  return {
    anchor,
    attributes: {
      'data-placement': anchor.placement,
    },
    placement: anchor.placement,
    style: getCanvasFloatingAnchorSurfaceStyle({
      anchor,
      offset,
      xProperty,
      yProperty,
    }),
  }
}

export function getCanvasFloatingAnchorSurfaceStyle({
  anchor,
  offset = DEFAULT_CANVAS_FLOATING_ANCHOR_SURFACE_OFFSET,
  xProperty = DEFAULT_CANVAS_FLOATING_ANCHOR_X_PROPERTY,
  yProperty = DEFAULT_CANVAS_FLOATING_ANCHOR_Y_PROPERTY,
}: CanvasFloatingAnchorSurfaceStyleInput): CanvasFloatingAnchorSurfaceStyle {
  const coordinateStyle = getCanvasFloatingAnchorSurfaceCoordinateStyle({
    anchor,
    xProperty,
    yProperty,
  })
  const style: CanvasFloatingAnchorSurfaceStyle = {
    ...coordinateStyle,
    left: `var(${xProperty})`,
    top: `var(${yProperty})`,
    transform: getCanvasFloatingAnchorSurfaceTransform({
      offset,
      placement: anchor.placement,
    }),
    transformOrigin: anchor.placement === 'above' ? '50% 100%' : '50% 0',
  }

  return style
}

export function getCanvasFloatingAnchorSurfaceCoordinateStyle({
  anchor,
  xProperty = DEFAULT_CANVAS_FLOATING_ANCHOR_X_PROPERTY,
  yProperty = DEFAULT_CANVAS_FLOATING_ANCHOR_Y_PROPERTY,
}: CanvasFloatingAnchorSurfaceCoordinateStyleInput):
  CanvasFloatingAnchorSurfaceCoordinateStyle {
  return {
    [xProperty]: `${anchor.x}px`,
    [yProperty]: `${anchor.y}px`,
  }
}

function getCanvasFloatingAnchorSurfaceTransform({
  offset,
  placement,
}: {
  offset: number
  placement: CanvasFloatingAnchorPlacement
}) {
  if (placement === 'above') {
    return `translate(-50%, calc(-100% - ${offset}px))`
  }

  return `translate(-50%, ${offset}px)`
}

function getCanvasFloatingAnchorScreenWidth({
  floatingWidth,
  screenMargin,
  stageRect,
}: {
  floatingWidth: number
  screenMargin: number
  stageRect: CanvasViewportRect | null | undefined
}) {
  if (!stageRect) {
    return floatingWidth
  }

  return Math.min(
    floatingWidth,
    Math.max(0, stageRect.width - screenMargin * 2),
  )
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
