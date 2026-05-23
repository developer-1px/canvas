import type { Dispatch, SetStateAction } from 'react'
import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../entities'
import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorStringField,
  assertCanvasAppOptionalDescriptorFunctionField,
  assertCanvasAppOptionalDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionEntries } from '../extensions/CanvasAppExtensionIds'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'

export type CanvasAppCustomCommandContext = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  createId: (prefix: string) => string
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  viewport: Viewport
}

export type CanvasAppCustomCommand = {
  ariaLabel?: string
  id: string
  isEnabled?: (context: CanvasAppCustomCommandContext) => boolean
  label: string
  run: (context: CanvasAppCustomCommandContext) => void
  title: string
}

export {
  getCanvasAppCustomCommandStates,
  runCanvasAppCustomCommand,
  type CanvasAppCustomCommandState,
} from './CanvasAppCustomCommandExecution'

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
