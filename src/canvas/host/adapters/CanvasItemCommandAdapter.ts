import type { CanvasCommandAdapter } from '../../engine'
import type { CanvasItem } from '../model'
import {
  alignCanvasSelection,
  cloneCanvasItemsWithNewIds,
  cloneCanvasSelection,
  duplicateCanvasSelection,
  distributeCanvasSelection,
  groupCanvasSelection,
  lockCanvasSelection,
  removeCanvasItems,
  reorderCanvasItems,
  translateCanvasItems,
  ungroupCanvasSelection,
  unlockAllCanvasItems,
} from '../operations/CanvasOperations'

export const CANVAS_ITEM_COMMAND_ADAPTER: CanvasCommandAdapter<CanvasItem> = {
  alignSelection: ({ items, mode, selection }) =>
    alignCanvasSelection(items, selection, mode),
  cloneSelection: ({ createId, ids, items, offset }) =>
    cloneCanvasSelection(items, ids, createId, offset),
  duplicateSelection: ({ createId, items, offset, sourceIds }) =>
    duplicateCanvasSelection(items, sourceIds, createId, offset),
  deleteSelection: ({ items, selection }) => removeCanvasItems(items, selection),
  distributeSelection: ({ items, mode, selection }) =>
    distributeCanvasSelection(items, selection, mode),
  groupSelection: ({ groupId, items, selection }) =>
    groupCanvasSelection(items, selection, groupId),
  lockSelection: ({ items, selection }) => lockCanvasSelection(items, selection),
  pasteItems: ({ clipboard, createId, offset }) =>
    cloneCanvasItemsWithNewIds(clipboard, createId, offset),
  nudgeSelection: ({ dx, dy, items, selection }) =>
    translateCanvasItems(items, selection, dx, dy),
  reorderSelection: ({ items, mode, selection }) =>
    reorderCanvasItems(items, selection, mode),
  selectAll: ({ items }) => items.map((item) => item.id),
  ungroupSelection: ({ items, selection }) =>
    ungroupCanvasSelection(items, selection),
  unlockAll: ({ items, selection }) => ({
    items: unlockAllCanvasItems(items),
    selection,
  }),
}
