import { createReactDesignWidgetPack } from '@interactive-os/canvas/react-design'

import { FIGJAM_SHAPE_DEFINITION } from './FigJamShapeDefinition'
import { FIGJAM_DRAWING_DEFINITION } from './FigJamDrawingDefinition'
import { FIGJAM_CONNECTOR_DEFINITION } from './FigJamConnectorDefinition'
import { FIGJAM_COMMENT_DEFINITION } from './FigJamCommentDefinition'
import { FIGJAM_IMAGE_DEFINITION } from './FigJamImageDefinition'
import { FIGJAM_STAMP_DEFINITION } from './FigJamStampDefinition'
import {
  FIGJAM_CHECKLIST_DEFINITION,
  FIGJAM_KANBAN_DEFINITION,
  FIGJAM_LINK_PREVIEW_DEFINITION,
  FIGJAM_TABLE_DEFINITION,
} from './FigJamCollectionDefinitions'
import { FIGJAM_STRUCTURAL_DEFINITIONS } from './FigJamStructuralDefinitions'
import { FIGJAM_INSERTION_DESCRIPTORS } from './FigJamInsertionDescriptors'
import { FIGJAM_STICKY_NOTE_DEFINITION } from './FigJamStickyNoteDefinition'
import { FIGJAM_TEXT_DEFINITION } from './FigJamTextDefinition'

export type {
  FigJamPlacementInput,
  FigJamPoint,
  FigJamSizeInput,
} from './FigJamWidgetPrimitives'

