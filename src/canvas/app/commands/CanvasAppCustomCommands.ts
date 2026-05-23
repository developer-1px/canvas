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

export type CanvasAppCustomCommandState = {
  ariaLabel: string
  disabled: boolean
  id: string
  label: string
  title: string
}

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

export function getCanvasAppCustomCommandStates({
  commands,
  context,
}: {
  commands: readonly CanvasAppCustomCommand[]
  context: CanvasAppCustomCommandContext
}): CanvasAppCustomCommandState[] {
  return commands.map((command) => ({
    ariaLabel: command.ariaLabel ?? command.title,
    disabled: isCanvasAppCustomCommandDisabled(command, context),
    id: command.id,
    label: command.label,
    title: command.title,
  }))
}

export function runCanvasAppCustomCommand({
  commandId,
  commands,
  context,
}: {
  commandId: string
  commands: readonly CanvasAppCustomCommand[]
  context: CanvasAppCustomCommandContext
}) {
  const command = commands.find((entry) => entry.id === commandId)

  if (!command || isCanvasAppCustomCommandDisabled(command, context)) {
    return false
  }

  try {
    command.run(context)
    return true
  } catch {
    // External commands must not tear down the app command loop.
    return false
  }
}

function isCanvasAppCustomCommandDisabled(
  command: CanvasAppCustomCommand,
  context: CanvasAppCustomCommandContext,
) {
  if (!command.isEnabled) {
    return false
  }

  try {
    return !command.isEnabled(context)
  } catch {
    return true
  }
}
