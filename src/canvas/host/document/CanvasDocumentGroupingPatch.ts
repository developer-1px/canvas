import {
  createGrouping,
  type GroupingAdapter,
} from '@interactive-os/json-document-grouping'
import type { JSONPatchOperation, Pointer } from '@interactive-os/json-document'
import type { CanvasItem } from '../model'
import {
  flattenCanvasItems,
  isCanvasGroupItem,
  pruneNestedSelection,
  syncGroupBounds,
} from '../tree/CanvasTree'
import { createCanvasItemsDocument } from './CanvasDocument'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'
import {
  getCanvasDocumentPatchEntries,
  getCanvasDocumentPatchRemovalEntries,
} from './CanvasDocumentPatchTreeDiff'

export function createCanvasDocumentGroupPatch({
  groupId,
  items,
  selection,
}: {
  groupId: string
  items: CanvasItem[]
  selection: string[]
}): JSONPatchOperation[] {
  const source = createCanvasGroupingSourcePointers(items, selection)

  if (source.length < 2) {
    return []
  }

  const grouping = createGrouping(
    createCanvasItemsDocument(items, { history: 0 }),
    createCanvasGroupingAdapter(groupId),
  )
  const change = grouping.canGroup(source)

  return change.ok ? [...change.operations] : []
}

export function createCanvasDocumentUngroupPatch({
  items,
  selection,
}: {
  items: CanvasItem[]
  selection: string[]
}): JSONPatchOperation[] {
  const document = createCanvasItemsDocument(items, { history: 0 })
  const grouping = createGrouping(
    document,
    createCanvasGroupingAdapter(),
  )
  const source = getCanvasDocumentPatchRemovalEntries(
    getCanvasDocumentPatchEntries(items).filter(
      (entry) =>
        isCanvasGroupItem(entry.item) && selection.includes(entry.item.id),
    ),
  )

  return source.flatMap((entry) => {
    const change = grouping.ungroup(canvasItemPathToPointer(entry.path))

    return change.ok ? [...change.operations] : []
  })
}

function createCanvasGroupingSourcePointers(
  items: CanvasItem[],
  selection: string[],
): Pointer[] {
  const entriesById = new Map(
    flattenCanvasItems(items).map((entry) => [entry.item.id, entry]),
  )

  return pruneNestedSelection(items, selection).flatMap((id) => {
    const entry = entriesById.get(id)

    return entry ? [canvasItemPathToPointer(entry.path)] : []
  })
}

function createCanvasGroupingAdapter(groupId?: string): GroupingAdapter {
  return {
    isGroup: isCanvasGroupValue,
    getChildren(value) {
      return isCanvasGroupValue(value) ? value.children : null
    },
    createGroup(children) {
      if (!groupId) {
        throw new Error('Canvas group id is required')
      }

      return syncGroupBounds({
        children: children.map((child) => child as CanvasItem),
        h: 0,
        id: groupId,
        type: 'group',
        w: 0,
        x: 0,
        y: 0,
      })
    },
  }
}

function isCanvasGroupValue(value: unknown): value is Extract<
  CanvasItem,
  { type: 'group' }
> {
  return isRecord(value) && isCanvasGroupItem(value as CanvasItem)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
