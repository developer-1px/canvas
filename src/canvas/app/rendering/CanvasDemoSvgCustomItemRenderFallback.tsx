import type { CanvasCustomItem } from '../../entities'
import type { CanvasAppCustomItemRendererStrategy } from './CanvasAppRenderingContracts'
import { CanvasDemoSvgUnknownCustomItem } from './CanvasDemoSvgUnknownCustomItem'

export function getCanvasDemoSvgCustomItemFallbackRenderer(): CanvasAppCustomItemRendererStrategy {
  return CanvasDemoSvgUnknownCustomItem
}

export function renderCanvasDemoSvgCustomItemFallback({
  item,
}: {
  item: CanvasCustomItem
}) {
  return getCanvasDemoSvgCustomItemFallbackRenderer()({ item })
}
