import type {
  CanvasAppCustomCommand,
  CanvasAppCustomCommandContext,
} from './CanvasAppCustomCommands'

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