export {
  detachFigJamNodeReferences,
  getFigJamNodeReferenceIds,
  materializeFigJamConnectorFallback,
  materializeFigJamCommentFallback,
  planFigJamReferenceRepairs,
  remapFigJamNodeReferences,
  translateFigJamNodeReferenceGeometry,
} from './FigJamReferencePlanner'
export {
  FIGJAM_INSERTION_DESCRIPTORS,
  FIGJAM_INSERTION_IDS,
  createFigJamInsertion,
  type FigJamInsertionDescriptor,
  type FigJamInsertionId,
} from './FigJamInsertionDescriptors'
export {
  FIGJAM_BOARD_DEFINITION,
  FIGJAM_BOARD_DEFINITION_ID,
  FIGJAM_GROUP_DEFINITION,
  FIGJAM_GROUP_DEFINITION_ID,
  FIGJAM_SECTION_DEFINITION,
  FIGJAM_SECTION_DEFINITION_ID,
  FIGJAM_STRUCTURAL_DEFINITIONS,
  createFigJamBoardNode,
  createFigJamGroupNode,
  createFigJamSectionNode,
  type CreateFigJamBoardNodeInput,
  type CreateFigJamGroupNodeInput,
  type CreateFigJamSectionNodeInput,
} from './FigJamStructuralDefinitions'
export {
  FIGJAM_CHECKLIST_DEFAULT_PROPS,
  FIGJAM_CHECKLIST_DEFINITION,
  FIGJAM_CHECKLIST_DEFINITION_ID,
  FIGJAM_KANBAN_DEFAULT_PROPS,
  FIGJAM_KANBAN_DEFINITION,
  FIGJAM_KANBAN_DEFINITION_ID,
  FIGJAM_LINK_PREVIEW_DEFAULT_PROPS,
  FIGJAM_LINK_PREVIEW_DEFINITION,
  FIGJAM_LINK_PREVIEW_DEFINITION_ID,
  FIGJAM_LINK_PREVIEW_ORIENTATIONS,
  FIGJAM_TABLE_DEFAULT_PROPS,
  FIGJAM_TABLE_DEFINITION,
  FIGJAM_TABLE_DEFINITION_ID,
  createFigJamChecklistNode,
  createFigJamKanbanNode,
  createFigJamLinkPreviewNode,
  createFigJamTableNode,
  parseFigJamChecklistProps,
  parseFigJamKanbanProps,
  parseFigJamLinkPreviewProps,
  parseFigJamTableProps,
  type CreateFigJamChecklistNodeInput,
  type CreateFigJamKanbanNodeInput,
  type CreateFigJamLinkPreviewNodeInput,
  type CreateFigJamTableNodeInput,
  type FigJamChecklistItem,
  type FigJamChecklistProps,
  type FigJamKanbanCard,
  type FigJamKanbanColumn,
  type FigJamKanbanProps,
  type FigJamLinkPreviewOrientation,
  type FigJamLinkPreviewProps,
  type FigJamTableProps,
} from './FigJamCollectionDefinitions'
export {
  FIGJAM_COMMENT_DEFAULT_PROPS,
  FIGJAM_COMMENT_DEFINITION,
  FIGJAM_COMMENT_DEFINITION_ID,
  createFigJamCommentNode,
  getFigJamResolvedCommentBounds,
  parseFigJamCommentProps,
  type CreateFigJamCommentNodeInput,
  type FigJamCommentMessage,
  type FigJamCommentProps,
  type FigJamResolvedCommentBounds,
} from './FigJamCommentDefinition'
export {
  FIGJAM_IMAGE_DEFAULT_PROPS,
  FIGJAM_IMAGE_DEFINITION,
  FIGJAM_IMAGE_DEFINITION_ID,
  createFigJamImageNode,
  parseFigJamImageProps,
  type CreateFigJamImageNodeInput,
  type FigJamImageProps,
} from './FigJamImageDefinition'
export {
  FIGJAM_STAMP_DEFAULT_PROPS,
  FIGJAM_STAMP_DEFINITION,
  FIGJAM_STAMP_DEFINITION_ID,
  FIGJAM_STAMP_KINDS,
  createFigJamStampNode,
  parseFigJamStampProps,
  type CreateFigJamStampNodeInput,
  type FigJamStampKind,
  type FigJamStampProps,
} from './FigJamStampDefinition'
export {
  FIGJAM_CONNECTOR_ANCHORS,
  FIGJAM_CONNECTOR_ARROWHEADS,
  FIGJAM_CONNECTOR_DEFAULT_PROPS,
  FIGJAM_CONNECTOR_DEFINITION,
  FIGJAM_CONNECTOR_DEFINITION_ID,
  FIGJAM_CONNECTOR_ROUTINGS,
  createFigJamConnectorNode,
  getFigJamResolvedConnectorBounds,
  parseFigJamConnectorProps,
  type CreateFigJamConnectorNodeInput,
  type FigJamConnectorAnchor,
  type FigJamConnectorArrowhead,
  type FigJamConnectorEndpoint,
  type FigJamConnectorEndpointInput,
  type FigJamConnectorProps,
  type FigJamConnectorRouting,
  type FigJamResolvedConnectorBounds,
} from './FigJamConnectorDefinition'
export {
  FIGJAM_DRAWING_DEFAULT_PROPS,
  FIGJAM_DRAWING_DEFINITION,
  FIGJAM_DRAWING_DEFINITION_ID,
  FIGJAM_DRAWING_VARIANTS,
  createFigJamDrawingNode,
  parseFigJamDrawingProps,
  type CreateFigJamDrawingNodeInput,
  type FigJamDrawingGeometry,
  type FigJamDrawingPathSegment,
  type FigJamDrawingProps,
  type FigJamDrawingVariant,
} from './FigJamDrawingDefinition'
export {
  FIGJAM_SHAPE_COLORS,
  FIGJAM_SHAPE_DEFAULT_PROPS,
  FIGJAM_SHAPE_DEFINITION,
  FIGJAM_SHAPE_DEFINITION_ID,
  FIGJAM_SHAPE_KINDS,
  FIGJAM_SHAPE_STROKES,
  createFigJamShapeNode,
  type CreateFigJamShapeNodeInput,
  type FigJamShapeColor,
  type FigJamShapeKind,
  type FigJamShapeProps,
  type FigJamShapeStroke,
} from './FigJamShapeDefinition'
export {
  FIGJAM_STICKY_NOTE_DEFAULT_PROPS,
  FIGJAM_STICKY_NOTE_DEFINITION,
  FIGJAM_STICKY_NOTE_DEFINITION_ID,
  FIGJAM_STICKY_NOTE_TONES,
  createFigJamStickyNoteNode,
  parseFigJamStickyNoteProps,
  type CreateFigJamStickyNoteNodeInput,
  type FigJamStickyNoteProps,
  type FigJamStickyNoteTone,
} from './FigJamStickyNoteDefinition'
export {
  FIGJAM_TEXT_ALIGNMENTS,
  FIGJAM_TEXT_DEFAULT_PROPS,
  FIGJAM_TEXT_DEFINITION,
  FIGJAM_TEXT_DEFINITION_ID,
  FIGJAM_TEXT_TONES,
  FIGJAM_TEXT_VARIANTS,
  createFigJamTextNode,
  parseFigJamTextProps,
  type CreateFigJamTextNodeInput,
  type FigJamTextAlignment,
  type FigJamTextProps,
  type FigJamTextTone,
  type FigJamTextVariant,
} from './FigJamTextDefinition'

export const FIGJAM_WIDGET_PACK = createReactDesignWidgetPack({
  definitions: [
    FIGJAM_STICKY_NOTE_DEFINITION,
    FIGJAM_SHAPE_DEFINITION,
    FIGJAM_TEXT_DEFINITION,
    FIGJAM_DRAWING_DEFINITION,
    FIGJAM_CONNECTOR_DEFINITION,
    FIGJAM_COMMENT_DEFINITION,
    FIGJAM_STAMP_DEFINITION,
    FIGJAM_IMAGE_DEFINITION,
    FIGJAM_CHECKLIST_DEFINITION,
    FIGJAM_KANBAN_DEFINITION,
    FIGJAM_TABLE_DEFINITION,
    FIGJAM_LINK_PREVIEW_DEFINITION,
  ],
})

export const FIGJAM_PRODUCT_DEFINITIONS = Object.freeze([
  ...FIGJAM_WIDGET_PACK.definitions,
  ...FIGJAM_STRUCTURAL_DEFINITIONS,
])

export const FIGJAM_PRODUCT_PACK = Object.freeze({
  definitions: FIGJAM_PRODUCT_DEFINITIONS,
  insertions: FIGJAM_INSERTION_DESCRIPTORS,
  widgetPack: FIGJAM_WIDGET_PACK,
})
