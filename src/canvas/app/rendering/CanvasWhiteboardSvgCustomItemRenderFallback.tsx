import type { CanvasCustomItem } from '../../entities'
import type { CanvasAppCustomItemRendererStrategy } from './CanvasAppRenderingContracts'
import { CanvasWhiteboardSvgUnknownCustomItem } from './CanvasWhiteboardSvgUnknownCustomItem'

export function getCanvasWhiteboardSvgCustomItemFallbackRenderer(): CanvasAppCustomItemRendererStrategy {
  return CanvasWhiteboardSvgUnknownCustomItem
}

export function renderCanvasWhiteboardSvgCustomItemFallback({
  item,
}: {
  item: CanvasCustomItem
}) {
  return getCanvasWhiteboardSvgCustomItemFallbackRenderer()({ item })
}
