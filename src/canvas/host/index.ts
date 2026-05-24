import { CANVAS_ITEM_COMMAND_ADAPTER } from './adapters/CanvasItemCommandAdapter'
import { CANVAS_ITEM_CREATION_ADAPTER } from './adapters/CanvasItemCreationAdapter'
import { CANVAS_ITEM_TRANSFORM_ADAPTER } from './adapters/CanvasItemTransformAdapter'

export type {
  CanvasComponentItem,
  CanvasComponentKind,
  CanvasCustomItem,
  CanvasDrawingItemBase,
  CanvasEditableTextItem,
  CanvasImageItem,
  CanvasItem,
  CanvasItemBase,
  CanvasJsonObject,
  CanvasJsonValue,
  EditingText,
  GroupItem,
  HighlightItem,
  MarkerItem,
  ArrowItem,
  RectItem,
  TextItem,
} from './model'

export const CANVAS_ITEM_ENGINE_ADAPTERS = {
  command: CANVAS_ITEM_COMMAND_ADAPTER,
  creation: CANVAS_ITEM_CREATION_ADAPTER,
  transform: CANVAS_ITEM_TRANSFORM_ADAPTER,
}

export {
  CANVAS_COMPONENT_LIBRARY,
  DEFAULT_CANVAS_COMPONENT_TEMPLATES,
  createCanvasComponentLibrary,
  type CanvasComponentLibrary,
  type CanvasComponentPresentation,
  type CanvasComponentTemplate,
  type CreateCanvasComponentLibraryInput,
} from './component/CanvasComponentLibrary'
export { INITIAL_ITEMS } from './component/CanvasInitialItems'

export {
  getCanvasDrawingItemBounds,
  isCanvasArrowDrawingItem,
  isCanvasDrawingItem,
  isCanvasStrokeDrawingItem,
  scaleCanvasDrawingItem,
  syncCanvasDrawingItemBounds,
  translateCanvasDrawingItem,
  type CanvasDrawingItem,
  type CanvasStrokeDrawingItem,
} from './drawing/CanvasDrawingItemGeometry'
export {
  CANVAS_ARROW_STYLE,
  CANVAS_HIGHLIGHT_STYLE,
  CANVAS_MARKER_STYLE,
  getCanvasArrowStyle,
  getCanvasDrawingStrokeStyle,
  type CanvasArrowStyle,
  type CanvasDrawingStrokeKind,
  type CanvasDrawingStrokeStyle,
} from './drawing/CanvasDrawingItemStyles'
export {
  createCanvasImageItem,
  isCanvasImageItemStorageShape,
  isCanvasImageMimeType,
  type CreateCanvasImageItemInput,
} from './image/CanvasImageItem'

export {
  createCanvasItemReadModel,
  getCanvasItemBounds,
  getCanvasItemIds,
  getCanvasItemsBounds,
  getCanvasValidSelection,
  type CanvasItemReadModel,
} from './read/CanvasItemReadModel'
export {
  isCanvasGroupItem,
  type CanvasGroupItem,
} from './tree/CanvasGroupItem'
export {
  getCanvasEditableTextPatchOperation,
  getCanvasEditableTextValue,
  getCommittedCanvasEditableTextValue,
  isCanvasEditableTextItem,
  isCanvasEditableTextItemStorageShape,
  isCanvasTextItem,
} from './text/CanvasEditableTextItem'

export type { CanvasItemsChange } from './document/CanvasDocumentChanges'
export {
  createCanvasDocumentController,
  type CanvasDocumentController,
  type CanvasDocumentClipboard,
  type CanvasDocumentHistoryAvailability,
  type CanvasDocumentHistoryResult,
  type CanvasDocumentSelectionHistory,
  type CanvasDocumentTextSearch,
} from './document/CanvasDocumentController'
export type { CanvasTextSearchOptions } from './document/CanvasDocumentSearch'
export {
  validateCanvasItems as normalizeCanvasItems,
  type CanvasItemValidationOptions,
} from './document/CanvasItemSchema'
export type {
  CanvasCustomItemValidator,
  CanvasCustomItemValidators,
} from './document/CanvasCustomItemValidation'
