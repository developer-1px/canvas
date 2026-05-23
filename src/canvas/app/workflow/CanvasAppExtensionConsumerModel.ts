import type {
  CanvasAppExtensionModel,
  CanvasAppExtensionRuntime,
} from './CanvasAppConsumerContracts'

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
