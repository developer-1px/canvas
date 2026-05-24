import type {
  CanvasItem,
  EditingText,
} from '../../entities'
import type {
  CanvasDocumentClipboard,
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'

export type CanvasClipboardEditingUpdate =
  | EditingText
  | null
  | ((current: EditingText | null) => EditingText | null)

export type CanvasClipboardCommandExecutionResult = {
  clonedItems: CanvasItem[]
  executed: boolean
  nextPasteIndex?: number
}

export type CanvasClipboardCommandEffectContext = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  copyItemsToClipboard: CanvasDocumentClipboard['copyItemsToClipboard']
  selection: string[]
  setClipboardItems: CanvasDocumentClipboard['setClipboardItems']
  setEditing: (editing: CanvasClipboardEditingUpdate) => void
}

export type CanvasClipboardCommandEffect =
  | {
      clonedItems: CanvasItem[]
      kind: 'clone-result'
    }
  | {
      kind: 'copy-selection'
    }
  | {
      afterSelection: string[]
      items: CanvasItem[]
      kind: 'add-items'
      nextPasteIndex?: number
      updateClipboardItems?: CanvasItem[]
    }
  | {
      clearEditingIds: readonly string[]
      copyBeforeDelete: boolean
      deletionSelection: string[]
      kind: 'cut-selection'
    }
  | {
      copyBeforeDelete: boolean
      kind: 'cut-copy-only'
    }
