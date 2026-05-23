import { assertCanvasAppDescriptorFunctionField } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'
import type { CanvasAppComponentPresentationRenderers } from './CanvasAppRenderingContracts'

export function assertCanvasDemoSvgComponentPresentationRenderers(
  renderers: CanvasAppComponentPresentationRenderers,
) {
  assertCanvasAppExtensionRecordKeys({
    entries: renderers,
    label: 'component presentation renderer',
  })
  assertCanvasDemoSvgComponentPresentationRendererStrategies(renderers)
}

function assertCanvasDemoSvgComponentPresentationRendererStrategies(
  renderers: CanvasAppComponentPresentationRenderers,
) {
  for (const [presentation, renderer] of Object.entries(renderers)) {
    if (typeof renderer !== 'function') {
      assertCanvasAppDescriptorFunctionField({
        field: 'render strategy',
        owner: `component presentation renderer ${presentation}`,
        value: renderer,
      })
    }
  }
}
