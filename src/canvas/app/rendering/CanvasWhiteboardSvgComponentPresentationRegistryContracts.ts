import { assertCanvasAppRendererRegistry } from './CanvasAppRendererRegistryContracts'
import type { CanvasAppComponentPresentationRenderers } from './CanvasAppRenderingContracts'

export function assertCanvasWhiteboardSvgComponentPresentationRenderers(
  renderers: CanvasAppComponentPresentationRenderers,
) {
  assertCanvasAppRendererRegistry({
    label: 'component presentation renderer',
    renderers,
  })
}
