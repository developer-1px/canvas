import type { EditingText } from '../../entities'
import type { CanvasAppItemsChange } from '../workspace/document/CanvasAppDocumentContracts'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'

export type CanvasEditingUpdate =
  | EditingText
  | null
  | ((current: EditingText | null) => EditingText | null)

export type CanvasStandardCommandDocumentEffectContext = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  redo: () => string[] | undefined
  selection: string[]
  setEditing: (editing: CanvasEditingUpdate) => void
  setSelection: (selection: string[]) => void
  undo: () => string[] | undefined
}

export type CanvasStandardCommandItemsChange = CanvasAppItemsChange

export type CanvasStandardCommandDocumentEffect =
  | {
      afterSelection?: string[]
      change: CanvasStandardCommandItemsChange
      clearEditingIds?: readonly string[]
      fallbackSelection?: string[]
      kind: 'items-change'
    }
  | {
      direction: 'redo' | 'undo'
      kind: 'history'
    }
  | {
      kind: 'selection'
      selection: string[]
    }
