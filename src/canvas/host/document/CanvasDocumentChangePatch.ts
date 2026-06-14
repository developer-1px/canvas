import type { JSONPatchOperation } from '@interactive-os/json-document'
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

type CanvasItemsChangePatchBuilder<
  TType extends CanvasItemsChange['type'],
> = (args: {
  change: Extract<CanvasItemsChange, { type: TType }>
  currentItems: CanvasItem[]
}) => JSONPatchOperation[]

type CanvasItemsChangePatchBuilders = {
  [TType in CanvasItemsChange['type']]: CanvasItemsChangePatchBuilder<TType>
}

type CanvasItemsAnyChangePatchBuilder = (args: {
  change: CanvasItemsChange
  currentItems: CanvasItem[]
}) => JSONPatchOperation[]

const CANVAS_ITEMS_CHANGE_PATCH_BUILDERS = Object.freeze({
  add: ({ change }) => createAddCanvasItemsPatch(change.items),
  'group-selection': ({ change, currentItems }) =>
    createGroupCanvasItemsPatch(
      currentItems,
      change.selection,
      change.groupId,
    ),
  'remove-selection': ({ change, currentItems }) =>
    createRemoveCanvasItemsPatch(currentItems, change.selection),
  'replace-changed': ({ change, currentItems }) =>
    createReplaceChangedCanvasItemsPatch(currentItems, change.items),
  'reorder-selection': ({ change, currentItems }) =>
    createReorderCanvasItemsPatch(
      currentItems,
      change.selection,
      change.mode,
    ),
  'resize-selection': ({ change, currentItems }) =>
    createResizeCanvasItemsPatch(
      currentItems,
      change.selection,
      change.from,
      change.to,
    ),
  'set-text': ({ change, currentItems }) =>
    createSetCanvasItemTextPatch(currentItems, change.id, change.text),
  transform: ({ change }) =>
    createTransformCanvasItemsPatch(change.beforeItems, change.afterItems),
  'ungroup-selection': ({ change, currentItems }) =>
    createUngroupCanvasItemsPatch(currentItems, change.selection),
} satisfies CanvasItemsChangePatchBuilders)

export function createCanvasItemsChangePatch(
  currentItems: CanvasItem[],
  change: CanvasItemsChange,
) {
  const builder = CANVAS_ITEMS_CHANGE_PATCH_BUILDERS[
    change.type
  ] as CanvasItemsAnyChangePatchBuilder

  return builder({ change, currentItems })
}
