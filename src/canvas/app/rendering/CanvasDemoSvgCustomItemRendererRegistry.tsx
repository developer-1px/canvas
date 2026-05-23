import type { CanvasCustomItem } from '../../entities'
import { assertCanvasAppDescriptorFunctionField } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'
import type {
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderers,
} from './CanvasAppRenderingContracts'
import { getCanvasDemoSvgCustomItemFallbackRenderer } from './CanvasDemoSvgCustomItemRenderFallback'

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

export function assertCanvasDemoSvgCustomItemRenderers(
  renderers: CanvasDemoSvgCustomItemRenderers,
) {
  assertCanvasAppExtensionRecordKeys({
    entries: renderers,
    label: 'custom item renderer',
  })
  assertCanvasDemoSvgCustomItemRendererStrategies(renderers)
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

function assertCanvasDemoSvgCustomItemRendererStrategies(
  renderers: CanvasDemoSvgCustomItemRenderers,
) {
  for (const [presentation, renderer] of Object.entries(renderers)) {
    if (typeof renderer !== 'function') {
      assertCanvasAppDescriptorFunctionField({
        field: 'render strategy',
        owner: `custom item renderer ${presentation}`,
        value: renderer,
      })
    }
  }
}
