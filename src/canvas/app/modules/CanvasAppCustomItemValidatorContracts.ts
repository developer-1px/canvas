import type { CanvasCustomItem } from '../../entities'
import { assertCanvasAppDescriptorFunctionField } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'

export type CanvasAppCustomItemValidator = (
  item: CanvasCustomItem,
) => boolean

export type CanvasAppCustomItemValidators = Readonly<
  Record<string, CanvasAppCustomItemValidator>
>

export function assertCanvasAppCustomItemValidators(
  customItemValidators: CanvasAppCustomItemValidators,
) {
  assertCanvasAppExtensionRecordKeys({
    entries: customItemValidators,
    label: 'custom item validator',
  })

  for (const [kind, validator] of Object.entries(customItemValidators)) {
    assertCanvasAppDescriptorFunctionField({
      field: 'validate strategy',
      owner: `custom item validator ${kind}`,
      value: validator,
    })
  }
}
