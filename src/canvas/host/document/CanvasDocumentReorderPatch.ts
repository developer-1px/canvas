import type {
  JSONPatchOperation,
  Pointer,
} from 'zod-crud'
import type { CanvasItem } from '../model'
import { canvasItemPathToPointer } from './CanvasDocumentPointers'

type CanvasSiblingArrayEntry = {
  arrayPointer: Pointer
  ids: string[]
  parentId: string
  parentPath: number[]
}

export function createReorderCanvasSiblingArraysPatch({
  afterItems,
  beforeItems,
}: {
  afterItems: CanvasItem[]
  beforeItems: CanvasItem[]
}): JSONPatchOperation[] {
  const afterArrays = new Map(
    collectCanvasSiblingArrays(afterItems).map((entry) => [
      entry.parentId,
      entry.ids,
    ]),
  )

  return collectCanvasSiblingArrays(beforeItems)
    .sort((left, right) => right.parentPath.length - left.parentPath.length)
    .flatMap((entry) =>
      createReorderSiblingArrayPatch(
        entry.arrayPointer,
        entry.ids,
        afterArrays.get(entry.parentId) ?? [],
      ),
    )
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
      ids: nodes.map((item) => item.id),
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
