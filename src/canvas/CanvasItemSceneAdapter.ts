import type { CanvasItem } from './CanvasModel'
import {
  createCanvasSceneAdapter,
  type CanvasSceneAdapter,
  type CanvasSceneEntry,
} from './CanvasSceneAdapter'
import { flattenCanvasItems, getItemBounds } from './CanvasTree'

export function createCanvasItemScene(items: CanvasItem[]): CanvasSceneAdapter {
  const treeEntries = flattenCanvasItems(items)
  const treeEntryByPath = new Map(
    treeEntries.map((entry) => [pathKey(entry.path), entry]),
  )
  const entries = treeEntries.map((entry): CanvasSceneEntry => ({
    bounds: getItemBounds(entry.item),
    id: entry.item.id,
    isGroup: entry.item.type === 'group',
    parentId:
      entry.parentPath.length === 0
        ? null
        : treeEntryByPath.get(pathKey(entry.parentPath))?.item.id ?? null,
    path: entry.path,
  }))

  return createCanvasSceneAdapter(entries)
}

function pathKey(path: number[]) {
  return path.join('/')
}
