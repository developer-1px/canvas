import { createLayerOrder } from '@zod-crud/layer-order'
import type { JSONPatchOperation, Pointer } from 'zod-crud'
import type { CanvasItem } from '../model'
import type { CanvasZOrderMode } from '../operations/CanvasOperations'
import {
  flattenCanvasItems,
  pruneNestedSelection,
} from '../tree/CanvasTree'
import { createCanvasItemsDocument } from './CanvasDocument'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'

type CanvasLayerOrderSourceGroup = {
  parentPath: number[]
  pointers: Pointer[]
}

export function createCanvasDocumentLayerOrderPatch({
  items,
  mode,
  selection,
}: {
  items: CanvasItem[]
  mode: CanvasZOrderMode
  selection: string[]
}): JSONPatchOperation[] {
  const document = createCanvasItemsDocument(items, { history: 0 })
  const layerOrder = createLayerOrder(document)

  return createCanvasLayerOrderSourceGroups(items, selection)
    .sort((left, right) => right.parentPath.length - left.parentPath.length)
    .flatMap((group) => {
      const change = layerOrder.reorder(group.pointers, mode)

      return change.ok ? [...change.operations] : []
    })
}

function createCanvasLayerOrderSourceGroups(
  items: CanvasItem[],
  selection: string[],
): CanvasLayerOrderSourceGroup[] {
  const entriesById = new Map(
    flattenCanvasItems(items).map((entry) => [entry.item.id, entry]),
  )
  const groupsByParentPath = new Map<string, CanvasLayerOrderSourceGroup>()

  pruneNestedSelection(items, selection).forEach((id) => {
    const entry = entriesById.get(id)

    if (!entry) {
      return
    }

    const key = entry.parentPath.join('/')
    const group = groupsByParentPath.get(key) ?? {
      parentPath: entry.parentPath,
      pointers: [],
    }

    group.pointers.push(canvasItemPathToPointer(entry.path))
    groupsByParentPath.set(key, group)
  })

  return [...groupsByParentPath.values()]
}
