import type {
  RectItem,
  TextItem,
} from '../../entities'
import { renderCanvasDemoSvgRectTextItemByRoute } from './CanvasDemoSvgRectTextItemRenderRouting'

export type CanvasDemoSvgRectTextItem = RectItem | TextItem

export function renderCanvasDemoSvgRectTextItem({
  item,
}: {
  item: CanvasDemoSvgRectTextItem
}) {
  return renderCanvasDemoSvgRectTextItemByRoute({ item })
}
