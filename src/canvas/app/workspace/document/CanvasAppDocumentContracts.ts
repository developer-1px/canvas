import type { SetStateAction } from 'react'
import type {
  Bounds,
  CanvasSelectionIds,
} from '../../../core'
import type { CanvasItem } from '../../../entities'
import type {
  CanvasAppCapability,
  CanvasAppCapabilitySnapshot,
} from '../../CanvasAppCapabilityContracts'

export type CanvasAppItemsReorderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type CanvasAppItemsChange =
  | { type: 'add'; items: CanvasItem[] }
  | { type: 'group-selection'; groupId: string; selection: CanvasSelectionIds }
  | { type: 'remove-selection'; selection: CanvasSelectionIds }
  | { type: 'replace-changed'; items: CanvasItem[] }
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
  | { type: 'transform'; afterItems: CanvasItem[]; beforeItems: CanvasItem[] }
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

export type CanvasAppCommitItemsChange = (
  change: CanvasAppItemsChange,
  selection?: CanvasAppDocumentSelectionHistory,
) => boolean

export type CanvasAppCommitSelection = (
  action: SetStateAction<string[]>,
) => boolean

export type CanvasAppDocumentMutationCapability =
  | 'comment'
  | 'editDocument'

export type CanvasAppDocumentMutationResult =
  | { readonly ok: true }
  | {
      readonly code: 'capability-denied'
      readonly ok: false
      readonly requiredCapability: CanvasAppDocumentMutationCapability
    }
  | {
      readonly code: 'mutation-rejected'
      readonly ok: false
    }

export type CanvasAppDocumentAuthorityRead = {
  readonly capabilities: CanvasAppCapabilitySnapshot
  can(capability: CanvasAppCapability): boolean
}

export type CanvasAppDocumentAuthority = CanvasAppDocumentAuthorityRead & {
  commit(input: {
    readonly change: CanvasAppItemsChange
    readonly selection?: CanvasAppDocumentSelectionHistory
  }): CanvasAppDocumentMutationResult
}
