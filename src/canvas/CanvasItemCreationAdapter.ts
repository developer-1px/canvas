import type { CanvasCreationAdapter } from './CanvasCreationEngine'
import type { CanvasItem } from './CanvasModel'

export const CANVAS_ITEM_CREATION_ADAPTER: CanvasCreationAdapter<CanvasItem> = {
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
