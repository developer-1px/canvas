import { CANVAS_ITEM_COMMAND_ADAPTER } from './adapters/CanvasItemCommandAdapter'
import { CANVAS_ITEM_CREATION_ADAPTER } from './adapters/CanvasItemCreationAdapter'
import { CANVAS_ITEM_TRANSFORM_ADAPTER } from './adapters/CanvasItemTransformAdapter'

export type {
  CanvasComponentItem,
  CanvasComponentKind,
  CanvasArrowEndpoint,
  CanvasArrowRouting,
  CanvasCommentItem,
  CanvasCustomItem,
  CanvasDrawingItemBase,
  CanvasEditableTextItem,
  CanvasImageItem,
  CanvasItem,
  CanvasItemBase,
  CanvasJsonObject,
  CanvasJsonValue,
  CanvasShapeKind,
  CanvasStampItem,
  CanvasStampKind,
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
export {
  CANVAS_SECTION_COMPONENT_KIND,
  CANVAS_SECTION_DEFAULT_SIZE,
  isCanvasSectionComponentItem,
} from './component/CanvasSectionComponent'
export {
  CANVAS_STICKY_COMPONENT_KIND,
  applyCanvasStickyComponentCreationDefaults,
  isCanvasStickyComponentItem,
} from './component/CanvasStickyComponent'
export { INITIAL_ITEMS } from './component/CanvasInitialItems'

export {
  getCanvasDrawingItemBounds,
  isCanvasArrowDrawingItem,
  isCanvasDrawingItem,
  isCanvasStrokeDrawingItem,
  scaleCanvasDrawingItem,
  syncCanvasDrawingItemBounds,
  getCanvasArrowLabelBounds,
  translateCanvasArrowAttachedEndpoints,
  translateCanvasDrawingItem,
  type CanvasDrawingItem,
  type CanvasStrokeDrawingItem,
} from './drawing/CanvasDrawingItemGeometry'
export {
  CANVAS_ARROW_STYLE,
  CANVAS_DRAWING_STROKE_STYLE_DEFAULTS,
  CANVAS_HIGHLIGHT_STYLE,
  CANVAS_MARKER_STYLE,
  createCanvasDrawingStrokeStyleSet,
  getCanvasArrowStyle,
  getCanvasDrawingStrokeStyle,
  type CanvasArrowStyle,
  type CanvasDrawingStrokeKind,
  type CanvasDrawingStrokeStyle,
  type CanvasDrawingStrokeStyleSet,
} from './drawing/CanvasDrawingItemStyles'
export {
  createCanvasImageItem,
  isCanvasImageItemStorageShape,
  isCanvasImageMimeType,
  type CreateCanvasImageItemInput,
} from './image/CanvasImageItem'
export {
  CANVAS_COMMENT_DEFAULT_BODY,
  CANVAS_COMMENT_BODY_MAX_LENGTH,
  CANVAS_COMMENT_ITEM_SIZE,
  createCanvasCommentItem,
  getCanvasCommentBodyBounds,
  isCanvasCommentAttachedTo,
  isCanvasCommentItem,
  isCanvasCommentItemStorageShape,
  translateCanvasCommentItem,
  type CreateCanvasCommentItemInput,
} from './comment/CanvasCommentItem'
export {
  CANVAS_STAMP_ITEM_SIZE,
  createCanvasStampItem,
  isCanvasStampAttachedTo,
  isCanvasStampItem,
  isCanvasStampItemStorageShape,
  translateCanvasStampItem,
  type CreateCanvasStampItemInput,
} from './stamp/CanvasStampItem'

export {
  CANVAS_DEFAULT_SHAPE_KIND,
  getCanvasShapeKind,
  isCanvasShapeKind,
} from './shape/CanvasShapeItem'

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
  getCanvasEditableTextPatchField,
  getCanvasEditableTextBounds,
  getCanvasEditableTextValue,
  getCommittedCanvasEditableTextValue,
  isCanvasEditableTextItem,
  isCanvasEditableTextItemStorageShape,
  isCanvasTextItem,
  shouldCommitCanvasEditableTextOnEnter,
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
