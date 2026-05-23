import type { CanvasEditableTextItem } from '../../host'
import { renderCanvasDemoSvgRectTextItemByRoute } from './CanvasDemoSvgRectTextItemRenderRouting'

export type CanvasDemoSvgRectTextItem = CanvasEditableTextItem

export function renderCanvasDemoSvgRectTextItem({
  item,
}: {
  item: CanvasDemoSvgRectTextItem
}) {
  return renderCanvasDemoSvgRectTextItemByRoute({ item })
}
