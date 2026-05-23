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
  createHighlight: ({ bounds, id }) => ({
    id,
    type: 'highlight',
    ...bounds,
    fill: '#fde047',
    opacity: 0.42,
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
