import type { Bounds } from '../../core'
import type { CanvasSceneAdapter } from '../../engine'
import type {
  CanvasItem,
} from '../model'
import type { CanvasEditableTextItem } from '../text/CanvasEditableTextItem'
import {
  createCanvasItemScene,
} from '../adapters/CanvasItemSceneAdapter'
import {
  findCanvasItem,
  findEditableTextItem,
  flattenCanvasItems,
  getItemBounds,
  getItemsBounds,
  pruneNestedSelection,
  unionBounds,
} from '../tree/CanvasTree'

export type CanvasItemReadModel = {
  scene: CanvasSceneAdapter
  findEditableTextItem: (id: string) => CanvasEditableTextItem | null
  findItem: (id: string) => CanvasItem | undefined
  getAllIds: () => string[]
  getAllItems: () => CanvasItem[]
  getItemBounds: (item: CanvasItem) => Bounds
  getSelection: (ids: string[]) => string[]
  getSelectionBounds: (ids: Iterable<string>) => Bounds | null
  getSelectedItems: (ids: string[]) => CanvasItem[]
}

export function createCanvasItemReadModel(
  items: CanvasItem[],
): CanvasItemReadModel {
  return {
    scene: createCanvasItemScene(items),
    findEditableTextItem: (id) => findEditableTextItem(items, id),
    findItem: (id) => findCanvasItem(items, id),
    getAllIds: () => getCanvasItemIds(items),
    getAllItems: () => flattenCanvasItems(items).map((entry) => entry.item),
    getItemBounds: (item) => getItemBounds(item),
    getSelection: (ids) => getCanvasValidSelection(items, ids),
    getSelectionBounds: (ids) => unionBounds(items, new Set(ids)),
    getSelectedItems: (ids) =>
      ids
        .map((id) => findCanvasItem(items, id))
        .filter((item): item is CanvasItem => item !== undefined),
  }
}

export function getCanvasItemIds(items: CanvasItem[]) {
  return flattenCanvasItems(items).map((entry) => entry.item.id)
}

export function getCanvasValidSelection(items: CanvasItem[], ids: string[]) {
  return pruneNestedSelection(items, ids)
}

export function getCanvasItemBounds(item: CanvasItem) {
  return getItemBounds(item)
}

export function getCanvasItemsBounds(items: CanvasItem[]) {
  return getItemsBounds(items)
}
