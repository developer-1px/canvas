import type { CanvasCreationAdapter } from '../../engine'
import type { Point } from '../../core'
import { normalizeBounds } from '../../core'
import type { CanvasItem } from '../model'

export const CANVAS_ITEM_CREATION_ADAPTER: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({ end, id, start }) => ({
    id,
    type: 'arrow',
    ...getArrowItemBounds(start, end),
    end,
    start,
    stroke: '#334155',
    strokeWidth: 3,
  }),
  createHighlight: ({ id, points }) => ({
    id,
    type: 'highlight',
    ...getDrawingItemBounds(points, 9),
    points,
    stroke: '#fde047',
    strokeWidth: 18,
    opacity: 0.42,
  }),
  createMarker: ({ id, points }) => ({
    id,
    type: 'marker',
    ...getDrawingItemBounds(points, 2),
    points,
    stroke: '#475569',
    strokeWidth: 4,
    opacity: 1,
  }),
  createRect: ({ bounds, id }) => ({
    id,
    type: 'rect',
    ...bounds,
    fill: '#fef3c7',
    stroke: '#d97706',
  }),
  createText: ({ id, point }) => ({
    item: {
      id,
      type: 'text',
      x: point.x,
      y: point.y,
      w: 190,
      h: 42,
      text: 'Text',
    },
    editValue: 'Text',
  }),
}

function getArrowItemBounds(start: Point, end: Point) {
  const bounds = normalizeBounds(start, end)
  const pad = 12

  return {
    x: bounds.x - pad,
    y: bounds.y - pad,
    w: Math.max(bounds.w + pad * 2, pad * 2),
    h: Math.max(bounds.h + pad * 2, pad * 2),
  }
}

function getDrawingItemBounds(points: Point[], pad: number) {
  const [first = { x: 0, y: 0 }] = points
  let minX = first.x
  let minY = first.y
  let maxX = first.x
  let maxY = first.y

  for (const point of points.slice(1)) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  return {
    x: minX - pad,
    y: minY - pad,
    w: Math.max(maxX - minX + pad * 2, pad * 2),
    h: Math.max(maxY - minY + pad * 2, pad * 2),
  }
}
