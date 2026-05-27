import type {
  CanvasShapeItem,
  RectItem,
  TextItem,
} from '../../entities'
import { renderCanvasDemoSvgRectTextItemByRoute } from './CanvasDemoSvgRectTextItemRenderRouting'

export type CanvasDemoSvgRectTextItem = CanvasShapeItem | RectItem | TextItem

export function renderCanvasDemoSvgRectTextItem({
  item,
}: {
  item: CanvasDemoSvgRectTextItem
}) {
  return renderCanvasDemoSvgRectTextItemByRoute({ item })
}
