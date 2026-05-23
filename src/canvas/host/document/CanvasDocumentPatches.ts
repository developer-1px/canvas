import type { JSONPatchOperation, Pointer } from 'zod-crud'
import type { Bounds } from '../../core'
import type { CanvasItem } from '../model'
import {
  groupCanvasSelection,
  removeCanvasItems,
  reorderCanvasItems,
  resizeCanvasItems,
  type CanvasZOrderMode,
  ungroupCanvasSelection,
} from '../operations/CanvasOperations'
import {
  getCanvasEditableTextPatchOperation,
  isCanvasEditableTextItem,
} from '../text/CanvasEditableTextItem'
import {
  findCanvasItemEntry,
  isCanvasGroupItem,
} from '../tree/CanvasTree'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'
import {
  areCanvasDocumentPatchItemsEqual,
  createCanvasDocumentPatchTreeDiff,
  getCanvasDocumentPatchEntries,
  getCanvasDocumentPatchRemovalEntries,
} from './CanvasDocumentPatchTreeDiff'
import { createReorderCanvasSiblingArraysPatch } from './CanvasDocumentReorderPatch'

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
  const next = groupCanvasSelection(items, selection, groupId)

  if (areCanvasDocumentPatchItemsEqual(items, next.items)) {
    return []
  }

  const selected = new Set(selection)
  const groupedEntries = getCanvasDocumentPatchRemovalEntries(
    getCanvasDocumentPatchEntries(items).filter((entry) =>
      selected.has(entry.item.id),
    ),
  )
  const groupEntry = findCanvasItemEntry(next.items, groupId)

  if (!groupEntry || groupedEntries.length === 0) {
    return []
  }

  return [
    ...groupedEntries.map((entry): JSONPatchOperation => ({
      op: 'remove',
      path: canvasItemPathToPointer(entry.path),
    })),
    {
      op: 'add',
      path: canvasItemPathToPointer(groupEntry.path),
      value: groupEntry.item,
    },
  ]
}

export function createUngroupCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
): JSONPatchOperation[] {
  const next = ungroupCanvasSelection(items, selection)

  if (areCanvasDocumentPatchItemsEqual(items, next.items)) {
    return []
  }

  return getCanvasDocumentPatchRemovalEntries(
    getCanvasDocumentPatchEntries(items).filter(
      (entry) =>
        isCanvasGroupItem(entry.item) && selection.includes(entry.item.id),
    ),
  )
    .flatMap((entry): JSONPatchOperation[] => {
      if (!isCanvasGroupItem(entry.item)) {
        return []
      }

      return [
        {
          op: 'remove',
          path: canvasItemPathToPointer(entry.path),
        },
        ...entry.item.children.map((child, index): JSONPatchOperation => ({
          op: 'add',
          path: canvasItemPathToPointer([
            ...entry.parentPath,
            entry.index + index,
          ]),
          value: child,
        })),
      ]
    })
}

export function createReorderCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
  mode: CanvasZOrderMode,
): JSONPatchOperation[] {
  const nextItems = reorderCanvasItems(items, selection, mode)

  if (areCanvasDocumentPatchItemsEqual(items, nextItems)) {
    return []
  }

  return createReorderCanvasSiblingArraysPatch({
    afterItems: nextItems,
    beforeItems: items,
  })
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
    entry.item.text === text
  ) {
    return []
  }

  return [{
    op: getCanvasEditableTextPatchOperation(entry.item),
    path: `${canvasItemPathToPointer(entry.path)}/text` as Pointer,
    value: text,
  }]
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
  diff: ReturnType<typeof createCanvasDocumentPatchTreeDiff>,
): JSONPatchOperation[] {
  return diff.changedTopmostEntries.map((entry) => ({
    op: 'replace',
    path: canvasItemPathToPointer(entry.path),
    value: entry.item,
  }))
}
