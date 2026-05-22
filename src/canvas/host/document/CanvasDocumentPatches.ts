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
  findCanvasItemEntry,
  flattenCanvasItems,
  type CanvasItemEntry,
} from '../tree/CanvasTree'
import { isAncestorPath } from '../tree/CanvasTreePath'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'

export function createRemoveCanvasItemsPatch(
  items: CanvasItem[],
  selection: string[],
): JSONPatchOperation[] {
  const nextItems = removeCanvasItems(items, selection)
  const beforeEntries = flattenCanvasItems(items)
  const afterEntries = flattenCanvasItems(nextItems)
  const afterIds = new Set(afterEntries.map((entry) => entry.item.id))
  const removedEntries = beforeEntries.filter(
    (entry) => !afterIds.has(entry.item.id),
  )

  if (removedEntries.length === 0) {
    return []
  }

  const removeOps = getTopmostEntries(removedEntries)
    .sort(compareEntriesByDescendingPath)
    .map((entry): JSONPatchOperation => ({
      op: 'remove',
      path: canvasItemPathToPointer(entry.path),
    }))
  const replaceGroupOps = getChangedTopmostGroups(
    beforeEntries,
    afterEntries,
  ).map((entry): JSONPatchOperation => ({
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

  if (canvasItemsEqual(items, next.items)) {
    return []
  }

  const selected = new Set(selection)
  const groupedEntries = getTopmostEntries(
    flattenCanvasItems(items).filter((entry) => selected.has(entry.item.id)),
  )
  const groupEntry = findCanvasItemEntry(next.items, groupId)

  if (!groupEntry || groupedEntries.length === 0) {
    return []
  }

  return [
    ...groupedEntries
      .sort(compareEntriesByDescendingPath)
      .map((entry): JSONPatchOperation => ({
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

  if (canvasItemsEqual(items, next.items)) {
    return []
  }

  return getTopmostEntries(
    flattenCanvasItems(items).filter(
      (entry) => entry.item.type === 'group' && selection.includes(entry.item.id),
    ),
  )
    .sort(compareEntriesByDescendingPath)
    .flatMap((entry): JSONPatchOperation[] => {
      if (entry.item.type !== 'group') {
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

  if (canvasItemsEqual(items, nextItems)) {
    return []
  }

  const afterArrays = new Map(
    collectCanvasSiblingArrays(nextItems).map((entry) => [
      entry.parentId,
      entry.items.map((item) => item.id),
    ]),
  )

  return collectCanvasSiblingArrays(items)
    .sort((left, right) => right.parentPath.length - left.parentPath.length)
    .flatMap((entry) =>
      createReorderSiblingArrayPatch(
        entry.arrayPointer,
        entry.items.map((item) => item.id),
        afterArrays.get(entry.parentId) ?? [],
      ),
    )
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
  const beforeRootIds = new Set(beforeItems.map((item) => item.id))
  const addedRootItems = afterItems.filter((item) => !beforeRootIds.has(item.id))

  return [
    ...createReplaceChangedCanvasItemsPatch(beforeItems, afterItems),
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
    (entry.item.type !== 'rect' && entry.item.type !== 'text') ||
    entry.item.text === text
  ) {
    return []
  }

  return [{
    op: entry.item.type === 'rect' && entry.item.text === undefined
      ? 'add'
      : 'replace',
    path: `${canvasItemPathToPointer(entry.path)}/text` as Pointer,
    value: text,
  }]
}

export function createReplaceChangedCanvasItemsPatch(
  beforeItems: CanvasItem[],
  afterItems: CanvasItem[],
): JSONPatchOperation[] {
  const beforeEntries = flattenCanvasItems(beforeItems)
  const afterEntries = flattenCanvasItems(afterItems)
  const beforeById = new Map(
    beforeEntries.map((entry) => [entry.item.id, entry]),
  )
  const changedEntries = afterEntries.filter((entry) => {
    const before = beforeById.get(entry.item.id)

    return before ? !canvasItemsEqual(before.item, entry.item) : false
  })

  return getTopmostEntries(changedEntries).map((entry) => ({
    op: 'replace',
    path: canvasItemPathToPointer(entry.path),
    value: entry.item,
  }))
}

type CanvasSiblingArrayEntry = {
  arrayPointer: Pointer
  items: CanvasItem[]
  parentId: string
  parentPath: number[]
}

function collectCanvasSiblingArrays(
  items: CanvasItem[],
): CanvasSiblingArrayEntry[] {
  const entries: CanvasSiblingArrayEntry[] = []

  function visit(nodes: CanvasItem[], parentPath: number[], parentId: string) {
    entries.push({
      arrayPointer:
        parentPath.length === 0
          ? ''
          : `${canvasItemPathToPointer(parentPath)}/children` as Pointer,
      items: nodes,
      parentId,
      parentPath,
    })

    nodes.forEach((item, index) => {
      if (item.type === 'group') {
        visit(item.children, [...parentPath, index], item.id)
      }
    })
  }

  visit(items, [], '__root__')
  return entries
}

function createReorderSiblingArrayPatch(
  arrayPointer: Pointer,
  beforeIds: string[],
  afterIds: string[],
): JSONPatchOperation[] {
  if (
    beforeIds.length !== afterIds.length ||
    beforeIds.every((id, index) => id === afterIds[index])
  ) {
    return []
  }

  const current = [...beforeIds]
  const patch: JSONPatchOperation[] = []

  afterIds.forEach((id, index) => {
    if (current[index] === id) {
      return
    }

    const fromIndex = current.indexOf(id)

    if (fromIndex < 0) {
      return
    }

    current.splice(fromIndex, 1)
    current.splice(index, 0, id)
    patch.push({
      op: 'move',
      from: canvasArrayItemPointer(arrayPointer, fromIndex),
      path: canvasArrayItemPointer(arrayPointer, index),
    })
  })

  return patch
}

function canvasArrayItemPointer(arrayPointer: Pointer, index: number): Pointer {
  return `${arrayPointer}/${index}` as Pointer
}

function getTopmostEntries(entries: CanvasItemEntry[]) {
  return entries.filter(
    (entry) =>
      !entries.some((candidate) => isAncestorPath(candidate.path, entry.path)),
  )
}

function getChangedTopmostGroups(
  beforeEntries: CanvasItemEntry[],
  afterEntries: CanvasItemEntry[],
) {
  const beforeById = new Map(
    beforeEntries.map((entry) => [entry.item.id, entry]),
  )
  const changedGroups = afterEntries.filter((entry) => {
    if (entry.item.type !== 'group') {
      return false
    }

    const before = beforeById.get(entry.item.id)
    return before ? !canvasItemsEqual(before.item, entry.item) : false
  })

  return getTopmostEntries(changedGroups)
}

function compareEntriesByDescendingPath(
  a: CanvasItemEntry,
  b: CanvasItemEntry,
) {
  const length = Math.max(a.path.length, b.path.length)

  for (let index = 0; index < length; index += 1) {
    const left = a.path[index] ?? -1
    const right = b.path[index] ?? -1

    if (left !== right) {
      return right - left
    }
  }

  return b.path.length - a.path.length
}

function canvasItemsEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}
