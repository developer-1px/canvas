import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  ReactDesignRenderer,
  createDesignDocument,
  createDomProjection,
  createReactDesignDefinitionRegistry,
  type DesignNode,
} from '@interactive-os/canvas/react-design'

import {
  FIGJAM_PRODUCT_PACK,
  FIGJAM_PRODUCT_DEFINITIONS,
  FIGJAM_DRAWING_DEFINITION_ID,
  FIGJAM_CONNECTOR_DEFINITION_ID,
  FIGJAM_SHAPE_DEFINITION,
  FIGJAM_TEXT_DEFINITION_ID,
  createFigJamShapeNode,
  createFigJamDrawingNode,
  createFigJamConnectorNode,
  createFigJamCommentNode,
  createFigJamImageNode,
  createFigJamStampNode,
  createFigJamChecklistNode,
  createFigJamKanbanNode,
  createFigJamLinkPreviewNode,
  createFigJamTableNode,
  createFigJamBoardNode,
  createFigJamGroupNode,
  createFigJamSectionNode,
  FIGJAM_INSERTION_IDS,
  FIGJAM_INSERTION_DESCRIPTORS,
  createFigJamInsertion,
  getFigJamNodeReferenceIds,
  getFigJamResolvedCommentBounds,
  getFigJamResolvedConnectorBounds,
  planFigJamReferenceRepairs,
  remapFigJamNodeReferences,
  translateFigJamNodeReferenceGeometry,
  detachFigJamNodeReferences,
  materializeFigJamConnectorFallback,
  parseFigJamConnectorProps,
  parseFigJamChecklistProps,
  parseFigJamDrawingProps,
  parseFigJamImageProps,
  parseFigJamKanbanProps,
  parseFigJamLinkPreviewProps,
  parseFigJamTableProps,
  createFigJamTextNode,
} from './index'

