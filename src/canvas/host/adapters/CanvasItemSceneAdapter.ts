import type { CanvasItem } from '../model'
import {
  createCanvasSceneAdapter,
  type CanvasSceneAdapter,
  type CanvasSceneEntry,
} from '../../engine'
import { flattenCanvasItems, getItemBounds } from '../tree/CanvasTree'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'

export function createCanvasItemScene(items: CanvasItem[]): CanvasSceneAdapter {
  const treeEntries = flattenCanvasItems(items)
  const treeEntryByPath = new Map(
    treeEntries.map((entry) => [pathKey(entry.path), entry]),
  )
  const entries = treeEntries
    .filter(
      (entry) =>
        !entry.item.locked &&
        !treeEntries.some(
          (candidate) =>
            candidate.item.locked && isAncestorPath(candidate.path, entry.path),
        ),
    )
    .map((entry): CanvasSceneEntry => ({
      bounds: getItemBounds(entry.item),
      id: entry.item.id,
      isGroup: isCanvasGroupItem(entry.item),
      parentId:
        entry.parentPath.length === 0
          ? null
          : treeEntryByPath.get(pathKey(entry.parentPath))?.item.id ?? null,
      path: entry.path,
    }))

  return createCanvasSceneAdapter(entries)
}

function isAncestorPath(parent: number[], child: number[]) {
  return (
    parent.length < child.length &&
    parent.every((segment, index) => segment === child[index])
  )
}

function pathKey(path: number[]) {
  return path.join('/')
}
