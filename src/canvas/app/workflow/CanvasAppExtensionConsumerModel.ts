import type { CanvasAppCustomCommandState } from '../commands/CanvasAppCustomCommandExecution'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'

type CanvasAppExtensionRuntime = {
  customCommandStates: CanvasAppCustomCommandState[]
  customCreationToolStates: CanvasAppCustomCreationToolState[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  runCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionModel = ReturnType<
  typeof getCanvasAppExtensionConsumerModel
>

export function getCanvasAppExtensionConsumerModel({
  customCommandStates,
  customCreationToolStates,
  customCreationTools,
  runCustomCommand,
}: CanvasAppExtensionRuntime) {
  return {
    control: {
      customCommands: customCommandStates,
      customTools: customCreationToolStates,
      onRunCustomCommand: runCustomCommand,
    },
    keyboard: {
      customCreationTools: customCreationToolStates,
    },
    pointer: {
      customCreationTools,
    },
  }
}
