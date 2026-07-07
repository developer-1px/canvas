import type {
  CanvasAppExtensionModel,
  CanvasAppExtensionRuntime,
} from './CanvasAppExtensionConsumerContracts'

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
      customCommands: customCommandStates,
      customCreationTools: customCreationToolStates,
      runCustomCommand,
    },
    pointer: {
      customCreationTools,
    },
  }
}
