import type {
  DomEditOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'

export type DomEditGridChildArea = DomEditOverlayRect & {
  columnEnd: number
  columnSpan: number
  columnStart: number
  rowEnd: number
  rowSpan: number
  rowStart: number
}

export function getDomEditGridChildArea({
  child,
  tracks,
}: {
  child: DomEditOverlayRect
  tracks: DomEditOverlayRect[]
}): DomEditGridChildArea | null {
  if (tracks.length === 0 || child.w <= 0.5 || child.h <= 0.5) {
    return null
  }

  const columnArea = getDomEditGridAxisArea({
    axis: 'x',
    child,
    tracks,
  })
  const rowArea = getDomEditGridAxisArea({
    axis: 'y',
    child,
    tracks,
  })

  if (!columnArea || !rowArea) {
    return null
  }

  return {
    columnEnd: columnArea.end,
    columnSpan: columnArea.span,
    columnStart: columnArea.start,
    h: rowArea.size,
    rowEnd: rowArea.end,
    rowSpan: rowArea.span,
    rowStart: rowArea.start,
    w: columnArea.size,
    x: columnArea.offset,
    y: rowArea.offset,
  }
}

function getDomEditGridAxisArea({
  axis,
  child,
  tracks,
}: {
  axis: 'x' | 'y'
  child: DomEditOverlayRect
  tracks: DomEditOverlayRect[]
}) {
  const starts = getDomEditGridTrackLines(tracks, axis, 'start')
  const ends = getDomEditGridTrackLines(tracks, axis, 'end')
  const childStart = axis === 'x' ? child.x : child.y
  const childEnd = childStart + (axis === 'x' ? child.w : child.h)
  const start = findDomEditGridLine(starts, childStart)
  const endLine = findDomEditGridLine(ends, childEnd)

  if (start === null || endLine === null) {
    return null
  }

  const end = starts.filter((line) => line < childEnd - GRID_LINE_TOLERANCE)
    .length
  const offset = starts[start]
  const endOffset = ends[endLine]
  const span = end - start

  if (span <= 0 || endOffset <= offset) {
    return null
  }

  return {
    end,
    offset,
    size: endOffset - offset,
    span,
    start,
  }
}

function getDomEditGridTrackLines(
  tracks: DomEditOverlayRect[],
  axis: 'x' | 'y',
  edge: 'end' | 'start',
) {
  const lineValues = tracks.map((track) => {
    const start = axis === 'x' ? track.x : track.y
    const size = axis === 'x' ? track.w : track.h

    return edge === 'start' ? start : start + size
  })

  return Array.from(
    new Set(lineValues.map((line) => Math.round(line * 1000) / 1000)),
  ).sort((a, b) => a - b)
}

const GRID_LINE_TOLERANCE = 1

function findDomEditGridLine(
  lines: number[],
  value: number,
) {
  let closestIndex: number | null = null
  let closestDistance = Number.POSITIVE_INFINITY

  lines.forEach((line, index) => {
    const distance = Math.abs(line - value)

    if (distance <= GRID_LINE_TOLERANCE && distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  })

  return closestIndex
}
