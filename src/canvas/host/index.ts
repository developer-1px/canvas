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
  CanvasPathCubicSegment,
  CanvasPathLineSegment,
  CanvasPathMoveSegment,
  CanvasPathSegment,
  CanvasShapeItem,
  CanvasShapeKind,
  CanvasShapeLikeItem,
  CanvasShapeType,
  CanvasStampItem,
  CanvasStampKind,
  EditingText,
  GroupItem,
  HighlightItem,
  MarkerItem,
  PathItem,
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
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID,
  createCanvasComponentDefinitionRegistry,
  type CanvasComponentBinding,
  type CanvasComponentDefinition,
  type CanvasComponentDefinitionId,
  type CanvasComponentDefinitionInstance,
  type CanvasComponentDefinitionRegistry,
  type CanvasComponentInstanceSummary,
  type CanvasComponentLinkedItemSyncInput,
  type CanvasComponentPartSummary,
  type CanvasComponentSetSummary,
  type CanvasComponentSlotId,
  type CanvasComponentSlotSummary,
  type CanvasComponentSource,
  type CreateCanvasComponentDefinitionRegistryInput,
} from './component/CanvasComponentDefinitionRegistry'
export {
  CANVAS_CHECKLIST_COMPONENT_KIND,
  addCanvasChecklistItem,
  getCanvasChecklistCheckedItems,
  getCanvasChecklistItems,
  isCanvasChecklistComponentItem,
  isCanvasChecklistItemChecked,
  removeCanvasChecklistItem,
  replaceCanvasChecklistComponentItemChecked,
  replaceCanvasChecklistComponentItemText,
  replaceCanvasChecklistComponentsWithAddedItem,
  replaceCanvasChecklistComponentsWithoutItem,
  setCanvasChecklistItemChecked,
  setCanvasChecklistItemText,
  type CanvasChecklistComponentItem,
} from './component/CanvasChecklistComponent'
export {
  CANVAS_KANBAN_COMPONENT_KIND,
  addCanvasKanbanCard,
  getCanvasKanbanCards,
  isCanvasKanbanComponentItem,
  moveCanvasKanbanCard,
  removeCanvasKanbanCard,
  replaceCanvasKanbanComponentCardText,
  replaceCanvasKanbanComponentsWithAddedCard,
  replaceCanvasKanbanComponentsWithMovedCard,
  replaceCanvasKanbanComponentsWithoutCard,
  setCanvasKanbanCardText,
  type CanvasKanbanCardMoveDirection,
  type CanvasKanbanComponentItem,
} from './component/CanvasKanbanComponent'
export {
  CANVAS_SECTION_COMPONENT_KIND,
  CANVAS_SECTION_DEFAULT_SIZE,
  isCanvasSectionComponentItem,
} from './component/CanvasSectionComponent'
export {
  CANVAS_LINK_PREVIEW_COMPONENT_KIND,
  CANVAS_LINK_PREVIEW_COMPONENT_PRESENTATION,
  createCanvasLinkPreviewComponentItem,
  createCanvasLinkPreviewSourceTextItem,
  getCanvasLinkPreviewDomain,
  isCanvasLinkPreviewComponentItem,
  isCanvasLinkPreviewOrientation,
  isCanvasLinkPreviewUrl,
  normalizeCanvasLinkPreviewOrientation,
  normalizeCanvasLinkPreviewUrl,
  replaceCanvasLinkPreviewComponentsWithSourceText,
  replaceCanvasLinkPreviewComponentsOrientation,
  setCanvasLinkPreviewComponentOrientation,
  type CanvasLinkPreviewOrientation,
  type CreateCanvasLinkPreviewComponentItemInput,
} from './component/CanvasLinkPreviewComponent'
export {
  CANVAS_STICKY_COMPONENT_KIND,
  applyCanvasStickyComponentCreationDefaults,
  isCanvasStickyComponentItem,
} from './component/CanvasStickyComponent'
export {
  CANVAS_TABLE_COMPONENT_KIND,
  createCanvasTableComponentItem,
  getCanvasTableComponentSize,
  getCanvasTableGrid,
  isCanvasTableComponentItem,
  normalizeCanvasTableRows,
  type CanvasTableComponentRows,
  type CanvasTableComponentSize,
  type CanvasTableComponentSizeInput,
  type CanvasTableComponentSizeOptions,
  type CanvasTableGrid,
  type CreateCanvasTableComponentItemInput,
} from './component/CanvasTableComponent'
export { INITIAL_ITEMS } from './component/CanvasInitialItems'

