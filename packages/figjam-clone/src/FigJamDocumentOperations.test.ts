import { describe, expect, it } from 'vitest'
import {
  createDesignDocument,
  type DesignDocumentRead,
  type DesignDocumentSnapshot,
  type DesignNode,
} from '@interactive-os/canvas/react-design'
import {
  createFigJamBoardNode,
  createFigJamCommentNode,
  createFigJamConnectorNode,
  createFigJamShapeNode,
  getFigJamResolvedCommentBounds,
  parseFigJamCommentProps,
} from '@interactive-os/figjam-pack'

import {
  captureFigJamClipboard,
  planFigJamClipboardInsert,
  planFigJamRemoveSelection,
  planFigJamUnwrapContainer,
  planFigJamWrapSelection,
} from './FigJamDocumentOperations'
import {
  readFigJamNodeWorldBounds,
  readFigJamNodeWorldOrigin,
  unionFigJamBounds,
} from './FigJamDocumentGeometry'

describe('FigJam document operations', () => {
  it('wraps and unwraps siblings without changing their world geometry', () => {
    const document = createDesignDocument(createSnapshot())
    const beforeA = readFigJamNodeWorldBounds(document.read, 'a')
    const beforeB = readFigJamNodeWorldBounds(document.read, 'b')
    const wrap = planFigJamWrapSelection({
      container: createNode('group', 0, 0, 1, 1, 'figjam.group'),
      nodeIds: ['b', 'a'],
      read: document.read,
    })

    expect(wrap).not.toBeNull()
    expect(document.execute({
      label: 'Group nodes',
      changes: wrap?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(document.read.children('group').map(({ id }) => id))
      .toEqual(['a', 'b'])
    expect(readFigJamNodeWorldBounds(document.read, 'a')).toEqual(beforeA)
    expect(readFigJamNodeWorldBounds(document.read, 'b')).toEqual(beforeB)

    const unwrap = planFigJamUnwrapContainer(document.read, 'group')

    expect(unwrap).not.toBeNull()
    expect(document.execute({
      label: 'Ungroup nodes',
      changes: unwrap?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(document.read.children('board').map(({ id }) => id))
      .toEqual(['a', 'b'])
    expect(readFigJamNodeWorldBounds(document.read, 'a')).toEqual(beforeA)
    expect(readFigJamNodeWorldBounds(document.read, 'b')).toEqual(beforeB)
  })

  it('preserves mixed attached and free connector geometry through wrap and unwrap', () => {
    const target = createFigJamShapeNode({
      height: 80,
      nodeId: 'connector-target',
      width: 100,
      x: 200,
      y: 100,
    })
    const connector = createFigJamConnectorNode({
      end: { point: { x: 520, y: 180 } },
      height: 200,
      nodeId: 'mixed-connector',
      start: {
        anchor: 'right',
        attachedNodeId: target.id,
        point: { x: 300, y: 140 },
      },
      width: 500,
      x: 50,
      y: 40,
    })
    const board = {
      ...createFigJamBoardNode({ nodeId: 'connector-board' }),
      children: [target.id, connector.id],
    }
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [board.id],
      nodes: [board, target, connector],
    })
    const beforeBounds = readFigJamNodeWorldBounds(
      document.read,
      connector.id,
    )
    const beforeOrigin = readFigJamNodeWorldOrigin(
      document.read,
      connector.id,
    )
    const wrap = planFigJamWrapSelection({
      container: createNode(
        'connector-group',
        0,
        0,
        1,
        1,
        'figjam.group',
      ),
      nodeIds: [target.id, connector.id],
      read: document.read,
    })

    expect(document.execute({
      label: 'Group target and connector',
      changes: wrap?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(readFigJamNodeWorldBounds(document.read, connector.id))
      .toEqual(beforeBounds)
    expect(readFigJamNodeWorldOrigin(document.read, connector.id))
      .toEqual(beforeOrigin)

    const unwrap = planFigJamUnwrapContainer(
      document.read,
      'connector-group',
    )

    expect(document.execute({
      label: 'Ungroup target and connector',
      changes: unwrap?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(readFigJamNodeWorldBounds(document.read, connector.id))
      .toEqual(beforeBounds)
    expect(readFigJamNodeWorldOrigin(document.read, connector.id))
      .toEqual(beforeOrigin)
  })

  it('preserves an attached comment relation through wrap and unwrap', () => {
    const target = createFigJamShapeNode({
      height: 80,
      nodeId: 'wrapped-comment-target',
      width: 100,
      x: 100,
      y: 80,
    })
    const comment = createFigJamCommentNode({
      attachedNodeId: target.id,
      nodeId: 'wrapped-comment',
      x: 12,
      y: 12,
    })
    const board = {
      ...createFigJamBoardNode({ nodeId: 'comment-wrap-board' }),
      children: [target.id, comment.id],
    }
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [board.id],
      nodes: [board, target, comment],
    })
    const beforeVisualOrigin = readAttachedCommentVisualOrigin(
      document.read,
      comment.id,
    )
    const beforeTargetBounds = readFigJamNodeWorldBounds(
      document.read,
      target.id,
    )
    const beforeCommentBounds = getFigJamResolvedCommentBounds(
      document.read,
      comment.id,
    )
    const expectedWrapperBounds = beforeTargetBounds && beforeCommentBounds
      ? unionFigJamBounds([beforeTargetBounds, beforeCommentBounds])
      : null
    const wrap = planFigJamWrapSelection({
      container: createNode(
        'comment-group',
        0,
        0,
        1,
        1,
        'figjam.group',
      ),
      nodeIds: [target.id, comment.id],
      read: document.read,
    })

    expect(document.execute({
      label: 'Group target and attached comment',
      changes: wrap?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(readFigJamNodeWorldBounds(document.read, 'comment-group'))
      .toEqual(expectedWrapperBounds)
    expect(readFigJamNodeWorldBounds(document.read, comment.id))
      .toEqual(beforeCommentBounds)
    expect(readAttachedCommentVisualOrigin(document.read, comment.id))
      .toEqual(beforeVisualOrigin)

    const unwrap = planFigJamUnwrapContainer(document.read, 'comment-group')

    expect(document.execute({
      label: 'Ungroup target and attached comment',
      changes: unwrap?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(readFigJamNodeWorldBounds(document.read, comment.id))
      .toEqual(beforeCommentBounds)
    expect(readAttachedCommentVisualOrigin(document.read, comment.id))
      .toEqual(beforeVisualOrigin)
  })

  it('clones a subtree and remaps internal stable references', () => {
    const document = createDesignDocument(createSnapshot({ connector: true }))
    const clipboard = captureFigJamClipboard(
      document.read,
      ['a', 'connector'],
    )
    const plan = clipboard && planFigJamClipboardInsert({
      clipboard,
      createId: (sourceId) => `${sourceId}-copy`,
      fallbackParentId: 'board',
      read: document.read,
    })

    expect(plan).not.toBeNull()
    expect(document.execute({
      label: 'Paste nodes',
      changes: plan?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(document.read.node('connector-copy')?.props).toMatchObject({
      end: { attachedNodeId: 'a-copy' },
      start: { attachedNodeId: 'b' },
    })
    expect(document.read.node('a-copy')?.layout).toMatchObject({
      x: 34,
      y: 44,
    })
  })

  it('translates attached comment geometry only with its copied target', () => {
    const target = createFigJamShapeNode({
      nodeId: 'comment-target',
      x: 100,
      y: 80,
    })
    const comment = createFigJamCommentNode({
      attachedNodeId: target.id,
      nodeId: 'attached-comment',
      x: 12,
      y: 12,
    })
    const board = {
      ...createFigJamBoardNode({ nodeId: 'comment-board' }),
      children: [target.id, comment.id],
    }
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [board.id],
      nodes: [board, target, comment],
    })
    const internalClipboard = captureFigJamClipboard(
      document.read,
      [target.id, comment.id],
    )
    const internalPlan = internalClipboard && planFigJamClipboardInsert({
      clipboard: internalClipboard,
      createId: (sourceId) => `${sourceId}-copy`,
      fallbackParentId: board.id,
      read: document.read,
    })

    expect(document.execute({
      label: 'Paste target and comment',
      changes: internalPlan?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(document.read.node('attached-comment-copy')?.props).toMatchObject({
      attachedNodeId: 'comment-target-copy',
      attachmentOrigin: { x: 36, y: 36 },
    })

    const externalClipboard = captureFigJamClipboard(document.read, [comment.id])
    const externalPlan = externalClipboard && planFigJamClipboardInsert({
      clipboard: externalClipboard,
      createId: (sourceId) => `${sourceId}-external-copy`,
      fallbackParentId: board.id,
      read: document.read,
    })

    expect(document.execute({
      label: 'Paste comment only',
      changes: externalPlan?.changes ?? [],
    })).toEqual({ ok: true, changed: true })
    expect(document.read.node('attached-comment-external-copy')?.props)
      .toMatchObject({
        attachedNodeId: target.id,
        attachmentOrigin: { x: 12, y: 12 },
      })
  })

  it('materializes and detaches references in the same reversible delete', () => {
    const target = createFigJamShapeNode({
      height: 80,
      nodeId: 'target',
      width: 100,
      x: 200,
      y: 100,
    })
    const connector = createFigJamConnectorNode({
      end: { point: { x: 500, y: 140 } },
      height: 200,
      nodeId: 'connector-ref',
      start: {
        anchor: 'right',
        attachedNodeId: target.id,
        point: { x: 300, y: 140 },
      },
      width: 500,
      x: 0,
      y: 0,
    })
    const board = {
      ...createFigJamBoardNode({ nodeId: 'reference-board' }),
      children: [target.id, connector.id],
    }
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [board.id],
      nodes: [board, target, connector],
    })

    document.execute({
      label: 'Move target',
      changes: [{
        type: 'update',
        nodeId: target.id,
        values: { layout: { ...target.layout, x: 320 } },
      }],
    })
    const plan = planFigJamRemoveSelection(document.read, [target.id])

    expect(document.execute({
      label: 'Delete target',
      changes: plan.changes,
    })).toEqual({ ok: true, changed: true })
    expect(document.read.node(connector.id)?.props).toMatchObject({
      start: {
        attachedNodeId: null,
        point: { x: 420, y: 140 },
      },
    })
    expect(document.undo()).toBe(true)
    expect(document.read.node(target.id)).not.toBeNull()
    expect(document.read.node(connector.id)?.props).toMatchObject({
      start: { attachedNodeId: target.id },
    })
    expect(document.redo()).toBe(true)
    expect(document.read.node(connector.id)?.props).toMatchObject({
      start: { attachedNodeId: null },
    })
  })
})

function createSnapshot({ connector = false } = {}): DesignDocumentSnapshot {
  const nodes: DesignNode[] = [
    createNode('board', 0, 0, 800, 600, 'figjam.board', ['a', 'b']),
    createNode('a', 10, 20, 100, 80, 'figjam.shape'),
    createNode('b', 160, 40, 120, 90, 'figjam.shape'),
  ]

  if (connector) {
    nodes[0] = { ...nodes[0], children: ['a', 'b', 'connector'] }
    nodes.push({
      ...createNode('connector', 0, 0, 1, 1, 'figjam.connector'),
      props: {
        arrowhead: 'end',
        coordinateHeight: 1,
        coordinateWidth: 1,
        end: {
          anchor: 'center',
          attachedNodeId: 'a',
          point: { x: 1, y: 1 },
        },
        position: 'absolute',
        routing: 'straight',
        start: {
          anchor: 'center',
          attachedNodeId: 'b',
          point: { x: 0, y: 0 },
        },
        stroke: '#475569',
        strokeWidth: 2.5,
      },
    })
  }

  return { schemaVersion: 1, roots: ['board'], nodes }
}

function createNode(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  definitionId: string,
  children: readonly string[] = [],
): DesignNode {
  return {
    id,
    label: id,
    definition: {
      id: definitionId,
      kind: definitionId === 'figjam.board' || definitionId === 'figjam.group'
        ? 'component'
        : 'widget',
    },
    children,
    props: { position: 'absolute' },
    text: null,
    layout: {
      x,
      y,
      w,
      h,
      widthMode: 'fixed',
      heightMode: 'fixed',
    },
    style: {},
    frame: null,
    component: null,
  }
}

function readAttachedCommentVisualOrigin(
  read: DesignDocumentRead,
  nodeId: string,
) {
  const node = read.node(nodeId)
  const parsed = parseFigJamCommentProps(node?.props)

  if (!node || !parsed.ok || !parsed.value.attachedNodeId) {
    return null
  }

  const target = readFigJamNodeWorldBounds(
    read,
    parsed.value.attachedNodeId,
  )
  const localX = typeof node.layout.x === 'number' ? node.layout.x : 0
  const localY = typeof node.layout.y === 'number' ? node.layout.y : 0

  return target
    ? {
      x: target.x + target.w + parsed.value.attachmentOffset.x + localX -
        parsed.value.attachmentOrigin.x,
      y: target.y + parsed.value.attachmentOffset.y + localY -
        parsed.value.attachmentOrigin.y,
    }
    : null
}
