import {
  assertCanvasAppDescriptorFunctionField,
} from '../CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionEntries,
} from '../CanvasAppExtensionIds'
import type {
  CanvasAppItemsChangeTransformer,
} from './CanvasAppItemsChangeTransformers'

export function assertCanvasAppItemsChangeTransformers(
  transformers: readonly CanvasAppItemsChangeTransformer[],
) {
  assertCanvasAppExtensionEntries({
    entries: transformers,
    label: 'items change transformer',
  })

  for (const transformer of transformers) {
    assertCanvasAppDescriptorFunctionField({
      field: 'transform',
      owner: `items change transformer ${transformer.id}`,
      value: transformer.transform,
    })
  }
}