export {
  getCanvasDrawingItemBounds,
  isCanvasArrowDrawingItem,
  isCanvasDrawingItem,
  isCanvasPathDrawingItem,
  isCanvasStrokeDrawingItem,
  scaleCanvasDrawingItem,
  syncCanvasDrawingItemBounds,
  getCanvasArrowLabelBounds,
  translateCanvasArrowAttachedEndpoints,
  translateCanvasDrawingItem,
  type CanvasDrawingItem,
  type CanvasPathDrawingItem,
  type CanvasStrokeDrawingItem,
} from './drawing/CanvasDrawingItemGeometry'
export {
  isCanvasArrowRouting,
  normalizeCanvasArrowRouting,
  replaceCanvasArrowRoutings,
  setCanvasArrowRouting,
} from './drawing/CanvasArrowRouting'
export {
  CANVAS_ARROW_STYLE,
  CANVAS_DRAWING_STROKE_STYLE_DEFAULTS,
  CANVAS_HIGHLIGHT_STYLE,
  CANVAS_MARKER_STYLE,
  CANVAS_PATH_STYLE,
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
  CANVAS_COMMENT_DEFAULT_AUTHOR_NAME,
  CANVAS_COMMENT_DEFAULT_BODY,
  CANVAS_COMMENT_DEFAULT_CREATED_AT,
  CANVAS_COMMENT_BODY_MAX_LENGTH,
  CANVAS_COMMENT_ITEM_SIZE,
  createCanvasCommentItem,
  createCanvasCommentThreadMessage,
  getCanvasCommentBodyBounds,
  getCanvasCommentTextPatchUpdates,
  getCanvasCommentThreadMessages,
  isCanvasCommentAttachedTo,
  isCanvasCommentItem,
  isCanvasCommentItemStorageShape,
  setCanvasCommentResolved,
  translateCanvasCommentItem,
  type CreateCanvasCommentItemInput,
} from './comment/CanvasCommentItem'
export {
  CANVAS_STAMP_ITEM_SIZE,
  createCanvasStampItem,
  isCanvasStampItem,
  isCanvasStampItemStorageShape,
  translateCanvasStampItem,
  type CreateCanvasStampItemInput,
} from './stamp/CanvasStampItem'

export {
  CANVAS_DEFAULT_SHAPE_TYPE,
  CANVAS_DEFAULT_SHAPE_KIND,
  getCanvasShapeType,
  getCanvasShapeKind,
  getCanvasLegacyShapeKind,
  setCanvasShapeKind,
  getCanvasToolShapeKind,
  isCanvasShapeItem,
  isCanvasShapeItemStorageShape,
  isCanvasShapeTool,
  isCanvasShapeKind,
  type CanvasShapeTool,
} from './shape/CanvasShapeItem'
export {
  getCanvasItemSvgShapeGeometry,
  getCanvasSvgShapeGeometry,
  type CanvasSvgShapeGeometry,
} from './shape/CanvasShapeGeometry'

export {
  createCanvasItemReadModel,
  getCanvasItemBounds,
  getCanvasItemIds,
  getCanvasItemsBounds,
  getCanvasValidSelection,
  type CanvasItemReadModel,
} from './read/CanvasItemReadModel'
export {
  canFlipCanvasSelection,
  canResizeCanvasItem,
  canReorderCanvasItems,
  canRotateCanvasItem,
  canRotateCanvasSelection,
  canSelectSameTypeCanvasSelection,
  canTidyCanvasSelection,
  flipCanvasSelection,
  getCanvasItemRotation,
  getCanvasItemRotationTransform,
  getCanvasRotatedBounds,
  getCanvasSelectionRotation,
  hasCanvasItemRotation,
  hasCanvasSelectionRotation,
  isCanvasRotatableItem,
  normalizeCanvasItemRotation,
  reorderCanvasItems,
  resetCanvasSelectionRotation,
  rotateCanvasItem,
  rotateCanvasSelection,
  selectSameTypeCanvasSelection,
  setCanvasItemRotation,
  tidyCanvasSelection,
  type CanvasFlipAxis,
  type CanvasRotatableItem,
  type CanvasTidyOptions,
  type CanvasZOrderMode,
} from './operations/CanvasOperations'
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
