import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppComponentRendererStrategy,
} from './CanvasAppRenderingContracts'
import {
  getCanvasWhiteboardSvgComponentFallbackRenderer,
} from './CanvasWhiteboardSvgComponentRenderFallback'
import { assertCanvasWhiteboardSvgComponentPresentationRenderers } from './CanvasWhiteboardSvgComponentPresentationRegistryContracts'
import { DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasWhiteboardSvgBuiltInComponentPresentationRenderers'

export { assertCanvasWhiteboardSvgComponentPresentationRenderers } from './CanvasWhiteboardSvgComponentPresentationRegistryContracts'
export { DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasWhiteboardSvgBuiltInComponentPresentationRenderers'

export type CanvasWhiteboardSvgComponentRendererStrategy =
  CanvasAppComponentRendererStrategy

export type CanvasWhiteboardSvgComponentPresentationRenderers =
  CanvasAppComponentPresentationRenderers

export function createCanvasWhiteboardSvgComponentPresentationRenderers(
  extensions: CanvasWhiteboardSvgComponentPresentationRenderers = {},
): CanvasWhiteboardSvgComponentPresentationRenderers {
  assertCanvasWhiteboardSvgComponentPresentationRenderers(extensions)

  return {
    ...DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
    ...extensions,
  }
}

export function getCanvasWhiteboardSvgComponentPresentationRenderer({
  presentation,
  renderers,
}: {
  presentation: string
  renderers: CanvasWhiteboardSvgComponentPresentationRenderers
}) {
  return renderers[presentation] ?? getCanvasWhiteboardSvgComponentFallbackRenderer()
}
