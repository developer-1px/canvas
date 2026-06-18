import type {
  Bounds,
  CanvasItem,
  EditingText,
} from '../../../entities'
import type { CanvasCommandItem } from '../../../engine'

export type CanvasClipboardItemsChange<
  TItem extends CanvasCommandItem = CanvasItem,
> =
  | { type: 'add'; items: TItem[] }
  | { type: 'remove-selection'; selection: string[] }
  | { type: 'transform'; afterItems: TItem[]; beforeItems: TItem[] }

export type CanvasClipboardSelectionHistory = {
  after: string[]
  before: string[]
}

export type CanvasClipboardSelectionUpdate =
  | string[]
  | ((current: string[]) => string[])

export type CanvasClipboardCommitItemsChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = (
  change: CanvasClipboardItemsChange<TItem>,
  selection?: CanvasClipboardSelectionHistory,
) => boolean

export type CanvasClipboardCommitSelection = (
  action: CanvasClipboardSelectionUpdate,
) => boolean

export type CanvasClipboardCopyItemsToClipboard = (
  selection: string[],
) => boolean

export type CanvasClipboardGetItems<
  TItem extends CanvasCommandItem = CanvasItem,
> = () => TItem[]

export type CanvasClipboardGetItemBounds<
  TItem extends CanvasCommandItem = CanvasItem,
> = (items: TItem[]) => Bounds | null

export type CanvasClipboardSetItems<
  TItem extends CanvasCommandItem = CanvasItem,
> = (items: TItem[]) => boolean

export type CanvasClipboardEditingUpdate =
  | EditingText
  | null
  | ((current: EditingText | null) => EditingText | null)

export type CanvasClipboardCommandExecutionResult<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  clonedItems: TItem[]
  executed: boolean
  nextPasteIndex?: number
}

export type CanvasClipboardCommandEffectContext<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  commitItemsChange: CanvasClipboardCommitItemsChange<TItem>
  commitSelection: CanvasClipboardCommitSelection
  copyItemsToClipboard: CanvasClipboardCopyItemsToClipboard
  selection: string[]
  setClipboardItems: CanvasClipboardSetItems<TItem>
  setEditing: (editing: CanvasClipboardEditingUpdate) => void
}

export type CanvasClipboardCommandEffect<
  TItem extends CanvasCommandItem = CanvasItem,
> =
  | {
      clonedItems: TItem[]
      kind: 'clone-result'
    }
  | {
      kind: 'copy-selection'
    }
  | {
      afterItems: TItem[]
      afterSelection: string[]
      beforeItems: TItem[]
      clonedItems: TItem[]
      kind: 'transform-items'
    }
  | {
      afterSelection: string[]
      items: TItem[]
      kind: 'add-items'
      nextPasteIndex?: number
      updateClipboardItems?: TItem[]
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
