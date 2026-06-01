export {
  cloneCanvasItemsWithNewIds,
  cloneCanvasSelection,
  copyCanvasSelection,
  duplicateCanvasSelection,
} from './CanvasItemCloneOperations'
export {
  alignCanvasSelection,
  canTidyCanvasSelection,
  distributeCanvasSelection,
  tidyCanvasSelection,
  type CanvasAlignMode,
  type CanvasDistributeMode,
  type CanvasTidyOptions,
} from './CanvasItemAlignmentOperations'
export {
  canFlipCanvasSelection,
  flipCanvasSelection,
  type CanvasFlipAxis,
} from './CanvasItemFlipOperations'
export {
  groupCanvasSelection,
  ungroupCanvasSelection,
} from './CanvasItemGroupOperations'
export {
  isCanvasItemLocked,
  lockCanvasSelection,
  unlockAllCanvasItems,
} from './CanvasItemLockOperations'
export { removeCanvasItems } from './CanvasItemRemovalOperations'
export {
  canSelectSameTypeCanvasSelection,
  selectSameTypeCanvasSelection,
} from './CanvasItemSelectionQuery'
export {
  canResizeCanvasItem,
  canRotateCanvasItem,
  canRotateCanvasSelection,
  getCanvasItemRotation,
  getCanvasItemRotationTransform,
  getCanvasRotatedBounds,
  getCanvasSelectionRotation,
  hasCanvasItemRotation,
  hasCanvasSelectionRotation,
  isCanvasRotatableItem,
  normalizeCanvasItemRotation,
  resetCanvasSelectionRotation,
  rotateCanvasItem,
  rotateCanvasSelection,
  setCanvasItemRotation,
  type CanvasRotatableItem,
} from './CanvasItemRotationOperations'
export {
  resizeCanvasItems,
  translateCanvasItems,
} from './CanvasItemTransformOperations'
export {
  canReorderCanvasItems,
  reorderCanvasItems,
  type CanvasZOrderMode,
} from './CanvasItemZOrderOperations'
