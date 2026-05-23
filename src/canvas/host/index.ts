import { CANVAS_ITEM_COMMAND_ADAPTER } from './adapters/CanvasItemCommandAdapter'
import { CANVAS_ITEM_CREATION_ADAPTER } from './adapters/CanvasItemCreationAdapter'
import { CANVAS_ITEM_TRANSFORM_ADAPTER } from './adapters/CanvasItemTransformAdapter'

export type {
  CanvasComponentItem,
  CanvasComponentKind,
  CanvasCustomItem,
  CanvasDrawingItemBase,
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
  createCanvasItemReadModel,
  getCanvasItemBounds,
  getCanvasItemsBounds,
  type CanvasItemReadModel,
} from './read/CanvasItemReadModel'

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
export {
  validateCanvasItems as normalizeCanvasItems,
  type CanvasCustomItemValidator,
  type CanvasCustomItemValidators,
  type CanvasItemValidationOptions,
} from './document/CanvasItemSchema'
