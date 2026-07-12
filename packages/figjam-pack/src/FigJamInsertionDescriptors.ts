import type {
  DesignNode,
  ReactDesignDefinitionRegistration,
} from '@interactive-os/canvas/react-design'

import {
  FIGJAM_CHECKLIST_DEFINITION,
  FIGJAM_KANBAN_DEFINITION,
  FIGJAM_LINK_PREVIEW_DEFINITION,
  FIGJAM_TABLE_DEFINITION,
  createFigJamChecklistNode,
} from './FigJamCollectionDefinitions'
import {
  FIGJAM_COMMENT_DEFINITION,
} from './FigJamCommentDefinition'
import {
  FIGJAM_CONNECTOR_DEFINITION,
  createFigJamConnectorNode,
} from './FigJamConnectorDefinition'
import {
  FIGJAM_DRAWING_DEFINITION,
  createFigJamDrawingNode,
} from './FigJamDrawingDefinition'
import {
  FIGJAM_IMAGE_DEFINITION,
  createFigJamImageNode,
} from './FigJamImageDefinition'
import {
  FIGJAM_SHAPE_DEFINITION,
} from './FigJamShapeDefinition'
import {
  FIGJAM_STAMP_DEFINITION,
  createFigJamStampNode,
} from './FigJamStampDefinition'
import {
  FIGJAM_STICKY_NOTE_DEFINITION,
} from './FigJamStickyNoteDefinition'
import {
  FIGJAM_SECTION_DEFINITION,
} from './FigJamStructuralDefinitions'
import {
  FIGJAM_TEXT_DEFINITION,
  createFigJamTextNode,
} from './FigJamTextDefinition'
import type { FigJamPlacementInput } from './FigJamWidgetPrimitives'

export const FIGJAM_INSERTION_IDS = [
  'sticky',
  'shape',
  'text',
  'label',
  'card',
  'section',
  'drawing-marker',
  'drawing-highlight',
  'drawing-path',
  'connector',
  'legacy-connector',
  'comment',
  'stamp',
  'vote',
  'image',
  'image-placeholder',
  'checklist',
  'todo',
  'kanban',
  'table',
  'link-preview',
] as const

export type FigJamInsertionId = typeof FIGJAM_INSERTION_IDS[number]

export type FigJamInsertionDescriptor = Readonly<{
  create(input: FigJamPlacementInput): DesignNode
  readonly definitionId: string
  readonly id: FigJamInsertionId
  readonly label: string
}>

export const FIGJAM_INSERTION_DESCRIPTORS = Object.freeze([
  descriptor('sticky', 'Sticky note', FIGJAM_STICKY_NOTE_DEFINITION),
  descriptor('shape', 'Shape', FIGJAM_SHAPE_DEFINITION),
  descriptor('text', 'Text', FIGJAM_TEXT_DEFINITION),
  descriptor('label', 'Label', FIGJAM_TEXT_DEFINITION,
    (input) => createFigJamTextNode({ ...input, variant: 'label' })),
  descriptor('card', 'Card', FIGJAM_TEXT_DEFINITION,
    (input) => createFigJamTextNode({ ...input, variant: 'card' })),
  descriptor('section', 'Section', FIGJAM_SECTION_DEFINITION),
  descriptor('drawing-marker', 'Marker', FIGJAM_DRAWING_DEFINITION,
    (input) => createFigJamDrawingNode({
      ...input,
      geometry: { kind: 'points', points: [{ x: 0, y: 0 }, { x: 80, y: 24 }] },
      variant: 'marker',
    })),
  descriptor('drawing-highlight', 'Highlighter', FIGJAM_DRAWING_DEFINITION,
    (input) => createFigJamDrawingNode({
      ...input,
      geometry: { kind: 'points', points: [{ x: 0, y: 12 }, { x: 96, y: 12 }] },
      variant: 'highlight',
    })),
  descriptor('drawing-path', 'Pen path', FIGJAM_DRAWING_DEFINITION,
    (input) => createFigJamDrawingNode({
      ...input,
      geometry: {
        kind: 'path',
        segments: [
          { type: 'move', point: { x: 0, y: 0 } },
          { type: 'line', point: { x: 80, y: 24 } },
        ],
      },
      variant: 'path',
    })),
  descriptor('connector', 'Connector', FIGJAM_CONNECTOR_DEFINITION,
    createDefaultConnector),
  descriptor('legacy-connector', 'Bounded connector',
    FIGJAM_CONNECTOR_DEFINITION, createDefaultConnector),
  descriptor('comment', 'Comment', FIGJAM_COMMENT_DEFINITION),
  descriptor('stamp', 'Stamp', FIGJAM_STAMP_DEFINITION),
  descriptor('vote', 'Vote', FIGJAM_STAMP_DEFINITION,
    (input) => createFigJamStampNode({ ...input, stamp: 'vote', label: '+1' })),
  descriptor('image', 'Image', FIGJAM_IMAGE_DEFINITION),
  descriptor('image-placeholder', 'Image placeholder',
    FIGJAM_IMAGE_DEFINITION,
    (input) => createFigJamImageNode({ ...input, src: null })),
  descriptor('checklist', 'Checklist', FIGJAM_CHECKLIST_DEFINITION),
  descriptor('todo', 'Todo', FIGJAM_CHECKLIST_DEFINITION,
    (input) => createFigJamChecklistNode({ ...input, title: 'Todo' })),
  descriptor('kanban', 'Kanban', FIGJAM_KANBAN_DEFINITION),
  descriptor('table', 'Table', FIGJAM_TABLE_DEFINITION),
  descriptor('link-preview', 'Link preview', FIGJAM_LINK_PREVIEW_DEFINITION),
] satisfies readonly FigJamInsertionDescriptor[])

const insertionById = new Map(
  FIGJAM_INSERTION_DESCRIPTORS.map((entry) => [entry.id, entry]),
)

export function createFigJamInsertion(
  id: FigJamInsertionId,
  input: FigJamPlacementInput,
) {
  const entry = insertionById.get(id)

  if (!entry) {
    throw new Error(`Unknown FigJam insertion: ${id}`)
  }

  return entry.create(input)
}

function descriptor(
  id: FigJamInsertionId,
  label: string,
  definition: ReactDesignDefinitionRegistration,
  create?: (input: FigJamPlacementInput) => DesignNode,
): FigJamInsertionDescriptor {
  return Object.freeze({
    create: create
      ? (input: FigJamPlacementInput) => definition.ownCreatedNode(
          input,
          () => create(input),
        )
      : (input: FigJamPlacementInput) => definition.create(input),
    definitionId: definition.id,
    id,
    label,
  })
}

function createDefaultConnector(input: FigJamPlacementInput) {
  return createFigJamConnectorNode({
    ...input,
    end: { point: { x: input.x + 220, y: input.y + 64 } },
    start: { point: { x: input.x, y: input.y } },
  })
}
