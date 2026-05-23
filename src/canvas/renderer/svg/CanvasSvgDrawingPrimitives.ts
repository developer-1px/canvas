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

function getCanvasSvgMarkerIri(id: string) {
  return `url(#${id})`
}
