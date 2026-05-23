import type { CanvasComponentItem } from '../../entities'
import {
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  getCanvasDemoSvgComponentPresentationRenderer,
  type CanvasDemoSvgComponentPresentationRenderers,
} from './CanvasDemoSvgComponentPresentationRegistry'

export function CanvasDemoSvgComponentRenderer({
  getComponentPresentation,
  item,
  renderers = DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
  renderers?: CanvasDemoSvgComponentPresentationRenderers
}) {
  const presentation = getComponentPresentation(item.component)
  const renderComponent = getCanvasDemoSvgComponentPresentationRenderer({
    presentation,
    renderers,
  })

  try {
    return renderComponent({ item })
  } catch {
    return DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS['accent-card']({
      item,
    })
  }
}
