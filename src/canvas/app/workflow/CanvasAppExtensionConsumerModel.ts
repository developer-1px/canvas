import type { CanvasAppCustomCommandState } from '../commands/CanvasAppCustomCommandExecution'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'

type CanvasAppExtensionRuntime = {
  customCommandStates: CanvasAppCustomCommandState[]
  customCreationToolStates: CanvasAppCustomCreationToolState[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  runCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionModel = {
  control: {
    customCommands: readonly CanvasAppCustomCommandState[]
    customTools: readonly CanvasAppCustomCreationToolState[]
    onRunCustomCommand: (commandId: string) => boolean
  }
  keyboard: {
    customCreationTools: readonly CanvasAppCustomCreationToolState[]
  }
  pointer: {
    customCreationTools: readonly CanvasAppCustomCreationTool[]
  }
}

export function getCanvasAppExtensionConsumerModel({
  customCommandStates,
  customCreationToolStates,
  customCreationTools,
  runCustomCommand,
}: CanvasAppExtensionRuntime): CanvasAppExtensionModel {
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
