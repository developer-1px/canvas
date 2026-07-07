import type { CanvasComponentItem } from '../../entities'
import {
  CANVAS_LINK_PREVIEW_COMPONENT_PRESENTATION,
  isCanvasLinkPreviewComponentItem,
} from '../../host'
import type { CanvasAppComponentRendererStrategy } from './CanvasAppRenderingContracts'
import {
  getCanvasWhiteboardSvgComponentFallbackRenderer,
  renderCanvasWhiteboardSvgComponentFallback,
} from './CanvasWhiteboardSvgComponentRenderFallback'
import {
  getCanvasWhiteboardSvgComponentPresentationRenderer,
  type CanvasWhiteboardSvgComponentPresentationRenderers,
} from './CanvasWhiteboardSvgComponentPresentationRegistry'

export function renderCanvasWhiteboardSvgComponentPresentation({
  getComponentPresentation,
  item,
  renderers,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
  renderers: CanvasWhiteboardSvgComponentPresentationRenderers
}) {
  const renderComponent = getCanvasWhiteboardSvgComponentRendererSafely({
    getComponentPresentation,
    item,
    renderers,
  })

  try {
    return renderComponent({ item })
  } catch {
    return renderCanvasWhiteboardSvgComponentFallback({ item })
  }
}

function getCanvasWhiteboardSvgComponentRendererSafely({
  getComponentPresentation,
  item,
  renderers,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
  renderers: CanvasWhiteboardSvgComponentPresentationRenderers
}): CanvasAppComponentRendererStrategy {
  try {
    const presentation = isCanvasLinkPreviewComponentItem(item)
      ? CANVAS_LINK_PREVIEW_COMPONENT_PRESENTATION
      : getComponentPresentation(item.component)

    return getCanvasWhiteboardSvgComponentPresentationRenderer({
      presentation,
      renderers,
    })
  } catch {
    return getCanvasWhiteboardSvgComponentFallbackRenderer()
  }
}
