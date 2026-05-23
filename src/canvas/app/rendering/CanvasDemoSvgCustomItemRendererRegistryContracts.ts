import { assertCanvasAppRendererRegistry } from './CanvasAppRendererRegistryContracts'
import type { CanvasAppCustomItemRenderers } from './CanvasAppRenderingContracts'

export function assertCanvasDemoSvgCustomItemRenderers(
  renderers: CanvasAppCustomItemRenderers,
) {
  assertCanvasAppRendererRegistry({
    label: 'custom item renderer',
    renderers,
  })
}
