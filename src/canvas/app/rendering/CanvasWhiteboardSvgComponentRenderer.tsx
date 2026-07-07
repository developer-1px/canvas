import type { CanvasComponentItem } from '../../entities'
import {
  DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasWhiteboardSvgComponentPresentationRenderers,
} from './CanvasWhiteboardSvgComponentPresentationRegistry'
import { renderCanvasWhiteboardSvgComponentPresentation } from './CanvasWhiteboardSvgComponentRendererExecution'

export function CanvasWhiteboardSvgComponentRenderer({
  getComponentPresentation,
  item,
  renderers = DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
  renderers?: CanvasWhiteboardSvgComponentPresentationRenderers
}) {
  return renderCanvasWhiteboardSvgComponentPresentation({
    getComponentPresentation,
    item,
    renderers,
  })
}
