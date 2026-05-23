import { assertCanvasAppDescriptorFunctionField } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'
import type { CanvasAppCustomItemRenderers } from './CanvasAppRenderingContracts'

export function assertCanvasDemoSvgCustomItemRenderers(
  renderers: CanvasAppCustomItemRenderers,
) {
  assertCanvasAppExtensionRecordKeys({
    entries: renderers,
    label: 'custom item renderer',
  })
  assertCanvasDemoSvgCustomItemRendererStrategies(renderers)
}

function assertCanvasDemoSvgCustomItemRendererStrategies(
  renderers: CanvasAppCustomItemRenderers,
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
