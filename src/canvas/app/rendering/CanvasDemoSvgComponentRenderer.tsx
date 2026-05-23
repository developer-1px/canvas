import type { CanvasComponentItem } from '../../entities'
import type { CanvasAppComponentRendererStrategy } from './CanvasAppRenderingContracts'
import {
  getCanvasDemoSvgComponentFallbackRenderer,
  renderCanvasDemoSvgComponentFallback,
} from './CanvasDemoSvgComponentRenderFallback'
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
  const renderComponent = getCanvasDemoSvgComponentRendererSafely({
    getComponentPresentation,
    item,
    renderers,
  })

  try {
    return renderComponent({ item })
  } catch {
    return renderCanvasDemoSvgComponentFallback({ item })
  }
}

function getCanvasDemoSvgComponentRendererSafely({
  getComponentPresentation,
  item,
  renderers,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
  renderers: CanvasDemoSvgComponentPresentationRenderers
}): CanvasAppComponentRendererStrategy {
  try {
    const presentation = getComponentPresentation(item.component)

    return getCanvasDemoSvgComponentPresentationRenderer({
      presentation,
      renderers,
    })
  } catch {
    return getCanvasDemoSvgComponentFallbackRenderer()
  }
}
