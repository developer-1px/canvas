import { describe, expect, it } from 'vitest'
import {
  createDesignDocument,
  restoreDesignDocument,
} from '@interactive-os/canvas/react-design'
import {
  FIGJAM_INSERTION_DESCRIPTORS,
  FIGJAM_PRODUCT_DEFINITIONS,
  createFigJamBoardNode,
  createFigJamCommentNode,
  createFigJamConnectorNode,
  createFigJamGroupNode,
} from '@interactive-os/figjam-pack'

const CANONICAL_DEFINITIONS = [
  ['figjam.sticky-note', 'widget'],
  ['figjam.shape', 'widget'],
  ['figjam.text', 'widget'],
  ['figjam.drawing', 'widget'],
  ['figjam.connector', 'widget'],
  ['figjam.comment', 'widget'],
  ['figjam.stamp', 'widget'],
  ['figjam.image', 'widget'],
  ['figjam.checklist', 'widget'],
  ['figjam.kanban', 'widget'],
  ['figjam.table', 'widget'],
  ['figjam.link-preview', 'widget'],
  ['figjam.board', 'component'],
  ['figjam.section', 'component'],
  ['figjam.group', 'component'],
] as const

const INSERTION_ALIASES = [
  ['sticky', 'figjam.sticky-note'],
  ['shape', 'figjam.shape'],
  ['text', 'figjam.text'],
  ['label', 'figjam.text'],
  ['card', 'figjam.text'],
  ['section', 'figjam.section'],
  ['drawing-marker', 'figjam.drawing'],
  ['drawing-highlight', 'figjam.drawing'],
  ['drawing-path', 'figjam.drawing'],
  ['connector', 'figjam.connector'],
  ['legacy-connector', 'figjam.connector'],
  ['comment', 'figjam.comment'],
  ['stamp', 'figjam.stamp'],
  ['vote', 'figjam.stamp'],
  ['image', 'figjam.image'],
  ['image-placeholder', 'figjam.image'],
  ['checklist', 'figjam.checklist'],
  ['todo', 'figjam.checklist'],
  ['kanban', 'figjam.kanban'],
  ['table', 'figjam.table'],
  ['link-preview', 'figjam.link-preview'],
] as const

describe('FigJam family persistence matrix', () => {
  it('registers the exact canonical definitions and insertion aliases', () => {
    expect(FIGJAM_PRODUCT_DEFINITIONS.map(({ id, kind }) => [id, kind]))
      .toEqual(CANONICAL_DEFINITIONS)
    expect(FIGJAM_INSERTION_DESCRIPTORS.map(({ id, definitionId }) => [
      id,
      definitionId,
    ])).toEqual(INSERTION_ALIASES)
  })

  it('restores every insertion alias and stable reference from serialization', () => {
    const insertionNodes = FIGJAM_INSERTION_DESCRIPTORS.map(
      (descriptor, index) => descriptor.create({
        nodeId: `matrix-${descriptor.id}`,
        x: index * 24,
        y: index * 16,
      }),
    )
    const connector = createFigJamConnectorNode({
      end: {
        attachedNodeId: 'matrix-sticky',
        point: { x: 260, y: 96 },
      },
      nodeId: 'matrix-attached-connector',
      start: {
        attachedNodeId: 'matrix-shape',
        point: { x: 40, y: 32 },
      },
      x: 40,
      y: 32,
    })
    const comment = createFigJamCommentNode({
      attachedNodeId: 'matrix-shape',
      body: 'Stable reference',
      nodeId: 'matrix-attached-comment',
      x: 84,
      y: 48,
    })
    const group = {
      ...createFigJamGroupNode({
        nodeId: 'matrix-group',
        x: 0,
        y: 0,
      }),
      children: [
        ...insertionNodes.map(({ id }) => id),
        connector.id,
        comment.id,
      ],
    }
    const board = {
      ...createFigJamBoardNode({ nodeId: 'matrix-board' }),
      children: [group.id],
    }
    const source = createDesignDocument({
      schemaVersion: 1,
      roots: [board.id],
      nodes: [board, group, ...insertionNodes, connector, comment],
    })
    const serialized = source.serialize()
    const restored = restoreDesignDocument(serialized)

    expect(new Set(source.snapshot.nodes.map(({ definition }) => definition.id)))
      .toEqual(new Set(CANONICAL_DEFINITIONS.map(([id]) => id)))
    expect(restored.snapshot).toEqual(source.snapshot)
    expect(restored.serialize()).toBe(serialized)
    expect(restored.read.node(connector.id)?.props).toMatchObject({
      end: { attachedNodeId: 'matrix-sticky' },
      start: { attachedNodeId: 'matrix-shape' },
    })
    expect(restored.read.node(comment.id)?.props).toMatchObject({
      attachedNodeId: 'matrix-shape',
      attachmentOrigin: { x: 84, y: 48 },
    })
    expect(restored.read.node(comment.id)?.text).toBe('Stable reference')
  })
})
