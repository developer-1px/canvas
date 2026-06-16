import { assertCanvasAppRendererRegistry } from './CanvasAppRendererRegistryContracts'
import type { CanvasAppCustomItemRenderers } from './CanvasAppRenderingContracts'

export function assertCanvasDemoSvgCustomItemRenderers(
  renderers: CanvasAppCustomItemRenderers,
) {
  assertCanvasAppRendererRegistry({
    allowRenderDescriptors: true,
    label: 'custom item renderer',
    renderers,
  })
}
