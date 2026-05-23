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

export { assertCanvasAppCustomCommands } from './CanvasAppCustomCommandContracts'

export {
  getCanvasAppCustomCommandStates,
  runCanvasAppCustomCommand,
  type CanvasAppCustomCommandState,
} from './CanvasAppCustomCommandExecution'
