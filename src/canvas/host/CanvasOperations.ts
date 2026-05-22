export {
  cloneCanvasItemsWithNewIds,
  cloneCanvasSelection,
  copyCanvasSelection,
} from './operations/CanvasItemCloneOperations'
export {
  groupCanvasSelection,
  ungroupCanvasSelection,
} from './operations/CanvasItemGroupOperations'
export {
  isCanvasItemLocked,
  lockCanvasSelection,
  unlockAllCanvasItems,
} from './operations/CanvasItemLockOperations'
export { removeCanvasItems } from './operations/CanvasItemRemovalOperations'
export {
  resizeCanvasItems,
  translateCanvasItems,
} from './operations/CanvasItemTransformOperations'
export {
  updateItemText,
  updateTextItem,
} from './operations/CanvasItemTextOperations'
export {
  reorderCanvasItems,
  type CanvasZOrderMode,
} from './operations/CanvasItemZOrderOperations'
