import type { CanvasCommandItem } from '../../../engine'
import type {
  CanvasItem,
  EditingText,
} from '../../../entities'
import type { CanvasAppItemsChange } from '../../workspace/document/CanvasAppDocumentContracts'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../../workflow/CanvasWorkflowContract'

export type CanvasEditingUpdate =
  | EditingText
  | null
  | ((current: EditingText | null) => EditingText | null)

export type CanvasStandardCommandDocumentEffectContext<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  commitItemsChange: CommitCanvasItemsChange<TItem>
  commitSelection: CommitCanvasSelection
  redo: () => string[] | undefined
  selection: string[]
  setEditing: (editing: CanvasEditingUpdate) => void
  setSelection: (selection: string[]) => void
  undo: () => string[] | undefined
}

export type CanvasStandardCommandItemsChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = CanvasAppItemsChange<TItem>

export type CanvasStandardCommandDocumentEffect<
  TItem extends CanvasCommandItem = CanvasItem,
> =
  | {
      afterSelection?: string[]
      change: CanvasStandardCommandItemsChange<TItem>
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
