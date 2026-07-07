import type {
  CanvasCustomItem,
} from '../../entities'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppComponentRendererStrategy,
  CanvasAppCustomItemRendererEntry,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'
import {
  DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS,
  assertCanvasWhiteboardSvgComponentPresentationRenderers,
  createCanvasWhiteboardSvgComponentPresentationRenderers,
  getCanvasWhiteboardSvgComponentPresentationRenderer,
} from './CanvasWhiteboardSvgComponentPresentationRegistry'
import {
  DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS,
  assertCanvasWhiteboardSvgCustomItemRenderers,
  createCanvasWhiteboardSvgCustomItemRenderers,
  getCanvasWhiteboardSvgCustomItemRenderer,
} from './CanvasWhiteboardSvgCustomItemRendererRegistry'

export const DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS:
  CanvasAppComponentPresentationRenderers =
    DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS

export const DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS:
  CanvasAppCustomItemRenderers = DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS

export function assertCanvasAppComponentPresentationRenderers(
  renderers: CanvasAppComponentPresentationRenderers,
) {
  assertCanvasWhiteboardSvgComponentPresentationRenderers(renderers)
}

export function assertCanvasAppCustomItemRenderers(
  renderers: CanvasAppCustomItemRenderers,
) {
  assertCanvasWhiteboardSvgCustomItemRenderers(renderers)
}

export function createCanvasAppComponentPresentationRenderers(
  extensions: CanvasAppComponentPresentationRenderers = {},
): CanvasAppComponentPresentationRenderers {
  return createCanvasWhiteboardSvgComponentPresentationRenderers(extensions)
}

export function createCanvasAppCustomItemRenderers(
  extensions: CanvasAppCustomItemRenderers = {},
): CanvasAppCustomItemRenderers {
  return createCanvasWhiteboardSvgCustomItemRenderers(extensions)
}

export function getCanvasAppComponentPresentationRenderer({
  presentation,
  renderers,
}: {
  presentation: string
  renderers: CanvasAppComponentPresentationRenderers
}): CanvasAppComponentRendererStrategy {
  return getCanvasWhiteboardSvgComponentPresentationRenderer({
    presentation,
    renderers,
  })
}

export function getCanvasAppCustomItemRenderer({
  item,
  renderers,
}: {
  item: CanvasCustomItem
  renderers: CanvasAppCustomItemRenderers
}): CanvasAppCustomItemRendererEntry {
  return getCanvasWhiteboardSvgCustomItemRenderer({
    item,
    renderers,
  })
}
