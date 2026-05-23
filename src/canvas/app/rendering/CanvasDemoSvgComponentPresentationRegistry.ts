import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppComponentRendererStrategy,
} from './CanvasAppRenderingContracts'
import {
  getCanvasDemoSvgComponentFallbackRenderer,
} from './CanvasDemoSvgComponentRenderFallback'
import { assertCanvasDemoSvgComponentPresentationRenderers } from './CanvasDemoSvgComponentPresentationRegistryContracts'
import { DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasDemoSvgBuiltInComponentPresentationRenderers'

export { assertCanvasDemoSvgComponentPresentationRenderers } from './CanvasDemoSvgComponentPresentationRegistryContracts'
export { DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS } from './CanvasDemoSvgBuiltInComponentPresentationRenderers'

export type CanvasDemoSvgComponentRendererStrategy =
  CanvasAppComponentRendererStrategy

export type CanvasDemoSvgComponentPresentationRenderers =
  CanvasAppComponentPresentationRenderers

export function createCanvasDemoSvgComponentPresentationRenderers(
  extensions: CanvasDemoSvgComponentPresentationRenderers = {},
): CanvasDemoSvgComponentPresentationRenderers {
  assertCanvasDemoSvgComponentPresentationRenderers(extensions)

  return {
    ...DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
    ...extensions,
  }
}

export function getCanvasDemoSvgComponentPresentationRenderer({
  presentation,
  renderers,
}: {
  presentation: string
  renderers: CanvasDemoSvgComponentPresentationRenderers
}) {
  return renderers[presentation] ?? getCanvasDemoSvgComponentFallbackRenderer()
}
