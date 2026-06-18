import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorStringField,
  assertCanvasAppOptionalDescriptorFunctionField,
  assertCanvasAppOptionalDescriptorStringField,
} from '../CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionEntries } from '../CanvasAppExtensionIds'
import type { CanvasAppCustomCommand } from './CanvasAppCustomCommands'

export function assertCanvasAppCustomCommands(
  commands: readonly CanvasAppCustomCommand[],
) {
  assertCanvasAppExtensionEntries({
    entries: commands,
    label: 'custom command',
  })

  for (const command of commands) {
    const owner = `custom command ${command.id}`

    assertCanvasAppDescriptorStringField({
      field: 'label',
      owner,
      value: command.label,
    })
    assertCanvasAppDescriptorStringField({
      field: 'title',
      owner,
      value: command.title,
    })
    assertCanvasAppOptionalDescriptorStringField({
      field: 'ariaLabel',
      owner,
      value: command.ariaLabel,
    })
    assertCanvasAppDescriptorFunctionField({
      field: 'run',
      owner,
      value: command.run,
    })
    assertCanvasAppOptionalDescriptorFunctionField({
      field: 'isEnabled',
      owner,
      value: command.isEnabled,
    })
  }
}
