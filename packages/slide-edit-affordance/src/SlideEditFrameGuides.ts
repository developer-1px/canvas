import type { Bounds } from '../../../src/canvas/core'

export type SlideEditFrameBounds = Bounds
export type SlideEditFrameGuideAxis = 'x' | 'y'
export type SlideEditFrameGuideOrientation = 'horizontal' | 'vertical'
export type SlideEditFrameGuideSide = 'bottom' | 'left' | 'right' | 'top'
export type SlideEditFrameGuideKind =
  | 'center'
  | 'margin'
  | 'ruler'
  | 'safe-area'

export type SlideEditFrameInsets = Record<SlideEditFrameGuideSide, number>
export type SlideEditFrameInsetsInput = number | SlideEditFrameInsets

export type SlideEditFrameRulerGuide = {
  axis: SlideEditFrameGuideAxis
  id: string
  offset: number
}

export type SlideEditFrameColumnGuideConfig = {
  count: number
  gutter: number
  margin: number
}

export type SlideEditFrameGuideConfig = {
  columns?: SlideEditFrameColumnGuideConfig
  margin?: SlideEditFrameInsetsInput
  rulerGuides?: readonly SlideEditFrameRulerGuide[]
  safeArea?: SlideEditFrameInsetsInput
}

export type SlideEditFrameGuideLine = {
  axis: SlideEditFrameGuideAxis
  coordinate: number
  frameOffset: number
  id: string
  kind: SlideEditFrameGuideKind
  length: number
  orientation: SlideEditFrameGuideOrientation
  side?: SlideEditFrameGuideSide
  x: number
  y: number
}

export type SlideEditFrameRegion = SlideEditFrameBounds & {
  id: string
  kind: 'safe-area'
}

export type SlideEditFrameColumnGuide = SlideEditFrameBounds & {
  id: string
  index: number
  kind: 'column'
}

export type SlideEditFrameGuideGeometry = {
  columns: SlideEditFrameColumnGuide[]
  lines: SlideEditFrameGuideLine[]
  regions: SlideEditFrameRegion[]
}

export function getSlideEditFrameGuideGeometry({
  config = {},
  frameBounds,
}: {
  config?: SlideEditFrameGuideConfig
  frameBounds: SlideEditFrameBounds
}): SlideEditFrameGuideGeometry {
  const safeArea = config.safeArea
    ? getSlideEditFrameInsetRegion({
        frameBounds,
        id: 'safe-area',
        insets: normalizeSlideEditFrameInsets(config.safeArea),
      })
    : null

  return {
    columns: config.columns
      ? getSlideEditFrameColumnGuides({ frameBounds, columns: config.columns })
      : [],
    lines: [
      ...getSlideEditFrameCenterGuideLines(frameBounds),
      ...(config.margin
        ? getSlideEditFrameInsetGuideLines({
            frameBounds,
            insets: normalizeSlideEditFrameInsets(config.margin),
            kind: 'margin',
          })
        : []),
      ...(safeArea
        ? getSlideEditFrameInsetGuideLines({
            frameBounds,
            insets: getSlideEditFrameRegionInsets(frameBounds, safeArea),
            kind: 'safe-area',
          })
        : []),
      ...(config.rulerGuides ?? []).flatMap((guide) =>
        getSlideEditFrameRulerGuideLine({ frameBounds, guide })),
    ],
    regions: safeArea ? [safeArea] : [],
  }
}

export function normalizeSlideEditFrameInsets(
  insets: SlideEditFrameInsetsInput,
): SlideEditFrameInsets {
  if (typeof insets === 'number') {
    const value = normalizeSlideEditFrameGuideDistance(insets)

    return {
      bottom: value,
      left: value,
      right: value,
      top: value,
    }
  }

  return {
    bottom: normalizeSlideEditFrameGuideDistance(insets.bottom),
    left: normalizeSlideEditFrameGuideDistance(insets.left),
    right: normalizeSlideEditFrameGuideDistance(insets.right),
    top: normalizeSlideEditFrameGuideDistance(insets.top),
  }
}

function getSlideEditFrameCenterGuideLines(
  frameBounds: SlideEditFrameBounds,
): SlideEditFrameGuideLine[] {
  return [
    createSlideEditFrameGuideLine({
      axis: 'x',
      frameBounds,
      id: 'center-x',
      kind: 'center',
      offset: frameBounds.w / 2,
    }),
    createSlideEditFrameGuideLine({
      axis: 'y',
      frameBounds,
      id: 'center-y',
      kind: 'center',
      offset: frameBounds.h / 2,
    }),
  ].filter((line): line is SlideEditFrameGuideLine => line !== null)
}

