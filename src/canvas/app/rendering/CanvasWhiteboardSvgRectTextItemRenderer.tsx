import type {
  CanvasShapeItem,
  RectItem,
  TextItem,
} from '../../entities'
import { renderCanvasWhiteboardSvgRectTextItemByRoute } from './CanvasWhiteboardSvgRectTextItemRenderRouting'

export type CanvasWhiteboardSvgRectTextItem = CanvasShapeItem | RectItem | TextItem

export function renderCanvasWhiteboardSvgRectTextItem({
  item,
}: {
  item: CanvasWhiteboardSvgRectTextItem
}) {
  return renderCanvasWhiteboardSvgRectTextItemByRoute({ item })
}
