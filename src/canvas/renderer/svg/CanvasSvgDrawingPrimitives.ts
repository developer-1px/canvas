import type { Point } from '../../core'

export const CANVAS_SVG_ARROW_MARKER_ID = 'canvas-arrow-head'
export const CANVAS_SVG_DRAFT_ARROW_MARKER_ID = 'canvas-draft-arrow-head'
export const CANVAS_SVG_ARROW_MARKER_IRI = getCanvasSvgMarkerIri(
  CANVAS_SVG_ARROW_MARKER_ID,
)
export const CANVAS_SVG_DRAFT_ARROW_MARKER_IRI = getCanvasSvgMarkerIri(
  CANVAS_SVG_DRAFT_ARROW_MARKER_ID,
)

export function createCanvasSvgPathData(points: readonly Point[]) {
  const [first, ...rest] = points

  if (!first) {
    return ''
  }

  return [
    `M ${first.x} ${first.y}`,
    ...rest.map((point) => `L ${point.x} ${point.y}`),
  ].join(' ')
}

export function createCanvasSvgFreehandPathData(points: readonly Point[]) {
  const [first, second, ...rest] = points

  if (!first) {
    return ''
  }

  if (!second) {
    return `M ${first.x} ${first.y}`
  }

  if (rest.length === 0) {
    return createCanvasSvgPathData(points)
  }

  return [
    `M ${first.x} ${first.y}`,
    `Q ${second.x} ${second.y} ${getCanvasSvgPointMidpoint(second, rest[0])}`,
    ...rest.slice(1).map((point, index) => {
      const control = rest[index]

      return `Q ${control.x} ${control.y} ${getCanvasSvgPointMidpoint(control, point)}`
    }),
    `L ${rest[rest.length - 1].x} ${rest[rest.length - 1].y}`,
  ].join(' ')
}

export function createCanvasSvgArrowPathData({
  end,
  routing,
  start,
}: {
  end: Point
  routing?: 'elbow' | 'straight'
  start: Point
}) {
  return createCanvasSvgPathData(
    routing === 'elbow'
      ? removeRepeatedCanvasSvgPoints([
          start,
          {
            x: start.x + (end.x - start.x) / 2,
            y: start.y,
          },
          {
            x: start.x + (end.x - start.x) / 2,
            y: end.y,
          },
          end,
        ])
      : [start, end],
  )
}

function getCanvasSvgMarkerIri(id: string) {
  return `url(#${id})`
}

function getCanvasSvgPointMidpoint(left: Point, right: Point) {
  return `${(left.x + right.x) / 2} ${(left.y + right.y) / 2}`
}

function removeRepeatedCanvasSvgPoints(points: readonly Point[]) {
  return points.filter((point, index) => {
    const previous = points[index - 1]

    return !previous || previous.x !== point.x || previous.y !== point.y
  })
}
