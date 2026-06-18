import type { SetStateAction } from 'react'
import type {
  Bounds,
  CanvasSelectionIds,
} from '../../../core'
import type { CanvasItem } from '../../../entities'
import type { CanvasCommandItem } from '../../../foundation'

export type CanvasAppItemsReorderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type CanvasAppItemsChange<
  TItem extends CanvasCommandItem = CanvasItem,
> =
  | { type: 'add'; items: TItem[] }
  | { type: 'group-selection'; groupId: string; selection: CanvasSelectionIds }
  | { type: 'remove-selection'; selection: CanvasSelectionIds }
  | { type: 'replace-changed'; items: TItem[] }
  | {
      type: 'reorder-selection'
      mode: CanvasAppItemsReorderMode
      selection: CanvasSelectionIds
    }
  | {
      type: 'resize-selection'
      from: Bounds
      selection: CanvasSelectionIds
      to: Bounds
    }
  | { type: 'set-text'; id: string; text: string }
  | { type: 'transform'; afterItems: TItem[]; beforeItems: TItem[] }
  | { type: 'ungroup-selection'; selection: CanvasSelectionIds }

export type CanvasAppDocumentSelectionHistory = {
  before: CanvasSelectionIds
  after: CanvasSelectionIds
}

export type CanvasAppDocumentClipboard = {
  copyItemsToClipboard: (selection: CanvasSelectionIds) => boolean
  getClipboardItems: () => CanvasItem[]
  setClipboardItems: (items: CanvasItem[]) => boolean
}

export type CanvasAppTextSearchField =
  | 'body'
  | 'columns'
  | 'items'
  | 'text'
  | 'title'

export type CanvasAppTextSearchMatch = {
  field: CanvasAppTextSearchField
  itemId: string
  occurrences: number
  path: string
  value: string
}

export type CanvasAppTextSearchOptions = {
  caseSensitive?: boolean
}

export type CanvasAppDocumentTextSearch = {
  findDocumentText: (
    text: string,
    options?: CanvasAppTextSearchOptions,
  ) => CanvasAppTextSearchMatch[]
  replaceDocumentText: (
    searchText: string,
    replacement: string,
    options?: CanvasAppTextSearchOptions,
  ) => boolean
}

export type CanvasAppCommitItemsChange<
  TItem extends CanvasCommandItem = CanvasItem,
> = (
  change: CanvasAppItemsChange<TItem>,
  selection?: CanvasAppDocumentSelectionHistory,
) => boolean

export type CanvasAppCommitSelection = (
  action: SetStateAction<string[]>,
) => boolean
