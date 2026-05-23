import type { CanvasCustomItemValidators } from '../../host'
import { assertCanvasAppDescriptorFunctionField } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'

export function assertCanvasAppCustomItemValidators(
  customItemValidators: CanvasCustomItemValidators,
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
