import type { CanvasComponentItem } from '../../entities'
import {
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasDemoSvgComponentPresentationRenderers,
} from './CanvasDemoSvgComponentPresentationRegistry'
import { renderCanvasDemoSvgComponentPresentation } from './CanvasDemoSvgComponentRendererExecution'

export function CanvasDemoSvgComponentRenderer({
  getComponentPresentation,
  item,
  renderers = DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
  renderers?: CanvasDemoSvgComponentPresentationRenderers
}) {
  return renderCanvasDemoSvgComponentPresentation({
    getComponentPresentation,
    item,
    renderers,
  })
}
