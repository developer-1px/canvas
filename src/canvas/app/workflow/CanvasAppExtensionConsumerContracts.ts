import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../entities'
import type { CanvasAppCustomCommand } from '../extensions/custom-commands'
import type {
  CanvasAppCustomCommandState,
  CanvasAppCustomCreationToolState,
} from '../extensions/CanvasAppExtensionStateContracts'
import type { CanvasAppCustomCreationTool } from '../extensions/custom-tools/CanvasAppCustomCreationTools'
import type {
  CommitCanvasSelection,
} from './CanvasWorkflowContract'
import type { CanvasAppDocumentAuthority } from '../workspace/document/CanvasAppDocumentContracts'

export type CanvasAppExtensionRuntime = {
  customCommandStates: CanvasAppCustomCommandState[]
  customCreationToolStates: CanvasAppCustomCreationToolState[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  runCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionModelInput = {
  commitSelection: CommitCanvasSelection
  createId: (prefix: string) => string
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  document: CanvasAppDocumentAuthority
  items: CanvasItem[]
  selection: string[]
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  viewport: Viewport
}

export type CanvasAppExtensionControlContext = {
  customCommands: readonly CanvasAppCustomCommandState[]
  customTools: readonly CanvasAppCustomCreationToolState[]
  onRunCustomCommand: (commandId: string) => boolean
}

export type CanvasAppExtensionKeyboardContext = {
  customCommands: readonly CanvasAppCustomCommandState[]
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  runCustomCommand: (commandId: string) => void
}

export type CanvasAppExtensionPointerContext = {
  customCreationTools: readonly CanvasAppCustomCreationTool[]
}

export type CanvasAppExtensionModel = {
  control: CanvasAppExtensionControlContext
  keyboard: CanvasAppExtensionKeyboardContext
  pointer: CanvasAppExtensionPointerContext
}
