import type { CanvasComponentItem } from '../../entities'
import type { CanvasAppComponentRendererStrategy } from './CanvasAppRenderingContracts'
import { CanvasWhiteboardSvgCardComponent } from './CanvasWhiteboardSvgTextComponentRenderer'

export const CANVAS_WHITEBOARD_SVG_COMPONENT_FALLBACK_PRESENTATION =
  'accent-card'

export function getCanvasWhiteboardSvgComponentFallbackRenderer(): CanvasAppComponentRendererStrategy {
  return CanvasWhiteboardSvgCardComponent
}

export function renderCanvasWhiteboardSvgComponentFallback({
  item,
}: {
  item: CanvasComponentItem
}) {
  return getCanvasWhiteboardSvgComponentFallbackRenderer()({ item })
}
