export type {
  Bounds,
  CanvasSelectionIds,
  Point,
  ResizeHandle,
  Viewport,
} from '../core'
export {
  clamp,
  fitBoundsIntoViewport,
  handlePoint,
  normalizeBounds,
  pointDistance,
  resizeBounds,
  scaleItemBounds,
  unique,
  zoomViewport,
  type CanvasViewportRect,
  type ResizeBoundsOptions,
} from '../core'
export {
  createCanvasSceneAdapter,
  type CanvasSceneAdapter,
  type CanvasSceneEntry,
} from '../engine/scene/CanvasSceneAdapter'
export {
  getCanvasItemPointerSelection,
  getCanvasMarqueeSelection,
  type CanvasItemPointerSelection,
} from '../engine/selection/CanvasSelectionEngine'
export {
  moveCanvasSelection,
  resizeCanvasSelection,
  type CanvasTransformAdapter,
  type CanvasTransformItem,
} from '../engine/transform/CanvasTransformEngine'
