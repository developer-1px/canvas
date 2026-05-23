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
  CANVAS_COMPONENT_TEMPLATES,
  getCanvasComponentTemplate,
  type CanvasComponentTemplate,
} from './component/CanvasComponentCatalog'
export { createCanvasComponentItem } from './component/CanvasComponentFactory'
export { INITIAL_ITEMS } from './component/CanvasInitialItems'

export { createCanvasItemScene } from './adapters/CanvasItemSceneAdapter'

export {
  findCanvasItem,
  findEditableTextItem,
  flattenCanvasItems,
  getItemBounds,
  getItemsBounds,
  pruneNestedSelection,
  unionBounds,
} from './tree/CanvasTree'

export {
  commitCanvasItemsChange,
  type CanvasItemsChange,
} from './document/CanvasDocumentChanges'
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
