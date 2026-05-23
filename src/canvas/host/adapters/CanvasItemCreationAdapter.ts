import type { CanvasCreationAdapter } from '../../engine'
import type { CanvasItem } from '../model'
import { syncCanvasItemBounds } from '../tree/CanvasTree'

export const CANVAS_ITEM_CREATION_ADAPTER: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({ end, id, start }) =>
    syncCanvasItemBounds({
      id,
      type: 'arrow',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      end,
      start,
      stroke: '#334155',
      strokeWidth: 3,
    }),
  createHighlight: ({ id, points }) =>
    syncCanvasItemBounds({
      id,
      type: 'highlight',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      points,
      stroke: '#fde047',
      strokeWidth: 18,
      opacity: 0.42,
    }),
  createMarker: ({ id, points }) =>
    syncCanvasItemBounds({
      id,
      type: 'marker',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
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
