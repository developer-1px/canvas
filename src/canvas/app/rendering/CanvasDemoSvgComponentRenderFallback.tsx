import type { CanvasComponentItem } from '../../entities'
import type { CanvasAppComponentRendererStrategy } from './CanvasAppRenderingContracts'
import { CanvasDemoSvgCardComponent } from './CanvasDemoSvgTextComponentRenderer'

export const CANVAS_DEMO_SVG_COMPONENT_FALLBACK_PRESENTATION =
  'accent-card'

export function getCanvasDemoSvgComponentFallbackRenderer(): CanvasAppComponentRendererStrategy {
  return CanvasDemoSvgCardComponent
}

export function renderCanvasDemoSvgComponentFallback({
  item,
}: {
  item: CanvasComponentItem
}) {
  return getCanvasDemoSvgComponentFallbackRenderer()({ item })
}
