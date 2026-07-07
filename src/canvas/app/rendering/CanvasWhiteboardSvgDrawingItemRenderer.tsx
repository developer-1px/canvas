import type { CanvasItem } from '../../entities'
import {
  isCanvasDrawingItem,
  type CanvasDrawingItem,
} from '../../host'
import { renderCanvasWhiteboardSvgDrawingItemByRoute } from './CanvasWhiteboardSvgDrawingItemRenderRouting'

export type CanvasWhiteboardSvgDrawingItem = CanvasDrawingItem

export function isCanvasWhiteboardSvgDrawingItem(
  item: CanvasItem,
): item is CanvasWhiteboardSvgDrawingItem {
  return isCanvasDrawingItem(item)
}

export function renderCanvasWhiteboardSvgDrawingItem({
  item,
}: {
  item: CanvasWhiteboardSvgDrawingItem
}) {
  return renderCanvasWhiteboardSvgDrawingItemByRoute({ item })
}
