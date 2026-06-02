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
  defineCanvasExtension,
  type CanvasExtensionAdapterSlot,
  type CanvasExtensionCommandDescriptor,
  type CanvasExtensionDescriptor,
  type CanvasExtensionDocumentPatchEffect,
  type CanvasExtensionEffect,
  type CanvasExtensionId,
  type CanvasExtensionPlanner,
  type CanvasExtensionRendererSlot,
  type CanvasExtensionSelectionEffect,
  type CanvasExtensionSelectionHistory,
  type CanvasExtensionViewportEffect,
} from './CanvasExtensionContracts'
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
