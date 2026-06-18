import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'

export function assertCanvasAppRendererRegistry({
  allowRenderDescriptors = false,
  label,
  renderers,
}: {
  allowRenderDescriptors?: boolean
  label: string
  renderers: Readonly<Record<string, unknown>>
}) {
  assertCanvasAppExtensionRecordKeys({
    entries: renderers,
    label,
  })

  for (const [rendererId, renderer] of Object.entries(renderers)) {
    if (typeof renderer === 'function') {
      continue
    }

    if (
      allowRenderDescriptors &&
      renderer !== null &&
      typeof renderer === 'object' &&
      !Array.isArray(renderer)
    ) {
      assertCanvasAppDescriptorObject(
        renderer,
        `${label} ${rendererId}`,
      )
      assertCanvasAppDescriptorFunctionField({
        field: 'render strategy',
        owner: `${label} ${rendererId}`,
        value: renderer.renderItem,
      })
      assertCanvasAppDescriptorFunctionField({
        field: 'render key strategy',
        owner: `${label} ${rendererId}`,
        value: renderer.getRenderKey,
      })
      continue
    }

    assertCanvasAppDescriptorFunctionField({
      field: 'render strategy',
      owner: `${label} ${rendererId}`,
      value: renderer,
    })
  }
}
