import type { CanvasCustomItem } from '../../entities'
import type {
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'
import { getCanvasWhiteboardSvgCustomItemFallbackRenderer } from './CanvasWhiteboardSvgCustomItemRenderFallback'
import { assertCanvasWhiteboardSvgCustomItemRenderers } from './CanvasWhiteboardSvgCustomItemRendererRegistryContracts'

export { assertCanvasWhiteboardSvgCustomItemRenderers } from './CanvasWhiteboardSvgCustomItemRendererRegistryContracts'

export type CanvasWhiteboardSvgCustomItemRendererStrategy =
  CanvasAppCustomItemRendererStrategy

export type CanvasWhiteboardSvgCustomItemRenderers = CanvasAppCustomItemRenderers

export const DEFAULT_CANVAS_WHITEBOARD_SVG_CUSTOM_ITEM_RENDERERS: CanvasWhiteboardSvgCustomItemRenderers = {}

export function createCanvasWhiteboardSvgCustomItemRenderers(
  extensions: CanvasWhiteboardSvgCustomItemRenderers = {},
): CanvasWhiteboardSvgCustomItemRenderers {
  assertCanvasWhiteboardSvgCustomItemRenderers(extensions)

  return { ...extensions }
}

export function getCanvasWhiteboardSvgCustomItemRenderer({
  item,
  renderers,
}: {
  item: CanvasCustomItem
  renderers: CanvasWhiteboardSvgCustomItemRenderers
}) {
  return (
    renderers[item.presentation] ?? getCanvasWhiteboardSvgCustomItemFallbackRenderer()
  )
}
