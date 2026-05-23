import type { Bounds, CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../model'
import {
  commitCanvasItemsPatch,
  type CanvasItemsDocument,
} from './CanvasDocument'
import type { CanvasItemValidationOptions } from './CanvasItemSchema'
import {
  createAddCanvasItemsPatch,
  createGroupCanvasItemsPatch,
  createRemoveCanvasItemsPatch,
  createReorderCanvasItemsPatch,
  createReplaceChangedCanvasItemsPatch,
  createResizeCanvasItemsPatch,
  createSetCanvasItemTextPatch,
  createTransformCanvasItemsPatch,
  createUngroupCanvasItemsPatch,
} from './CanvasDocumentPatches'

type CanvasItemsReorderMode =
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type CanvasItemsChange =
  | { type: 'add'; items: CanvasItem[] }
  | { type: 'group-selection'; groupId: string; selection: string[] }
  | { type: 'remove-selection'; selection: string[] }
  | { type: 'replace-changed'; items: CanvasItem[] }
  | {
      type: 'reorder-selection'
      mode: CanvasItemsReorderMode
      selection: string[]
    }
  | {
      type: 'resize-selection'
      from: Bounds
      selection: string[]
      to: Bounds
    }
  | { type: 'set-text'; id: string; text: string }
  | { type: 'transform'; afterItems: CanvasItem[]; beforeItems: CanvasItem[] }
  | { type: 'ungroup-selection'; selection: string[] }

export function commitCanvasItemsChange({
  change,
  currentItems,
  document,
  selection,
  validation,
}: {
  change: CanvasItemsChange
  currentItems: CanvasItem[]
  document: CanvasItemsDocument
  validation?: CanvasItemValidationOptions
  selection?: {
    after: CanvasSelectionIds
    before: CanvasSelectionIds
  }
}) {
  return commitCanvasItemsPatch({
    document,
    patch: createCanvasItemsChangePatch(currentItems, change),
    selection,
    validation,
  })
}

function createCanvasItemsChangePatch(
  currentItems: CanvasItem[],
  change: CanvasItemsChange,
) {
  switch (change.type) {
    case 'add':
      return createAddCanvasItemsPatch(change.items)
    case 'group-selection':
      return createGroupCanvasItemsPatch(
        currentItems,
        change.selection,
        change.groupId,
      )
    case 'remove-selection':
      return createRemoveCanvasItemsPatch(currentItems, change.selection)
    case 'replace-changed':
      return createReplaceChangedCanvasItemsPatch(currentItems, change.items)
    case 'reorder-selection':
      return createReorderCanvasItemsPatch(
        currentItems,
        change.selection,
        change.mode,
      )
    case 'resize-selection':
      return createResizeCanvasItemsPatch(
        currentItems,
        change.selection,
        change.from,
        change.to,
      )
    case 'set-text':
      return createSetCanvasItemTextPatch(currentItems, change.id, change.text)
    case 'transform':
      return createTransformCanvasItemsPatch(
        change.beforeItems,
        change.afterItems,
      )
    case 'ungroup-selection':
      return createUngroupCanvasItemsPatch(currentItems, change.selection)
  }
}