describe('FigJam product pack', () => {
  it('publishes one duplicate-free catalog for twelve widgets and three structures', () => {
    const entries = FIGJAM_PRODUCT_DEFINITIONS.map(({ id, kind }) => ({ id, kind }))

    expect(entries).toEqual([
      { id: 'figjam.sticky-note', kind: 'widget' },
      { id: 'figjam.shape', kind: 'widget' },
      { id: 'figjam.text', kind: 'widget' },
      { id: 'figjam.drawing', kind: 'widget' },
      { id: 'figjam.connector', kind: 'widget' },
      { id: 'figjam.comment', kind: 'widget' },
      { id: 'figjam.stamp', kind: 'widget' },
      { id: 'figjam.image', kind: 'widget' },
      { id: 'figjam.checklist', kind: 'widget' },
      { id: 'figjam.kanban', kind: 'widget' },
      { id: 'figjam.table', kind: 'widget' },
      { id: 'figjam.link-preview', kind: 'widget' },
      { id: 'figjam.board', kind: 'component' },
      { id: 'figjam.section', kind: 'component' },
      { id: 'figjam.group', kind: 'component' },
    ])
    expect(new Set(entries.map(({ id }) => id)).size).toBe(entries.length)
  })

  it('creates and renders a directly editable text widget', () => {
    const node = createFigJamTextNode({
      nodeId: 'text-1',
      text: 'A DOM label',
      variant: 'label',
      x: 24,
      y: 36,
    })

    expect(node).toMatchObject({
      definition: { id: FIGJAM_TEXT_DEFINITION_ID, kind: 'widget' },
      text: 'A DOM label',
      props: { position: 'absolute', variant: 'label' },
    })
    expect(FIGJAM_PRODUCT_PACK.widgetPack.resolve(
      FIGJAM_TEXT_DEFINITION_ID,
    )?.capabilities.textEdit).toEqual({
      multiline: true,
      source: 'node-text',
    })
    expect(renderProductNode(node)).toContain('A DOM label')
    expect(renderProductNode(node)).toContain('data-figjam-widget="text"')
  })

  it('keeps shape geometry internal while exposing an editable DOM label', () => {
    const node = createFigJamShapeNode({
      nodeId: 'shape-1',
      shape: 'diamond',
      text: 'Decision',
      x: 80,
      y: 96,
    })
    const markup = renderProductNode(node)

    expect(FIGJAM_SHAPE_DEFINITION.capabilities.textEdit).toEqual({
      multiline: true,
      source: 'node-text',
    })
    expect(markup).toContain('<svg')
    expect(markup).toContain('Decision')
    expect(markup).toContain('figjam-shape__label')
  })

  it('stores drawing geometry as local JSON and renders only internal SVG', () => {
    const marker = createFigJamDrawingNode({
      geometry: {
        kind: 'points',
        points: [{ x: 0, y: 4 }, { x: 42, y: 20 }, { x: 84, y: 2 }],
      },
      nodeId: 'drawing-1',
      variant: 'marker',
      x: 120,
      y: 180,
    })
    const path = createFigJamDrawingNode({
      geometry: {
        kind: 'path',
        segments: [
          { type: 'move', point: { x: 0, y: 0 } },
          {
            type: 'cubic',
            control1: { x: 12, y: 0 },
            control2: { x: 24, y: 32 },
            point: { x: 40, y: 24 },
          },
        ],
      },
      nodeId: 'path-1',
      variant: 'path',
      x: 20,
      y: 24,
    })

    expect(marker.definition).toEqual({
      id: FIGJAM_DRAWING_DEFINITION_ID,
      kind: 'widget',
    })
    expect(JSON.parse(JSON.stringify([marker, path]))).toEqual([marker, path])
    expect(renderProductNode(marker)).toMatch(/<svg[^>]*>.*<polyline/s)
    expect(renderProductNode(path)).toContain('C12 0 24 32 40 24')
    expect(renderProductNode({
      ...marker,
      layout: { ...marker.layout, w: 168, h: 40 },
    })).toContain('viewBox="0 0 84 20"')
  })

  it('renders connector attachments from preview-aware canonical reads', () => {
    const target = createFigJamShapeNode({
      nodeId: 'target-1',
      width: 160,
      height: 120,
      x: 100,
      y: 80,
    })
    const connector = createFigJamConnectorNode({
      end: { point: { x: 420, y: 160 } },
      height: 320,
      nodeId: 'connector-1',
      routing: 'straight',
      start: {
        anchor: 'center',
        attachedNodeId: target.id,
        point: { x: 0, y: 0 },
      },
      text: 'Flow',
      width: 520,
      x: 0,
      y: 0,
    })
    const movedTarget = {
      ...target,
      layout: { ...target.layout, x: 200 },
    }
    const comment = createFigJamCommentNode({
      attachedNodeId: target.id,
      nodeId: 'attached-comment',
      x: 12,
      y: 12,
    })
    const movedComment = {
      ...comment,
      layout: { ...comment.layout, x: 32, y: 22 },
    }

    expect(connector).toMatchObject({
      definition: { id: FIGJAM_CONNECTOR_DEFINITION_ID, kind: 'widget' },
      props: { start: { attachedNodeId: 'target-1' } },
    })
    const initialMarkup = renderProductNodes([target, connector])
    const movedMarkup = renderProductNodes([movedTarget, connector])

    expect(readRenderedNodeTag(initialMarkup, connector.id)).toContain(
      'width:240px;height:24px;left:180px;top:138px',
    )
    expect(initialMarkup).toContain('M0 2 L240 22')
    expect(readRenderedNodeTag(movedMarkup, connector.id)).toContain(
      'width:140px;height:24px;left:280px;top:138px',
    )
    expect(movedMarkup).toContain('M0 2 L140 22')

    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [target.id, connector.id],
      nodes: [target, connector],
    })
    expect(getFigJamResolvedConnectorBounds(document.read, connector.id))
      .toEqual({ h: 24, w: 240, x: 180, y: 138 })
    expect(renderProductNodes([target, comment]))
      .toContain('left:248px')
    expect(renderProductNodes([movedTarget, comment]))
      .toContain('left:348px')
    expect(renderProductNodes([target, movedComment]))
      .toContain('left:268px')

    const commentDocument = createDesignDocument({
      schemaVersion: 1,
      roots: [target.id, comment.id],
      nodes: [target, comment],
    })
    expect(getFigJamResolvedCommentBounds(commentDocument.read, comment.id))
      .toEqual({ h: 36, w: 220, x: 248, y: 68 })
  })

  it('renders comment, stamp, and nullable image widgets as direct DOM', () => {
    const comment = createFigJamCommentNode({
      attachedNodeId: 'shape-1',
      body: 'Needs follow-up',
      nodeId: 'comment-1',
      x: 40,
      y: 44,
    })
    const stamp = createFigJamStampNode({
      label: '+1',
      nodeId: 'stamp-1',
      stamp: 'vote',
      x: 88,
      y: 44,
    })
    const image = createFigJamImageNode({
      alt: 'Placeholder',
      nodeId: 'image-1',
      src: null,
      x: 140,
      y: 44,
    })
    const authoredImage = createFigJamImageNode({
      alt: 'Pixel',
      mimeType: 'image/png',
      nodeId: 'image-2',
      src: 'data:image/png;base64,iVBORw0KGgo=',
      x: 400,
      y: 44,
    })

    expect(comment.props).toMatchObject({ attachedNodeId: 'shape-1' })
    expect(renderProductNode(comment)).toContain('Needs follow-up')
    expect(renderProductNode(stamp)).toContain('+1')
    expect(renderProductNode(image)).toContain('Image placeholder')
    expect(renderProductNode(image)).not.toContain('<img')
    expect(renderProductNode(authoredImage)).toContain('<img')
    expect(renderProductNode(authoredImage)).toContain('alt="Pixel"')
  })

  it('uses canonical bounds for free and missing-target comments', () => {
    const free = createFigJamCommentNode({
      nodeId: 'free-comment-bounds',
      x: 40,
      y: 44,
    })
    const missingTarget = createFigJamCommentNode({
      attachedNodeId: 'missing-target',
      nodeId: 'missing-target-comment-bounds',
      x: 60,
      y: 64,
    })
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [free.id, missingTarget.id],
      nodes: [free, missingTarget],
    })

    expect(getFigJamResolvedCommentBounds(document.read, free.id))
      .toEqual({ h: 36, w: 220, x: 40, y: 44 })
    expect(getFigJamResolvedCommentBounds(document.read, missingTarget.id))
      .toEqual({ h: 36, w: 220, x: 60, y: 64 })
  })

  it('renders command-created checklist, kanban, table, and link previews', () => {
    const checklist = createFigJamChecklistNode({
      items: [{ id: 'scope', text: 'Scope', checked: true }],
      nodeId: 'checklist-1',
      title: 'Todo',
      x: 20,
      y: 20,
    })
    const kanban = createFigJamKanbanNode({ nodeId: 'kanban-1', x: 260, y: 20 })
    const table = createFigJamTableNode({ nodeId: 'table-1', x: 500, y: 20 })
    const link = createFigJamLinkPreviewNode({
      description: 'Reference',
      nodeId: 'link-1',
      title: 'OpenAI',
      url: 'https://openai.com',
      x: 780,
      y: 20,
    })

    expect(renderProductNode(checklist)).toContain('type="checkbox"')
    expect(renderProductNode(checklist)).toContain('checked=""')
    expect(renderProductNode(kanban)).toContain('data-figjam-widget="kanban"')
    expect(renderProductNode(table)).toContain('<table')
    expect(renderProductNode(link)).toContain('href="https://openai.com"')
  })

  it('renders board, section, and group as registered structural nodes', () => {
    const text = createFigJamTextNode({ nodeId: 'nested-text', x: 8, y: 12 })
    const group = { ...createFigJamGroupNode({
      nodeId: 'group-1',
      x: 20,
      y: 60,
    }), children: [text.id] }
    const section = { ...createFigJamSectionNode({
      label: 'Planning',
      nodeId: 'section-1',
      x: 40,
      y: 40,
    }), children: [group.id] }
    const board = { ...createFigJamBoardNode({ nodeId: 'board-1' }),
      children: [section.id] }
    const markup = renderProductTree([board, section, group, text], board.id)

    expect(board.definition.kind).toBe('component')
    expect(section.definition.kind).toBe('component')
    expect(group.definition.kind).toBe('component')
    expect(markup).toContain('data-figjam-structure="board"')
    expect(markup).toContain('data-figjam-structure="section"')
    expect(markup).toContain('data-figjam-structure="group"')
    expect(markup).toContain('Text')
  })

  it('reduces hidden command families through stable insertion aliases', () => {
    const base = { nodeId: 'alias-1', x: 20, y: 30 }
    const label = createFigJamInsertion('label', base)
    const card = createFigJamInsertion('card', { ...base, nodeId: 'alias-2' })
    const legacyConnector = createFigJamInsertion('legacy-connector', {
      ...base,
      nodeId: 'alias-3',
    })
    const todo = createFigJamInsertion('todo', { ...base, nodeId: 'alias-4' })
    const vote = createFigJamInsertion('vote', { ...base, nodeId: 'alias-5' })
    const placeholder = createFigJamInsertion('image-placeholder', {
      ...base,
      nodeId: 'alias-6',
    })

    expect(FIGJAM_INSERTION_DESCRIPTORS.map(({ id }) => id))
      .toEqual(expect.arrayContaining([
        'label', 'card', 'legacy-connector', 'todo', 'vote',
        'image-placeholder', 'link-preview',
      ]))
    expect(label.props).toMatchObject({ variant: 'label' })
    expect(card.props).toMatchObject({ variant: 'card' })
    expect(legacyConnector.definition.id).toBe(FIGJAM_CONNECTOR_DEFINITION_ID)
    expect(todo.definition.id).toBe('figjam.checklist')
    expect(vote.props).toMatchObject({ stamp: 'vote' })
    expect(placeholder.props).toMatchObject({ src: null })
  })

  it('keeps group creation behind the wrap command', () => {
    expect([...FIGJAM_INSERTION_IDS]).not.toContain('group')
    expect(FIGJAM_INSERTION_DESCRIPTORS.map(({ id }) => id as string))
      .not.toContain('group')
  })

  it('creates safe arrowhead ids across arbitrary ids and render surfaces', () => {
    const createConnector = (nodeId: string, stroke: string) =>
      createFigJamConnectorNode({
        end: { point: { x: 120, y: 48 } },
        nodeId,
        start: { point: { x: 0, y: 0 } },
        stroke,
        x: 0,
        y: 0,
      })
    const firstMarkup = renderProductNode(createConnector(
      'connector:/<unsafe>#one',
      '#ef4444',
    ))
    const secondMarkup = renderProductNode(createConnector(
      'connector:/<unsafe>#two',
      '#2563eb',
    ))
    const markerIds = [firstMarkup, secondMarkup].map((markup) =>
      markup.match(/<marker id="([^"]+)"/)?.[1])

    expect(markerIds).toHaveLength(2)
    expect(markerIds.every((id) => id !== undefined)).toBe(true)
    expect(new Set(markerIds).size).toBe(2)

    for (const [markup, markerId] of [
      [firstMarkup, markerIds[0]],
      [secondMarkup, markerIds[1]],
    ] as const) {
      expect(markerId).toMatch(/^[a-z][a-z0-9_-]*$/i)
      expect(markup).toContain(`marker-end="url(#${markerId})"`)
    }
  })

  it('positions resolved connector bounds in its parent coordinate space', () => {
    const target = createFigJamShapeNode({
      nodeId: 'nested-bounds-target',
      height: 120,
      width: 160,
      x: 200,
      y: 80,
    })
    const connector = createFigJamConnectorNode({
      end: { point: { x: 310, y: 120 } },
      height: 100,
      nodeId: 'nested-bounds-connector',
      routing: 'straight',
      start: {
        attachedNodeId: target.id,
        point: { x: 10, y: 20 },
      },
      width: 300,
      x: 10,
      y: 20,
    })
    const group = {
      ...createFigJamGroupNode({
        height: 320,
        nodeId: 'connector-parent',
        width: 520,
        x: 40,
        y: 50,
      }),
      children: [connector.id],
    }
    const markup = renderProductTree(
      [group, connector, target],
      group.id,
      target.id,
    )

    expect(readRenderedNodeTag(markup, connector.id)).toContain(
      'width:70px;height:30px;left:240px;top:90px',
    )
    expect(markup).toContain('M0 0 L70 30')
  })

  it('creates a serializable node for every insertion descriptor', () => {
    const definitionIds = new Set(
      FIGJAM_PRODUCT_DEFINITIONS.map(({ id }) => id),
    )

    FIGJAM_INSERTION_DESCRIPTORS.forEach((descriptor, index) => {
      const node = descriptor.create({
        nodeId: `insertion-${descriptor.id}`,
        x: index * 12,
        y: index * 8,
      })

      expect(definitionIds.has(node.definition.id)).toBe(true)
      expect(Object.isFrozen(node)).toBe(true)
      expect(Object.isFrozen(node.props)).toBe(true)
      expect(JSON.parse(JSON.stringify(node))).toEqual(node)
      expect(renderProductNode(node)).not.toMatch(/<canvas|foreignObject/)
      expect(() => createDesignDocument({
        schemaVersion: 1,
        roots: [node.id],
        nodes: [node],
      })).not.toThrow()
    })
  })

  it('plans generic stable-id remap and detach updates for reference widgets', () => {
    const left = createFigJamShapeNode({ nodeId: 'left', x: 100, y: 80 })
    const right = createFigJamShapeNode({ nodeId: 'right', x: 400, y: 80 })
    const connector = createFigJamConnectorNode({
      end: { attachedNodeId: 'right', point: { x: 200, y: 0 } },
      nodeId: 'connector-ref',
      start: { attachedNodeId: 'left', point: { x: 0, y: 0 } },
      x: 0,
      y: 0,
    })
    const comment = createFigJamCommentNode({
      attachedNodeId: 'left',
      nodeId: 'comment-ref',
      x: 0,
      y: 0,
    })
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [left.id, right.id, connector.id, comment.id],
      nodes: [left, right, connector, comment],
    })

    expect(getFigJamNodeReferenceIds(connector)).toEqual(['left', 'right'])
    expect(remapFigJamNodeReferences(connector, new Map([
      ['left', 'left-copy'],
      ['right', 'right-copy'],
    ])).props).toMatchObject({
      start: { attachedNodeId: 'left-copy' },
      end: { attachedNodeId: 'right-copy' },
    })
    expect(planFigJamReferenceRepairs({
      nodes: [left, right, connector, comment],
      read: document.read,
      removingNodeIds: ['left'],
    })).toEqual([
      expect.objectContaining({
        type: 'update',
        nodeId: connector.id,
        values: { props: expect.objectContaining({
          start: expect.objectContaining({
            attachedNodeId: null,
            point: { x: 180, y: 140 },
          }),
        }) },
      }),
      expect.objectContaining({
        type: 'update',
        nodeId: comment.id,
        values: expect.objectContaining({
          props: expect.objectContaining({ attachedNodeId: null }),
          layout: expect.objectContaining({ x: 248, y: 68 }),
        }),
      }),
    ])
  })

  it('translates attached comment geometry once with its pasted target', () => {
    const target = createFigJamShapeNode({
      nodeId: 'copy-target',
      x: 100,
      y: 80,
    })
    const comment = createFigJamCommentNode({
      attachedNodeId: target.id,
      nodeId: 'copy-comment',
      x: 12,
      y: 12,
    })
    const copiedTarget = {
      ...target,
      id: 'copy-target-pasted',
      layout: { ...target.layout, x: 124, y: 104 },
    }
    const copiedComment = translateFigJamNodeReferenceGeometry(
      remapFigJamNodeReferences({
        ...comment,
        id: 'copy-comment-pasted',
        layout: { ...comment.layout, x: 36, y: 36 },
      }, new Map([[target.id, copiedTarget.id]])),
      24,
      24,
    )
    const markup = renderProductNodes([copiedTarget, copiedComment])

    expect(copiedComment.props).toMatchObject({
      attachedNodeId: copiedTarget.id,
      attachmentOrigin: { x: 36, y: 36 },
    })
    expect(readRenderedNodeTag(markup, copiedComment.id)).toContain(
      'left:272px;top:92px',
    )
  })

  it('keeps resized connector geometry stable while materializing detach fallback', () => {
    const target = createFigJamShapeNode({ nodeId: 'resize-target', x: 100, y: 80 })
    const connector = createFigJamConnectorNode({
      end: { point: { x: 200, y: 0 } },
      height: 24,
      nodeId: 'resize-connector',
      start: {
        attachedNodeId: target.id,
        point: { x: 0, y: 0 },
      },
      width: 200,
      x: 0,
      y: 0,
    })
    const resized = {
      ...connector,
      layout: { ...connector.layout, h: 48, w: 400 },
    }
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [target.id, resized.id],
      nodes: [target, resized],
    })
    const materialized = materializeFigJamConnectorFallback(
      resized,
      document.read,
    )
    const detached = detachFigJamNodeReferences(
      resized,
      new Set([target.id]),
      document.read,
    )

    expect(materialized.props).toMatchObject({
      coordinateWidth: 200,
      coordinateHeight: 24,
      start: { attachedNodeId: target.id, point: { x: 90, y: 70 } },
    })
    expect(detached.props).toMatchObject({
      start: { attachedNodeId: null, point: { x: 90, y: 70 } },
    })
    const attachedMarkup = renderProductNodes([target, resized])
    const detachedMarkup = renderProductNode(detached)

    expect(readRenderedNodeTag(attachedMarkup, resized.id)).toContain(
      'width:220px;height:140px;left:180px;top:0',
    )
    expect(attachedMarkup).toContain('viewBox="0 0 220 140"')
    expect(detachedMarkup).toContain('M0 140 H110 V0 H220')
  })

  it('repairs references to removed structural descendants with undo and redo', () => {
    const target = createFigJamShapeNode({ nodeId: 'nested-target', x: 40, y: 40 })
    const group = {
      ...createFigJamGroupNode({ nodeId: 'removed-group', x: 80, y: 60 }),
      children: [target.id],
    }
    const connector = createFigJamConnectorNode({
      end: { point: { x: 420, y: 160 } },
      nodeId: 'outside-connector',
      start: { attachedNodeId: target.id, point: { x: 0, y: 0 } },
      x: 0,
      y: 0,
    })
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [group.id, connector.id],
      nodes: [group, target, connector],
    })
    const repairs = planFigJamReferenceRepairs({
      nodes: document.snapshot.nodes,
      read: document.read,
      removingNodeIds: [group.id],
    })

    expect(repairs).toHaveLength(1)
    expect(document.execute({
      label: 'Delete group',
      changes: [...repairs, { type: 'remove', nodeId: group.id }],
    })).toEqual({ ok: true, changed: true })
    expect(document.read.node(target.id)).toBeNull()
    expect(document.read.node(connector.id)?.props).toMatchObject({
      start: { attachedNodeId: null },
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

  it('contains malformed geometry, media, references, and collection data', () => {
    expect(parseFigJamDrawingProps({
      position: 'absolute',
      variant: 'path',
      geometry: { kind: 'points', points: [{ x: 0, y: 0 }] },
      fill: null,
      opacity: 1,
      stroke: '#000',
      strokeWidth: 2,
    }).ok).toBe(false)
    expect(parseFigJamConnectorProps({
      ...createFigJamConnectorNode({
        nodeId: 'connector-invalid-source',
        start: { point: { x: 0, y: 0 } },
        end: { point: { x: 100, y: 100 } },
        x: 0,
        y: 0,
      }).props,
      start: { point: { x: 0, y: 0 }, anchor: 'center', attachedNodeId: '' },
    }).ok).toBe(false)
    expect(parseFigJamImageProps({
      ...createFigJamImageNode({ nodeId: 'image-source', x: 0, y: 0 }).props,
      src: 'https://example.com/image.png',
    }).ok).toBe(false)
    expect(parseFigJamTableProps({
      position: 'absolute',
      title: 'Broken',
      columns: ['A', 'B'],
      rows: [['only one']],
    }).ok).toBe(false)
    expect(parseFigJamLinkPreviewProps({
      position: 'absolute',
      title: 'Unsafe',
      description: '',
      orientation: 'horizontal',
      url: 'javascript:alert(1)',
    }).ok).toBe(false)
  })

  it('rejects duplicate collection ids while preserving repeated table labels', () => {
    expect(parseFigJamChecklistProps({
      position: 'absolute',
      title: 'Duplicate',
      items: [
        { id: 'same', text: 'One', checked: false },
        { id: 'same', text: 'Two', checked: true },
      ],
    }).ok).toBe(false)
    expect(parseFigJamKanbanProps({
      position: 'absolute',
      title: 'Duplicate',
      columns: [
        { id: 'same', title: 'One', cards: [] },
        { id: 'same', title: 'Two', cards: [] },
      ],
    }).ok).toBe(false)
    expect(parseFigJamKanbanProps({
      position: 'absolute',
      title: 'Duplicate cards',
      columns: [
        {
          id: 'column-one',
          title: 'One',
          cards: [{ id: 'same-card', text: 'One' }],
        },
        {
          id: 'column-two',
          title: 'Two',
          cards: [{ id: 'same-card', text: 'Two' }],
        },
      ],
    }).ok).toBe(false)

    const repeatedColumns = createFigJamTableNode({
      columns: ['Status', 'Status'],
      nodeId: 'repeated-table-columns',
      rows: [['Open', 'Closed']],
      x: 0,
      y: 0,
    })
    expect(renderProductNode(repeatedColumns).match(/<th>Status<\/th>/g))
      .toHaveLength(2)
  })
})

function renderProductNode(node: DesignNode) {
  return renderProductNodes([node])
}

function renderProductNodes(nodes: readonly DesignNode[]) {
  return renderProductTree(nodes, ...nodes.map(({ id }) => id))
}

function renderProductTree(
  nodes: readonly DesignNode[],
  ...roots: readonly string[]
) {
  const document = createDesignDocument({
    schemaVersion: 1,
    roots,
    nodes,
  })

  return renderToStaticMarkup(
    <ReactDesignRenderer
      projection={createDomProjection({
        getStageElement: () => null,
        getViewport: () => ({ scale: 1, x: 0, y: 0 }),
      })}
      read={document.read}
      registry={createReactDesignDefinitionRegistry({
        definitions: FIGJAM_PRODUCT_PACK.definitions,
        intrinsics: [],
      })}
    />,
  )
}

function readRenderedNodeTag(markup: string, nodeId: string) {
  const escapedNodeId = nodeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const tag = markup.match(new RegExp(
    `<[^>]+data-design-node-id="${escapedNodeId}"[^>]*>`,
  ))?.[0]

  if (!tag) {
    throw new Error(`Rendered node tag not found: ${nodeId}`)
  }

  return tag
}
