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
  type CanvasExtensionToolDescriptor,
  type CanvasExtensionToolKind,
  type CanvasExtensionViewportEffect,
} from './CanvasExtensionContracts'
export {
  CANVAS_STICKY_NOTE_EXTENSION,
  CANVAS_STICKY_NOTE_EXTENSION_ID,
  CANVAS_STICKY_NOTE_RENDERER_SLOT_ID,
  CANVAS_STICKY_NOTE_TOOL_ID,
} from './CanvasFirstPartyExtensions'
export {
  createCanvasSceneAdapter,
  type CanvasSceneAdapter,
  type CanvasSceneEntry,
} from './CanvasSceneAdapter'
export {
  getCanvasItemPointerSelection,
  getCanvasMarqueeSelection,
  type CanvasItemPointerSelection,
} from './CanvasSelectionEngine'
export {
  moveCanvasSelection,
  resizeCanvasSelection,
  type CanvasTransformAdapter,
  type CanvasTransformItem,
} from './CanvasTransformEngine'
