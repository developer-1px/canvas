import type { CanvasTransformAdapter } from './CanvasTransformEngine'
import type { CanvasItem } from './CanvasModel'
import { resizeCanvasItems, translateCanvasItems } from './CanvasOperations'

export const CANVAS_ITEM_TRANSFORM_ADAPTER: CanvasTransformAdapter<CanvasItem> = {
  resizeSelection: ({ from, items, selection, to }) =>
    resizeCanvasItems(items, selection, from, to),
  translateSelection: ({ dx, dy, items, selection }) =>
    translateCanvasItems(items, selection, dx, dy),
}
