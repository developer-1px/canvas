import type {
  DomEditOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import type {
  DomEditNodeId,
} from '../../../shared/model/DomEditTypes'

export type DomEditFrameGuideAxis = 'x' | 'y'

export type DomEditFrameRulerGuide = {
  axis: DomEditFrameGuideAxis
  id: string
  offset: number
}

export type DomEditFrameLayoutColumns = {
  count: number
  gutter: number
  margin: number
}

export type DomEditFrameGuideConfig<
  TNodeId extends DomEditNodeId = DomEditNodeId,
> = {
  frameNodeId: TNodeId
  layoutColumns?: DomEditFrameLayoutColumns
  rulerGuides?: readonly DomEditFrameRulerGuide[]
}

export type DomEditFrameGuideLine = {
  axis: DomEditFrameGuideAxis
  id: string
  length: number
  offset: number
  orientation: 'horizontal' | 'vertical'
  x: number
  y: number
}

export type DomEditFrameGuideDistance = {
  axis: DomEditFrameGuideAxis
  coordinate: number
  from: number
  guideId: string
  length: number
  orientation: 'horizontal' | 'vertical'
  point: 'bottom' | 'center-x' | 'center-y' | 'left' | 'right' | 'top'
}

export type DomEditFrameLayoutColumn = DomEditOverlayRect & {
  id: string
  index: number
}

export type DomEditFrameGuideGeometry = {
  columns: DomEditFrameLayoutColumn[]
  distances: DomEditFrameGuideDistance[]
  lines: DomEditFrameGuideLine[]
}

export function getDomEditFrameGuideGeometry({
  frameRect,
  layoutColumns,
  rulerGuides = [],
  selectedRect,
}: {
  frameRect: DomEditOverlayRect
  layoutColumns?: DomEditFrameLayoutColumns
  rulerGuides?: readonly DomEditFrameRulerGuide[]
  selectedRect: DomEditOverlayRect
}): DomEditFrameGuideGeometry {
  const lines = rulerGuides.flatMap((guide) =>
    getDomEditFrameGuideLine({ frameRect, guide }))

  return {
    columns: layoutColumns
      ? getDomEditFrameLayoutColumns({ frameRect, layoutColumns })
      : [],
    distances: lines.flatMap((line) =>
      getDomEditFrameGuideDistance({ line, selectedRect })),
    lines,
  }
}

function getDomEditFrameGuideLine({
  frameRect,
  guide,
}: {
  frameRect: DomEditOverlayRect
  guide: DomEditFrameRulerGuide
}): DomEditFrameGuideLine[] {
  if (guide.axis === 'x') {
    if (guide.offset < 0 || guide.offset > frameRect.w) {
      return []
    }

    return [{
      axis: guide.axis,
      id: guide.id,
      length: frameRect.h,
      offset: guide.offset,
      orientation: 'vertical',
      x: frameRect.x + guide.offset,
      y: frameRect.y,
    }]
  }

  if (guide.offset < 0 || guide.offset > frameRect.h) {
    return []
  }

  return [{
    axis: guide.axis,
    id: guide.id,
    length: frameRect.w,
    offset: guide.offset,
    orientation: 'horizontal',
    x: frameRect.x,
    y: frameRect.y + guide.offset,
  }]
}

function getDomEditFrameLayoutColumns({
  frameRect,
  layoutColumns,
}: {
  frameRect: DomEditOverlayRect
  layoutColumns: DomEditFrameLayoutColumns
}): DomEditFrameLayoutColumn[] {
  const count = Math.max(0, Math.floor(layoutColumns.count))

  if (count === 0) {
    return []
  }

  const gutter = Math.max(0, layoutColumns.gutter)
  const margin = Math.max(0, layoutColumns.margin)
  const availableWidth = frameRect.w - margin * 2 - gutter * (count - 1)

  if (availableWidth <= 0.5) {
    return []
  }

  const columnWidth = availableWidth / count

  return Array.from({ length: count }, (_, index) => ({
    h: frameRect.h,
    id: `column-${index + 1}`,
    index,
    w: columnWidth,
    x: frameRect.x + margin + index * (columnWidth + gutter),
    y: frameRect.y,
  }))
}

function getDomEditFrameGuideDistance({
  line,
  selectedRect,
}: {
  line: DomEditFrameGuideLine
  selectedRect: DomEditOverlayRect
}): DomEditFrameGuideDistance[] {
  const nearestPoint = getNearestDomEditSelectedPoint({
    axis: line.axis,
    selectedRect,
    value: line.axis === 'x' ? line.x : line.y,
  })
  const length = Math.abs(nearestPoint.value - nearestPoint.guideValue)

  if (length <= 0.5) {
    return []
  }

  return [{
    axis: line.axis,
    coordinate: line.axis === 'x'
      ? selectedRect.y + selectedRect.h / 2
      : selectedRect.x + selectedRect.w / 2,
    from: Math.min(nearestPoint.value, nearestPoint.guideValue),
    guideId: line.id,
    length,
    orientation: line.axis === 'x' ? 'horizontal' : 'vertical',
    point: nearestPoint.point,
  }]
}

function getNearestDomEditSelectedPoint({
  axis,
  selectedRect,
  value,
}: {
  axis: DomEditFrameGuideAxis
  selectedRect: DomEditOverlayRect
  value: number
}) {
  const right = selectedRect.x + selectedRect.w
  const bottom = selectedRect.y + selectedRect.h
  const points = axis === 'x'
    ? [
        { point: 'left' as const, value: selectedRect.x },
        { point: 'center-x' as const, value: selectedRect.x + selectedRect.w / 2 },
        { point: 'right' as const, value: right },
      ]
    : [
        { point: 'top' as const, value: selectedRect.y },
        { point: 'center-y' as const, value: selectedRect.y + selectedRect.h / 2 },
        { point: 'bottom' as const, value: bottom },
      ]

  return points.reduce((nearest, point) =>
    Math.abs(point.value - value) < Math.abs(nearest.value - value)
      ? { ...point, guideValue: value }
      : nearest,
  { ...points[0], guideValue: value })
}
