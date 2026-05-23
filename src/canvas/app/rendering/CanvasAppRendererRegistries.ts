import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'
import {
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  assertCanvasDemoSvgComponentPresentationRenderers,
  createCanvasDemoSvgComponentPresentationRenderers,
  getCanvasDemoSvgComponentPresentationRenderer,
} from './CanvasDemoSvgComponentPresentationRegistry'
import {
  DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
  assertCanvasDemoSvgCustomItemRenderers,
  createCanvasDemoSvgCustomItemRenderers,
  getCanvasDemoSvgCustomItemRenderer,
} from './CanvasDemoSvgCustomItemRendererRegistry'

export type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppComponentRendererStrategy,
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'

export const DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS:
  CanvasAppComponentPresentationRenderers =
    DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS

export const DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS:
  CanvasAppCustomItemRenderers = DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS

export function assertCanvasAppComponentPresentationRenderers(
  renderers: CanvasAppComponentPresentationRenderers,
) {
  assertCanvasDemoSvgComponentPresentationRenderers(renderers)
}

export function assertCanvasAppCustomItemRenderers(
  renderers: CanvasAppCustomItemRenderers,
) {
  assertCanvasDemoSvgCustomItemRenderers(renderers)
}

export function createCanvasAppComponentPresentationRenderers(
  extensions: CanvasAppComponentPresentationRenderers = {},
): CanvasAppComponentPresentationRenderers {
  return createCanvasDemoSvgComponentPresentationRenderers(extensions)
}

export function createCanvasAppCustomItemRenderers(
  extensions: CanvasAppCustomItemRenderers = {},
): CanvasAppCustomItemRenderers {
  return createCanvasDemoSvgCustomItemRenderers(extensions)
}

export function getCanvasAppComponentPresentationRenderer({
  presentation,
  renderers,
}: {
  presentation: string
  renderers: CanvasAppComponentPresentationRenderers
}) {
  return getCanvasDemoSvgComponentPresentationRenderer({
    presentation,
    renderers,
  })
}

export function getCanvasAppCustomItemRenderer(
  input: Parameters<typeof getCanvasDemoSvgCustomItemRenderer>[0],
) {
  return getCanvasDemoSvgCustomItemRenderer(input)
}
