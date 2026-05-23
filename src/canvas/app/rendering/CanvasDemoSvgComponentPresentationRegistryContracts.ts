import { assertCanvasAppRendererRegistry } from './CanvasAppRendererRegistryContracts'
import type { CanvasAppComponentPresentationRenderers } from './CanvasAppRenderingContracts'

export function assertCanvasDemoSvgComponentPresentationRenderers(
  renderers: CanvasAppComponentPresentationRenderers,
) {
  assertCanvasAppRendererRegistry({
    label: 'component presentation renderer',
    renderers,
  })
}
