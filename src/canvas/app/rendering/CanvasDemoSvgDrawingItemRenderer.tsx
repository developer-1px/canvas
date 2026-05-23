import type { CanvasItem } from '../../entities'
import {
  isCanvasDrawingItem,
  type CanvasDrawingItem,
} from '../../host'
import { renderCanvasDemoSvgDrawingItemByRoute } from './CanvasDemoSvgDrawingItemRenderRouting'

export type CanvasDemoSvgDrawingItem = CanvasDrawingItem

export function isCanvasDemoSvgDrawingItem(
  item: CanvasItem,
): item is CanvasDemoSvgDrawingItem {
  return isCanvasDrawingItem(item)
}

export function renderCanvasDemoSvgDrawingItem({
  item,
}: {
  item: CanvasDemoSvgDrawingItem
}) {
  return renderCanvasDemoSvgDrawingItemByRoute({ item })
}
