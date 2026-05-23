import type { CanvasAppCustomCommandState } from '../commands/CanvasAppCustomCommandExecution'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'

export type CanvasAppExtensionRuntime = {
  customCommandStates: CanvasAppCustomCommandState[]
  customCreationToolStates: CanvasAppCustomCreationToolState[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  runCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionControlContext = {
  customCommands: readonly CanvasAppCustomCommandState[]
  customTools: readonly CanvasAppCustomCreationToolState[]
  onRunCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionKeyboardContext = {
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
}

export type CanvasAppExtensionPointerContext = {
  customCreationTools: readonly CanvasAppCustomCreationTool[]
}

export type CanvasAppExtensionModel = {
  control: CanvasAppExtensionControlContext
  keyboard: CanvasAppExtensionKeyboardContext
  pointer: CanvasAppExtensionPointerContext
}
