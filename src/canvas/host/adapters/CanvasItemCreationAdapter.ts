import type { CanvasCreationAdapter } from '../../engine'
import type { CanvasItem } from '../model'
import {
  getCanvasArrowStyle,
  getCanvasDrawingStrokeStyle,
} from '../drawing/CanvasDrawingItemStyles'
import { syncCanvasItemBounds } from '../tree/CanvasTree'

export const CANVAS_ITEM_CREATION_ADAPTER: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({ end, endAttachedTo, id, start, startAttachedTo }) =>
    syncCanvasItemBounds({
      id,
      type: 'arrow',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      end,
      endAttachedTo,
      start,
      startAttachedTo,
      ...getCanvasArrowStyle(),
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
      ...getCanvasDrawingStrokeStyle('highlight'),
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
      ...getCanvasDrawingStrokeStyle('marker'),
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