function getSlideEditFrameInsetGuideLines({
  frameBounds,
  insets,
  kind,
}: {
  frameBounds: SlideEditFrameBounds
  insets: SlideEditFrameInsets
  kind: 'margin' | 'safe-area'
}): SlideEditFrameGuideLine[] {
  return [
    createSlideEditFrameGuideLine({
      axis: 'x',
      frameBounds,
      id: `${kind}-left`,
      kind,
      offset: insets.left,
      side: 'left',
    }),
    createSlideEditFrameGuideLine({
      axis: 'x',
      frameBounds,
      id: `${kind}-right`,
      kind,
      offset: frameBounds.w - insets.right,
      side: 'right',
    }),
    createSlideEditFrameGuideLine({
      axis: 'y',
      frameBounds,
      id: `${kind}-top`,
      kind,
      offset: insets.top,
      side: 'top',
    }),
    createSlideEditFrameGuideLine({
      axis: 'y',
      frameBounds,
      id: `${kind}-bottom`,
      kind,
      offset: frameBounds.h - insets.bottom,
      side: 'bottom',
    }),
  ].filter((line): line is SlideEditFrameGuideLine => line !== null)
}

function getSlideEditFrameRulerGuideLine({
  frameBounds,
  guide,
}: {
  frameBounds: SlideEditFrameBounds
  guide: SlideEditFrameRulerGuide
}): SlideEditFrameGuideLine[] {
  const line = createSlideEditFrameGuideLine({
    axis: guide.axis,
    frameBounds,
    id: guide.id,
    kind: 'ruler',
    offset: guide.offset,
  })

  return line ? [line] : []
}

function getSlideEditFrameColumnGuides({
  columns,
  frameBounds,
}: {
  columns: SlideEditFrameColumnGuideConfig
  frameBounds: SlideEditFrameBounds
}): SlideEditFrameColumnGuide[] {
  const count = Math.max(0, Math.floor(columns.count))

  if (count === 0) {
    return []
  }

  const gutter = normalizeSlideEditFrameGuideDistance(columns.gutter)
  const margin = normalizeSlideEditFrameGuideDistance(columns.margin)
  const availableWidth = frameBounds.w - margin * 2 - gutter * (count - 1)

  if (availableWidth <= 0.5) {
    return []
  }

  const columnWidth = availableWidth / count

  return Array.from({ length: count }, (_, index) => ({
    h: frameBounds.h,
    id: `column-${index + 1}`,
    index,
    kind: 'column',
    w: columnWidth,
    x: frameBounds.x + margin + index * (columnWidth + gutter),
    y: frameBounds.y,
  }))
}

function getSlideEditFrameInsetRegion({
  frameBounds,
  id,
  insets,
}: {
  frameBounds: SlideEditFrameBounds
  id: string
  insets: SlideEditFrameInsets
}): SlideEditFrameRegion | null {
  const w = frameBounds.w - insets.left - insets.right
  const h = frameBounds.h - insets.top - insets.bottom

  if (w <= 0.5 || h <= 0.5) {
    return null
  }

  return {
    h,
    id,
    kind: 'safe-area',
    w,
    x: frameBounds.x + insets.left,
    y: frameBounds.y + insets.top,
  }
}

function getSlideEditFrameRegionInsets(
  frameBounds: SlideEditFrameBounds,
  region: SlideEditFrameRegion,
): SlideEditFrameInsets {
  return {
    bottom: frameBounds.y + frameBounds.h - (region.y + region.h),
    left: region.x - frameBounds.x,
    right: frameBounds.x + frameBounds.w - (region.x + region.w),
    top: region.y - frameBounds.y,
  }
}

function createSlideEditFrameGuideLine({
  axis,
  frameBounds,
  id,
  kind,
  offset,
  side,
}: {
  axis: SlideEditFrameGuideAxis
  frameBounds: SlideEditFrameBounds
  id: string
  kind: SlideEditFrameGuideKind
  offset: number
  side?: SlideEditFrameGuideSide
}): SlideEditFrameGuideLine | null {
  const dimension = axis === 'x' ? frameBounds.w : frameBounds.h

  if (!Number.isFinite(offset) || offset < 0 || offset > dimension) {
    return null
  }

  if (axis === 'x') {
    return {
      axis,
      coordinate: frameBounds.x + offset,
      frameOffset: offset,
      id,
      kind,
      length: frameBounds.h,
      orientation: 'vertical',
      side,
      x: frameBounds.x + offset,
      y: frameBounds.y,
    }
  }

  return {
    axis,
    coordinate: frameBounds.y + offset,
    frameOffset: offset,
    id,
    kind,
    length: frameBounds.w,
    orientation: 'horizontal',
    side,
    x: frameBounds.x,
    y: frameBounds.y + offset,
  }
}

function normalizeSlideEditFrameGuideDistance(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}
