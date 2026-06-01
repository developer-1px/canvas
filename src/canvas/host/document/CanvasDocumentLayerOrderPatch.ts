import type { JSONPatchOperation, Pointer } from 'zod-crud'
import type { CanvasItem } from '../model'
import {
  reorderCanvasItems,
  type CanvasZOrderMode,
} from '../operations/CanvasOperations'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'

export function createCanvasDocumentLayerOrderPatch({
  items,
  mode,
  selection,
}: {
  items: CanvasItem[]
  mode: CanvasZOrderMode
  selection: string[]
}): JSONPatchOperation[] {
  return createCanvasLayerOrderReplacePatches({
    afterItems: reorderCanvasItems(items, selection, mode),
    beforeItems: items,
    parentPath: [],
  })
}

function createCanvasLayerOrderReplacePatches({
  afterItems,
  beforeItems,
  parentPath,
}: {
  afterItems: CanvasItem[]
  beforeItems: CanvasItem[]
  parentPath: number[]
}): JSONPatchOperation[] {
  if (!hasSameCanvasSiblingOrder(beforeItems, afterItems)) {
    return [{
      op: 'replace',
      path: getCanvasSiblingArrayPointer(parentPath),
      value: afterItems,
    }]
  }

  return beforeItems.flatMap((beforeItem, index) => {
    const afterItem = afterItems[index]

    return isCanvasGroupItem(beforeItem) && isCanvasGroupItem(afterItem)
      ? createCanvasLayerOrderReplacePatches({
          afterItems: afterItem.children,
          beforeItems: beforeItem.children,
          parentPath: [...parentPath, index],
        })
      : []
  })
}

function hasSameCanvasSiblingOrder(
  beforeItems: CanvasItem[],
  afterItems: CanvasItem[],
) {
  return beforeItems.length === afterItems.length &&
    beforeItems.every((item, index) => afterItems[index]?.id === item.id)
}

function getCanvasSiblingArrayPointer(parentPath: number[]): Pointer {
  return parentPath.length === 0
    ? '' as Pointer
    : `${canvasItemPathToPointer(parentPath)}/children` as Pointer
}
