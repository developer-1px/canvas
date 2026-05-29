import type { JSONPatchOperation, Pointer } from 'zod-crud'
import type { Bounds } from '../../core'
import type { CanvasItem } from '../model'
import {
  removeCanvasItems,
  resizeCanvasItems,
  type CanvasZOrderMode,
} from '../operations/CanvasOperations'
import {
  getCanvasEditableTextPatchUpdates,
  getCanvasEditableTextValue,
  isCanvasEditableTextItem,
} from '../text/CanvasEditableTextItem'
import {
  findCanvasItemEntry,
} from '../tree/CanvasTree'
import {
  createCanvasDocumentGroupPatch,
  createCanvasDocumentUngroupPatch,
} from './CanvasDocumentGroupingPatch'
import { createCanvasDocumentLayerOrderPatch } from './CanvasDocumentLayerOrderPatch'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'
import {
  createCanvasDocumentPatchTreeDiff,
  type CanvasDocumentPatchTreeDiff,
} from './CanvasDocumentPatchTreeDiff'

export function createRemoveCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
): JSONPatchOperation[] {
  const nextItems = removeCanvasItems(items, selection)
  const diff = createCanvasDocumentPatchTreeDiff({
    afterItems: nextItems,
    beforeItems: items,
  })

  if (diff.removalEntries.length === 0) {
    return []
  }

  const removeOps = diff.removalEntries.map((entry): JSONPatchOperation => ({
    op: 'remove',
    path: canvasItemPathToPointer(entry.path),
  }))
  const replaceGroupOps =
    diff.changedTopmostGroupEntries.map((entry): JSONPatchOperation => ({
      op: 'replace',
      path: canvasItemPathToPointer(entry.path),
      value: entry.item,
    }))

  return [...removeOps, ...replaceGroupOps]
}

export function createAddCanvasItemsPatch(
  items: CanvasItem[],
): JSONPatchOperation[] {
  return items.map((item) => ({
    op: 'add',
    path: '/-',
    value: item,
  }))
}

export function createGroupCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
  groupId: string,
): JSONPatchOperation[] {
  return createCanvasDocumentGroupPatch({ groupId, items, selection })
}

export function createUngroupCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
): JSONPatchOperation[] {
  return createCanvasDocumentUngroupPatch({ items, selection })
}

export function createReorderCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
  mode: CanvasZOrderMode,
): JSONPatchOperation[] {
  return createCanvasDocumentLayerOrderPatch({ items, mode, selection })
}

export function createResizeCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
  from: Bounds,
  to: Bounds,
): JSONPatchOperation[] {
  return createReplaceChangedCanvasItemsPatch(
    items,
    resizeCanvasItems(items, selection, from, to),
  )
}

export function createTransformCanvasItemsPatch(
  beforeItems: CanvasItem[],
  afterItems: CanvasItem[],
): JSONPatchOperation[] {
  const diff = createCanvasDocumentPatchTreeDiff({
    afterItems,
    beforeItems,
  })
  const beforeRootIds = new Set(beforeItems.map((item) => item.id))
  const addedRootItems = afterItems.filter((item) => !beforeRootIds.has(item.id))

  return [
    ...createReplaceChangedCanvasItemsPatchFromDiff(diff),
    ...createAddCanvasItemsPatch(addedRootItems),
  ]
}

export function createSetCanvasItemTextPatch(
  items: CanvasItem[],
  id: string,
  text: string,
): JSONPatchOperation[] {
  const entry = findCanvasItemEntry(items, id)

  if (
    !entry ||
    !isCanvasEditableTextItem(entry.item) ||
    getCanvasEditableTextValue(entry.item) === text
  ) {
    return []
  }
  return getCanvasEditableTextPatchUpdates(entry.item, text)
    .map((update): JSONPatchOperation => ({
      op: update.operation,
      path: `${canvasItemPathToPointer(entry.path)}/${update.field}` as Pointer,
      value: update.value,
    }))
}

export function createReplaceChangedCanvasItemsPatch(
  beforeItems: CanvasItem[],
  afterItems: CanvasItem[],
): JSONPatchOperation[] {
  return createReplaceChangedCanvasItemsPatchFromDiff(
    createCanvasDocumentPatchTreeDiff({
      afterItems,
      beforeItems,
    }),
  )
}

function createReplaceChangedCanvasItemsPatchFromDiff(
  diff: CanvasDocumentPatchTreeDiff,
): JSONPatchOperation[] {
  return diff.changedTopmostEntries.map((entry) => ({
    op: 'replace',
    path: canvasItemPathToPointer(entry.path),
    value: entry.item,
  }))
}
