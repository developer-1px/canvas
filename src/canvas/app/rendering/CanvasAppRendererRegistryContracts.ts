import { assertCanvasAppDescriptorFunctionField } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'

export function assertCanvasAppRendererRegistry({
  label,
  renderers,
}: {
  label: string
  renderers: Readonly<Record<string, unknown>>
}) {
  assertCanvasAppExtensionRecordKeys({
    entries: renderers,
    label,
  })

  for (const [rendererId, renderer] of Object.entries(renderers)) {
    assertCanvasAppDescriptorFunctionField({
      field: 'render strategy',
      owner: `${label} ${rendererId}`,
      value: renderer,
    })
  }
}
