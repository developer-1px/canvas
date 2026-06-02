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
  canUseCanvasCommand,
  getCanvasCommandAvailability,
  type CanvasCommandAvailabilityConfig,
  type CanvasCommandAvailabilityInput,
  type CanvasCommandUseInput,
} from './CanvasCommandAvailability'
export {
  canAlignCanvasCommandSelection,
  canDistributeCanvasCommandSelection,
  canGroupCanvasCommandSelection,
  getCanvasCommandSelectionState,
  hasCanvasCommandSelection,
  type CanvasCommandSelectionState,
} from './CanvasCommandSelectionRules'
export {
  CANVAS_COMMAND_INSERT_OFFSET,
  type CanvasAlignMode,
  type CanvasCommandAdapter,
  type CanvasCommandAvailability,
  type CanvasCommandItem,
  type CanvasCommandItemsResult,
  type CanvasCommandOffset,
  type CanvasDistributeMode,
  type CanvasReorderMode,
  type DeleteCanvasCommandResult,
  type DuplicateCanvasCommandResult,
} from './CanvasCommandTypes'
export {
  CANVAS_STICKY_NOTE_EXTENSION,
  CANVAS_STICKY_NOTE_EXTENSION_ID,
  CANVAS_STICKY_NOTE_RENDERER_SLOT_ID,
  CANVAS_STICKY_NOTE_TOOL_ID,
} from './CanvasFirstPartyExtensions'
export {
  getCanvasItemPointerIntent,
  getCanvasPointerGesture,
  isAdditivePointerInput,
  shouldRouteCanvasItemPointerToCanvasGesture,
  type CanvasItemPointerIntent,
  type CanvasPointerGestureConfig,
  type CanvasPointerInput,
} from './CanvasGestureEngine'
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
export {
  EMPTY_CANVAS_SNAP_GUIDES,
  getCanvasMoveSnap,
  snapCanvasPointToGrid,
  type CanvasAlignmentGuide,
  type CanvasGridSnapConfig,
  type CanvasMoveSnap,
  type CanvasMoveSnapConfig,
  type CanvasSnapGuides,
  type CanvasSpacingGuide,
} from './CanvasSnapEngine'
export {
  CANVAS_TOOL_GESTURE_ROUTES,
  getCanvasToolPointerGesture,
  shouldRouteCanvasToolPointerToCanvasGesture,
  shouldStartCanvasPanGesture,
  type CanvasPointerGesture,
  type CanvasToolGestureConfig,
} from './CanvasToolGestureRouting'
