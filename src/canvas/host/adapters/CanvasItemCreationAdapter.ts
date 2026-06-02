import type { CanvasCreationAdapter } from '../../engine'
import type { CanvasItem } from '../model'
import {
  getCanvasArrowStyle,
  getCanvasDrawingStrokeStyle,
} from '../drawing/CanvasDrawingItemStyles'
import { syncCanvasItemBounds } from '../tree/CanvasTree'

export const CANVAS_ITEM_CREATION_ADAPTER: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({
    end,
    endAttachedTo,
    id,
    routing,
    start,
    startAttachedTo,
  }) => {
    const item: CanvasItem = {
      id,
      type: 'arrow',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      end,
      routing,
      start,
      ...getCanvasArrowStyle(),
    }

    if (endAttachedTo !== undefined) {
      item.endAttachedTo = endAttachedTo
    }

    if (startAttachedTo !== undefined) {
      item.startAttachedTo = startAttachedTo
    }

    return syncCanvasItemBounds(item)
  },
  createHighlight: ({ id, points, style }) =>
    syncCanvasItemBounds({
      id,
      type: 'highlight',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      points,
      ...getCanvasDrawingStrokeStyle('highlight'),
      ...style,
    }),
  createMarker: ({ id, points, style }) =>
    syncCanvasItemBounds({
      id,
      type: 'marker',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      points,
      ...getCanvasDrawingStrokeStyle('marker'),
      ...style,
    }),
  createPath: ({ id, segments, style }) =>
    syncCanvasItemBounds({
      id,
      type: 'path',
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      fill: 'none',
      segments,
      ...getCanvasDrawingStrokeStyle('path'),
      ...style,
    }),
  createShape: ({ bounds, id, shapeType }) => ({
    id,
    type: 'shape',
    ...bounds,
    fill: '#fef3c7',
    shapeType,
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
