import type { CanvasComponentItem } from '../../entities'
import {
  CANVAS_LINK_PREVIEW_COMPONENT_PRESENTATION,
  isCanvasLinkPreviewComponentItem,
} from '../../host'
import type { CanvasAppComponentRendererStrategy } from './CanvasAppRenderingContracts'
import {
  getCanvasDemoSvgComponentFallbackRenderer,
  renderCanvasDemoSvgComponentFallback,
} from './CanvasDemoSvgComponentRenderFallback'
import {
  getCanvasDemoSvgComponentPresentationRenderer,
  type CanvasDemoSvgComponentPresentationRenderers,
} from './CanvasDemoSvgComponentPresentationRegistry'

export function renderCanvasDemoSvgComponentPresentation({
  getComponentPresentation,
  item,
  renderers,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
  renderers: CanvasDemoSvgComponentPresentationRenderers
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
    const presentation = isCanvasLinkPreviewComponentItem(item)
      ? CANVAS_LINK_PREVIEW_COMPONENT_PRESENTATION
      : getComponentPresentation(item.component)

    return getCanvasDemoSvgComponentPresentationRenderer({
      presentation,
      renderers,
    })
  } catch {
    return getCanvasDemoSvgComponentFallbackRenderer()
  }
}
