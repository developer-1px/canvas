import type { CanvasCustomItem } from '../../entities'
import type {
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'
import { getCanvasDemoSvgCustomItemFallbackRenderer } from './CanvasDemoSvgCustomItemRenderFallback'
import { assertCanvasDemoSvgCustomItemRenderers } from './CanvasDemoSvgCustomItemRendererRegistryContracts'

export { assertCanvasDemoSvgCustomItemRenderers } from './CanvasDemoSvgCustomItemRendererRegistryContracts'

export type CanvasDemoSvgCustomItemRendererStrategy =
  CanvasAppCustomItemRendererStrategy

export type CanvasDemoSvgCustomItemRenderers = CanvasAppCustomItemRenderers

export const DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS: CanvasDemoSvgCustomItemRenderers = {}

export function createCanvasDemoSvgCustomItemRenderers(
  extensions: CanvasDemoSvgCustomItemRenderers = {},
): CanvasDemoSvgCustomItemRenderers {
  assertCanvasDemoSvgCustomItemRenderers(extensions)

  return { ...extensions }
}

export function getCanvasDemoSvgCustomItemRenderer({
  item,
  renderers,
}: {
  item: CanvasCustomItem
  renderers: CanvasDemoSvgCustomItemRenderers
}) {
  return (
    renderers[item.presentation] ?? getCanvasDemoSvgCustomItemFallbackRenderer()
  )
}
