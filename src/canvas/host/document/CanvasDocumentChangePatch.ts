import type { Bounds, CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../model'
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
  | { type: 'group-selection'; groupId: string; selection: CanvasSelectionIds }
  | { type: 'remove-selection'; selection: CanvasSelectionIds }
  | { type: 'replace-changed'; items: CanvasItem[] }
  | {
      type: 'reorder-selection'
      mode: CanvasItemsReorderMode
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

export function createCanvasItemsChangePatch(
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
