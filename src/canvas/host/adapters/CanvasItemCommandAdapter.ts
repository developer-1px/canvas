import type { CanvasCommandAdapter } from '../../engine/CanvasCommandEngine'
import type { CanvasItem } from '../CanvasModel'
import {
  cloneCanvasItemsWithNewIds,
  cloneCanvasSelection,
  copyCanvasSelection,
  groupCanvasSelection,
  removeCanvasItems,
  reorderCanvasItems,
  translateCanvasItems,
  ungroupCanvasSelection,
} from '../CanvasOperations'

export const CANVAS_ITEM_COMMAND_ADAPTER: CanvasCommandAdapter<CanvasItem> = {
  cloneSelection: ({ createId, ids, items, offset }) =>
    cloneCanvasSelection(items, ids, createId, offset),
  copySelection: ({ items, selection }) => copyCanvasSelection(items, selection),
  deleteSelection: ({ items, selection }) => removeCanvasItems(items, selection),
  groupSelection: ({ groupId, items, selection }) =>
    groupCanvasSelection(items, selection, groupId),
  pasteItems: ({ clipboard, createId, offset }) =>
    cloneCanvasItemsWithNewIds(clipboard, createId, offset),
  nudgeSelection: ({ dx, dy, items, selection }) =>
    translateCanvasItems(items, selection, dx, dy),
  reorderSelection: ({ items, mode, selection }) =>
    reorderCanvasItems(items, selection, mode),
  ungroupSelection: ({ items, selection }) =>
    ungroupCanvasSelection(items, selection),
}
