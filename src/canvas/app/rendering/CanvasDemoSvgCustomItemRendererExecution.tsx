import type { CanvasCustomItem } from '../../entities'
import { renderCanvasDemoSvgCustomItemFallback } from './CanvasDemoSvgCustomItemRenderFallback'
import {
  getCanvasDemoSvgCustomItemRenderer,
  type CanvasDemoSvgCustomItemRenderers,
} from './CanvasDemoSvgCustomItemRendererRegistry'

export function renderCanvasDemoSvgCustomItem({
  item,
  renderers,
}: {
  item: CanvasCustomItem
  renderers: CanvasDemoSvgCustomItemRenderers
}) {
  const renderCustomItem = getCanvasDemoSvgCustomItemRenderer({
    item,
    renderers,
  })

  try {
    return renderCustomItem({ item })
  } catch {
    return renderCanvasDemoSvgCustomItemFallback({ item })
  }
}
