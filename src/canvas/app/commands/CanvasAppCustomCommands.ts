import type { Dispatch, SetStateAction } from 'react'
import type {
  CanvasItem,
  EditingText,
  Viewport,
} from '../../entities'
import type {
  CanvasDocumentSelectionHistory,
  CanvasItemsChange,
} from '../../host'

export type CanvasAppCustomCommandCommitItemsChange = (
  change: CanvasItemsChange,
  selection?: CanvasDocumentSelectionHistory,
) => boolean

export type CanvasAppCustomCommandCommitSelection = (
  action: SetStateAction<string[]>,
) => boolean

export type CanvasAppCustomCommandContext = {
  commitItemsChange: CanvasAppCustomCommandCommitItemsChange
  commitSelection: CanvasAppCustomCommandCommitSelection
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
