import { CANVAS_ITEM_COMMAND_ADAPTER } from './adapters/CanvasItemCommandAdapter'
import { CANVAS_ITEM_CREATION_ADAPTER } from './adapters/CanvasItemCreationAdapter'
import { CANVAS_ITEM_TRANSFORM_ADAPTER } from './adapters/CanvasItemTransformAdapter'

export type {
  CanvasComponentItem,
  CanvasComponentKind,
  CanvasItem,
  CanvasItemBase,
  EditingText,
  GroupItem,
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
  type CanvasComponentLibrary,
  type CanvasComponentTemplate,
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
  type CanvasDocumentClipboard,
  type CanvasDocumentHistoryAvailability,
  type CanvasDocumentSelectionHistory,
  type CanvasDocumentTextSearch,
} from './document/CanvasDocumentController'
export {
  validateCanvasItems as normalizeCanvasItems,
} from './document/CanvasItemSchema'
