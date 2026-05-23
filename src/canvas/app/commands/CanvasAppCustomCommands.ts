import type { Dispatch, SetStateAction } from 'react'
import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../entities'
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

export function getCanvasAppCustomCommandStates({
  commands,
  context,
}: {
  commands: readonly CanvasAppCustomCommand[]
  context: CanvasAppCustomCommandContext
}): CanvasAppCustomCommandState[] {
  return commands.map((command) => ({
    ariaLabel: command.ariaLabel ?? command.title,
    disabled: command.isEnabled ? !command.isEnabled(context) : false,
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

  if (!command || (command.isEnabled && !command.isEnabled(context))) {
    return false
  }

  command.run(context)
  return true
}
