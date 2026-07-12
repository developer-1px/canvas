import { describe, expect, it } from 'vitest'

import {
  createDesignDocument,
  type DesignDocument,
  type DesignDocumentSnapshot,
} from '../design-document'
import {
  createDomProjection,
  type DomProjection,
} from '../dom-projection'
import {
  createEditorEngine,
  defineRegisteredDesignDefinition,
  type EditorEngineCommand,
} from './index'

describe('EditorEngine', () => {
  it('rejects invalid registered props across create, edit, and raw apply before history', () => {
    const card = defineRegisteredDesignDefinition({
      id: 'test.card',
      kind: 'widget',
      props: {
        defaults: { tone: 'info' as const },
        safeParse: (value) => (
          typeof value === 'object' &&
          value !== null &&
          'tone' in value &&
          (value.tone === 'info' || value.tone === 'warning')
            ? { ok: true as const, value: { tone: value.tone } }
            : { ok: false as const, reason: 'invalid card tone' }
        ),
      },
      create: ({ nodeId }) => ({
        ...createNode(nodeId),
        definition: { id: 'test.card', kind: 'widget' },
        props: { tone: 'info' },
      }),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
    })
    const registeredNode = {
      ...createNode('card'),
      definition: { id: 'test.card', kind: 'widget' as const },
      props: { tone: 'info' },
    }
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [registeredNode.id],
      nodes: [registeredNode],
    })
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({
      definitionResolver: {
        resolveRegistered: (reference) =>
          reference.kind === card.kind && reference.id === card.id ? card : null,
      },
      document,
      projection,
    })
    const before = document.snapshot
    const invalidNode = {
      ...registeredNode,
      id: 'invalid-card',
      props: { tone: 'danger' },
    }

    for (const command of [
      {
        type: 'node.create' as const,
        index: 1,
        label: 'Create invalid card',
        node: invalidNode,
        parentId: null,
      },
      {
        type: 'node.edit' as const,
        edits: [{ field: 'tone', target: 'props' as const, value: 'danger' }],
        label: 'Edit invalid card',
        nodeId: registeredNode.id,
      },
      {
        type: 'document.apply' as const,
        changes: [{
          type: 'update' as const,
          nodeId: registeredNode.id,
          values: { props: { tone: 'danger' } },
        }],
        label: 'Apply invalid card props',
      },
    ] satisfies readonly EditorEngineCommand[]) {
      expect(engine.commands.can(command)).toBe(false)
      expect(engine.commands.execute(command)).toMatchObject({
        code: 'invalid-command',
        ok: false,
        reason: expect.stringContaining('invalid card tone'),
      })
      expect(document.snapshot).toBe(before)
      expect(document.historyStatus()).toEqual({
        canRedo: false,
        canUndo: false,
      })
    }

    engine.dispose()
    projection.dispose()
  })

  it('enforces registered text and transform capabilities at every Engine mutation boundary', () => {
    const labelDefinition = defineRegisteredDesignDefinition({
      id: 'test.locked-label',
      kind: 'component',
      props: {
        defaults: {},
        safeParse: (value) =>
          value && typeof value === 'object' && !Array.isArray(value)
            ? { ok: true as const, value: {} }
            : { ok: false as const, reason: 'props must be an object' },
      },
      create: ({ nodeId, x, y }) => ({
        ...createNode(nodeId),
        definition: { id: 'test.locked-label', kind: 'component' },
        text: 'Single line',
        frame: {
          x,
          y,
          width: 120,
          height: 40,
          rotation: 0,
          widthMode: 'fixed' as const,
          heightMode: 'fixed' as const,
          overflow: 'visible' as const,
        },
      }),
      capabilities: {
        textEdit: { source: 'node-text', multiline: false },
        transform: { move: false, resize: false },
      },
    })
    const node = labelDefinition.create({ nodeId: 'label', x: 0, y: 0 })
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [node.id],
      nodes: [node],
    })
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({
      definitionResolver: {
        resolveRegistered: (reference) =>
          reference.kind === labelDefinition.kind &&
          reference.id === labelDefinition.id
            ? labelDefinition
            : null,
      },
      document,
      projection,
    })
    const before = document.snapshot
    const commands = [
      {
        type: 'node.edit' as const,
        edits: [{ field: 'x' as const, target: 'layout' as const, value: 20 }],
        label: 'Move locked label',
        nodeId: node.id,
      },
      {
        type: 'document.apply' as const,
        changes: [{
          type: 'move' as const,
          index: 0,
          nodeId: node.id,
          parentId: null,
        }],
        label: 'Raw hierarchy move locked label',
      },
      {
        type: 'document.apply' as const,
        changes: [{
          type: 'update' as const,
          nodeId: node.id,
          values: {
            definition: { id: 'div', kind: 'intrinsic' as const },
            frame: { ...node.frame!, x: 40 },
          },
        }],
        label: 'Swap definition while moving locked label',
      },
      {
        type: 'document.apply' as const,
        changes: [
          {
            type: 'update' as const,
            nodeId: node.id,
            values: {
              definition: { id: 'div', kind: 'intrinsic' as const },
            },
          },
          {
            type: 'update' as const,
            nodeId: node.id,
            values: { frame: { ...node.frame!, x: 40 } },
          },
        ],
        label: 'Split definition swap and move locked label',
      },
      {
        type: 'frame.edit' as const,
        label: 'Resize locked label',
        nodeId: node.id,
        values: { width: 240 },
      },
      {
        type: 'document.apply' as const,
        changes: [{
          type: 'update' as const,
          nodeId: node.id,
          values: { frame: { ...node.frame!, width: 240 } },
        }],
        label: 'Raw resize locked label',
      },
      {
        type: 'node.edit' as const,
        edits: [{ target: 'text' as const, value: 'First\nSecond' }],
        label: 'Add multiline label',
        nodeId: node.id,
      },
    ] satisfies readonly EditorEngineCommand[]

    for (const command of commands) {
      expect(engine.commands.can(command)).toBe(false)
      expect(engine.commands.execute(command)).toMatchObject({
        code: 'invalid-command',
        ok: false,
      })
      expect(document.snapshot).toBe(before)
      expect(document.historyStatus()).toEqual({
        canRedo: false,
        canUndo: false,
      })
    }

    engine.dispose()
    projection.dispose()
  })

  it('creates one node without changing selection and restores it through history', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const note = {
      ...createNode('note'),
      text: 'Review note',
    }
    const command = {
      type: 'node.create' as const,
      label: 'Create note',
      node: note,
      parentId: 'root',
      index: 1,
    } satisfies EditorEngineCommand

    engine.commands.execute({
      type: 'selection.replace',
      nodeId: 'leaf',
    })

    expect(engine.commands.can(command)).toBe(true)
    expect(engine.commands.execute(command)).toEqual({
      ok: true,
      changed: true,
    })
    expect(engine.read.children('root').map((node) => node.id))
      .toEqual(['child', 'note'])
    expect(engine.snapshot().selection.primaryNodeId).toBe('leaf')

    expect(engine.commands.execute({ type: 'history.undo' }))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('note')).toBeNull()
    expect(engine.snapshot().selection.primaryNodeId).toBe('leaf')

    expect(engine.commands.execute({ type: 'history.redo' }))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('note')).toEqual(note)
    expect(engine.commands.can({ type: 'history.redo' })).toBe(false)

    engine.dispose()
    projection.dispose()
  })

  it('rejects duplicate and invalid node creation without adding history', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const before = document.snapshot

    expect(engine.commands.can({
      type: 'node.create',
      label: 'Duplicate leaf',
      node: createNode('leaf'),
      parentId: 'root',
      index: 1,
    })).toBe(false)
    expect(engine.commands.execute({
      type: 'node.create',
      label: 'Duplicate leaf',
      node: createNode('leaf'),
      parentId: 'root',
      index: 1,
    })).toMatchObject({ code: 'invalid-command', ok: false })

    const invalidPlacement = {
      type: 'node.create',
      label: 'Invalid placement',
      node: createNode('note'),
      parentId: 'root',
      index: 99,
    } satisfies EditorEngineCommand

    expect(engine.commands.can(invalidPlacement)).toBe(false)
    expect(engine.commands.execute(invalidPlacement))
      .toMatchObject({ code: 'invalid-command', ok: false })
    expect(document.snapshot).toBe(before)
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: false,
    })

    engine.dispose()
    projection.dispose()
  })

  it('resolves nested, exact, replacement, and parent selection through one command seam', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const root = createElement()
    const child = createElement(root)
    const leaf = createElement(child)

    projection.register('root', root)
    projection.register('child', child)
    projection.register('leaf', leaf)

    const engine = createEditorEngine({ document, projection })

    expect(engine.snapshot().selection).toEqual({
      nodeIds: [],
      primaryNodeId: null,
    })
    expect(engine.commands.execute({
      type: 'selection.hit',
      target: leaf,
    })).toEqual({ ok: true, changed: true })
    expect(engine.snapshot().selection.primaryNodeId).toBe('root')

    engine.commands.execute({ type: 'selection.hit', target: leaf })
    expect(engine.snapshot().selection.primaryNodeId).toBe('child')

    engine.commands.execute({
      type: 'selection.hit',
      target: leaf,
      exactTarget: true,
    })
    expect(engine.snapshot().selection.primaryNodeId).toBe('leaf')

    engine.commands.execute({ type: 'selection.parent' })
    expect(engine.snapshot().selection.primaryNodeId).toBe('child')

    engine.commands.execute({
      type: 'selection.replace',
      nodeId: 'leaf',
    })
    expect(engine.snapshot().selection).toEqual({
      nodeIds: ['leaf'],
      primaryNodeId: 'leaf',
    })

    engine.dispose()
    projection.dispose()
  })

  it('sets an ordered multi-selection and rejects unknown nodes', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    expect(engine.commands.execute({
      type: 'selection.set',
      nodeIds: ['child', 'leaf', 'child'],
    })).toEqual({ ok: true, changed: true })
    expect(engine.snapshot().selection).toEqual({
      nodeIds: ['child', 'leaf'],
      primaryNodeId: 'leaf',
    })
    expect(engine.commands.can({
      type: 'selection.set',
      nodeIds: ['missing'],
    })).toBe(false)
    expect(engine.commands.execute({
      type: 'selection.set',
      nodeIds: ['missing'],
    })).toMatchObject({
      code: 'unavailable',
      ok: false,
      reason: 'Unknown design node: missing',
    })
    expect(engine.snapshot().selection.nodeIds).toEqual(['child', 'leaf'])

    engine.dispose()
    projection.dispose()
  })

  it('applies an atomic structural transaction through editor history', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const group = createNode('group')
    const command = {
      type: 'document.apply' as const,
      label: 'Group leaf',
      changes: [
        {
          type: 'add' as const,
          index: 1,
          node: group,
          parentId: 'child',
        },
        {
          type: 'move' as const,
          index: 0,
          nodeId: 'leaf',
          parentId: 'group',
        },
      ],
    } satisfies EditorEngineCommand

    expect(engine.commands.can(command)).toBe(true)
    expect(engine.commands.execute(command))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.children('child').map(({ id }) => id))
      .toEqual(['group'])
    expect(engine.read.children('group').map(({ id }) => id))
      .toEqual(['leaf'])

    expect(engine.commands.execute({ type: 'history.undo' }))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('group')).toBeNull()
    expect(engine.read.children('child').map(({ id }) => id))
      .toEqual(['leaf'])

    expect(engine.commands.execute({ type: 'history.redo' }))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.children('group').map(({ id }) => id))
      .toEqual(['leaf'])

    engine.dispose()
    projection.dispose()
  })

  it('merges component-peer edits independently into one atomic document command', () => {
    const document = createDesignDocument(createComponentEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const command = {
      type: 'node.edit' as const,
      nodeId: 'card-a',
      label: 'Edit cards',
      edits: [
        { target: 'layout' as const, field: 'padding', value: 24 },
        { target: 'style' as const, field: 'opacity', value: 80 },
      ],
    } satisfies EditorEngineCommand

    expect(engine.commands.can(command)).toBe(true)
    expect(engine.commands.execute(command))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('card-a')).toMatchObject({
      layout: {
        padding: 24,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24,
        x: 10,
      },
      props: { className: 'card-a' },
      style: { color: 'red', opacity: 80 },
    })
    expect(engine.read.node('card-b')).toMatchObject({
      layout: {
        padding: 24,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 24,
        x: 20,
      },
      props: { className: 'card-b' },
      style: { color: 'blue', opacity: 80 },
    })
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: true,
    })

    expect(document.undo()).toBe(true)
    expect(document.read.node('card-a')?.layout.padding).toBe(8)
    expect(document.read.node('card-b')?.layout.padding).toBe(12)
    expect(document.undo()).toBe(false)

    engine.dispose()
    projection.dispose()
  })

  it('previews effective node edits without changing document history and cancels safely', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const session = engine.commands.beginPreview({
      label: 'Move leaf',
      nodeId: 'leaf',
    })

    expect(session).not.toBeNull()
    expect(engine.snapshot().preview).toEqual({ nodeId: 'leaf' })
    expect(session?.update([
      { target: 'layout', field: 'x', value: 24 },
    ])).toEqual({ ok: true, changed: true })
    expect(session?.update([
      { target: 'layout', field: 'y', value: 12 },
    ])).toEqual({ ok: true, changed: true })
    expect(engine.read.node('leaf')?.layout).toMatchObject({ x: 24, y: 12 })
    expect(Object.isFrozen(engine.read.node('leaf'))).toBe(true)
    expect(Object.isFrozen(engine.read.node('leaf')?.layout)).toBe(true)
    expect(document.read.node('leaf')?.layout).toMatchObject({ x: 0, y: 0 })
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: false,
    })

    expect(session?.cancel()).toEqual({ ok: true, changed: true })
    expect(engine.snapshot().preview).toBeNull()
    expect(engine.read.node('leaf')?.layout).toMatchObject({ x: 0, y: 0 })
    expect(document.historyStatus().canUndo).toBe(false)
    expect(session?.cancel()).toMatchObject({
      code: 'stale-preview',
      ok: false,
    })

    engine.dispose()
    projection.dispose()
  })

  it('merges props fields in preview and commits them as one command', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const session = engine.commands.beginPreview({
      label: 'Edit leaf props',
      nodeId: 'leaf',
    })

    expect(session?.update([
      { target: 'props', field: 'variant', value: 'warning' },
    ])).toEqual({ ok: true, changed: true })
    expect(session?.update([
      { target: 'props', field: 'compact', value: true },
    ])).toEqual({ ok: true, changed: true })
    expect(session?.update([
      { target: 'props', field: 'variant', value: 'danger' },
    ])).toEqual({ ok: true, changed: true })

    expect(engine.read.node('leaf')?.props).toEqual({
      position: 'absolute',
      compact: true,
      variant: 'danger',
    })
    expect(document.read.node('leaf')?.props)
      .toEqual({ position: 'absolute' })
    expect(document.historyStatus().canUndo).toBe(false)

    expect(session?.commit()).toEqual({ ok: true, changed: true })
    expect(document.read.node('leaf')?.props).toEqual({
      position: 'absolute',
      compact: true,
      variant: 'danger',
    })
    expect(engine.commands.execute({ type: 'history.undo' }))
      .toEqual({ ok: true, changed: true })
    expect(document.read.node('leaf')?.props)
      .toEqual({ position: 'absolute' })
    expect(engine.commands.can({ type: 'history.undo' })).toBe(false)

    engine.dispose()
    projection.dispose()
  })

  it('commits many preview updates as one undoable document command', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const session = engine.commands.beginPreview({
      label: 'Move leaf',
      nodeId: 'leaf',
    })

    session?.update([{ target: 'layout', field: 'x', value: 8 }])
    session?.update([{ target: 'layout', field: 'x', value: 16 }])
    session?.update([{ target: 'layout', field: 'y', value: 20 }])

    expect(session?.commit()).toEqual({ ok: true, changed: true })
    expect(engine.snapshot().preview).toBeNull()
    expect(document.read.node('leaf')?.layout).toMatchObject({
      x: 16,
      y: 20,
    })
    expect(engine.commands.can({ type: 'history.undo' })).toBe(true)

    expect(engine.commands.execute({ type: 'history.undo' }))
      .toEqual({ ok: true, changed: true })
    expect(document.read.node('leaf')?.layout).toMatchObject({ x: 0, y: 0 })
    expect(engine.commands.can({ type: 'history.undo' })).toBe(false)
    expect(engine.commands.can({ type: 'history.redo' })).toBe(true)

    expect(engine.commands.execute({ type: 'history.redo' }))
      .toEqual({ ok: true, changed: true })
    expect(document.read.node('leaf')?.layout).toMatchObject({
      x: 16,
      y: 20,
    })
    expect(session?.commit()).toMatchObject({
      code: 'stale-preview',
      ok: false,
    })

    engine.dispose()
    projection.dispose()
  })

  it('ends a no-move preview without creating history', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const session = engine.commands.beginPreview({
      label: 'Move leaf',
      nodeId: 'leaf',
    })

    session?.update([{ target: 'layout', field: 'x', value: 0 }])
    expect(session?.commit()).toEqual({ ok: true, changed: false })
    expect(engine.snapshot().preview).toBeNull()
    expect(document.historyStatus().canUndo).toBe(false)

    engine.dispose()
    projection.dispose()
  })

  it('subscribes lazily, reconciles removed selections, and isolates listeners', () => {
    const sourceDocument = createDesignDocument(createEditorSnapshot())
    const sourceProjection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    let documentSubscriptions = 0
    let documentUnsubscriptions = 0
    let projectionSubscriptions = 0
    let projectionUnsubscriptions = 0
    const document = countDocumentSubscriptions(sourceDocument, {
      onSubscribe: () => {
        documentSubscriptions += 1
      },
      onUnsubscribe: () => {
        documentUnsubscriptions += 1
      },
    })
    const projection = countProjectionSubscriptions(sourceProjection, {
      onSubscribe: () => {
        projectionSubscriptions += 1
      },
      onUnsubscribe: () => {
        projectionUnsubscriptions += 1
      },
    })
    const engine = createEditorEngine({ document, projection })

    expect(documentSubscriptions).toBe(0)
    expect(projectionSubscriptions).toBe(0)

    engine.commands.execute({
      type: 'selection.replace',
      nodeId: 'leaf',
    })
    const unsubscribeThrowing = engine.subscribe(() => {
      throw new Error('listener failed')
    })
    let healthyNotifications = 0
    const unsubscribeHealthy = engine.subscribe(() => {
      healthyNotifications += 1
    })

    expect(documentSubscriptions).toBe(1)
    expect(projectionSubscriptions).toBe(1)
    expect(() => sourceDocument.execute({
      label: 'Remove selected leaf',
      changes: [{ type: 'remove', nodeId: 'leaf' }],
    })).not.toThrow()
    expect(engine.snapshot().selection.primaryNodeId).toBeNull()
    expect(healthyNotifications).toBe(1)

    unsubscribeThrowing()
    unsubscribeHealthy()
    const unsubscribeReplay = engine.subscribe(() => undefined)

    expect(documentSubscriptions).toBe(1)
    expect(projectionSubscriptions).toBe(1)

    unsubscribeReplay()
    engine.dispose()

    expect(documentUnsubscriptions).toBe(1)
    expect(projectionUnsubscriptions).toBe(1)

    sourceProjection.dispose()
  })

  it('invalidates an active preview when the document changes externally', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const unsubscribe = engine.subscribe(() => undefined)
    const session = engine.commands.beginPreview({
      label: 'Move leaf',
      nodeId: 'leaf',
    })

    session?.update([{ target: 'layout', field: 'x', value: 32 }])
    document.execute({
      label: 'External style edit',
      changes: [{
        type: 'update',
        nodeId: 'leaf',
        values: { style: { color: 'blue' } },
      }],
    })

    expect(engine.snapshot().preview).toBeNull()
    expect(engine.read.node('leaf')?.layout.x).toBe(0)
    expect(engine.read.node('leaf')?.style.color).toBe('blue')
    expect(session?.commit()).toMatchObject({
      code: 'stale-preview',
      ok: false,
    })

    unsubscribe()
    engine.dispose()
    projection.dispose()
  })

  it('makes commands and active preview sessions inert after idempotent disposal', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const session = engine.commands.beginPreview({
      label: 'Move leaf',
      nodeId: 'leaf',
    })

    session?.update([{ target: 'layout', field: 'x', value: 48 }])
    engine.dispose()
    engine.dispose()

    expect(engine.snapshot().preview).toBeNull()
    expect(engine.commands.can({
      type: 'selection.replace',
      nodeId: 'root',
    })).toBe(false)
    expect(engine.commands.execute({
      type: 'selection.replace',
      nodeId: 'root',
    })).toMatchObject({ code: 'disposed', ok: false })
    expect(session?.update([
      { target: 'layout', field: 'x', value: 64 },
    ])).toMatchObject({ code: 'disposed', ok: false })
    expect(session?.commit()).toMatchObject({ code: 'disposed', ok: false })
    expect(session?.cancel()).toMatchObject({ code: 'disposed', ok: false })
    expect(document.read.node('leaf')?.layout.x).toBe(0)
    expect(document.historyStatus().canUndo).toBe(false)

    projection.dispose()
  })

  it('edits text through the same document command and history path', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const command = {
      type: 'node.edit' as const,
      nodeId: 'leaf',
      label: 'Edit leaf text',
      edits: [{ target: 'text' as const, value: 'Edited leaf' }],
    }

    expect(engine.commands.can(command)).toBe(true)
    expect(engine.commands.execute(command))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('leaf')?.text).toBe('Edited leaf')

    engine.commands.execute({ type: 'history.undo' })
    expect(engine.read.node('leaf')?.text).toBe('Leaf')
    engine.commands.execute({ type: 'history.redo' })
    expect(engine.read.node('leaf')?.text).toBe('Edited leaf')

    engine.dispose()
    projection.dispose()
  })

  it('merges one props field and restores it through document history', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const command = {
      type: 'node.edit' as const,
      nodeId: 'leaf',
      label: 'Label leaf',
      edits: [{
        target: 'props' as const,
        field: 'aria-label',
        value: 'Revenue note',
      }],
    } satisfies EditorEngineCommand

    expect(engine.commands.can(command)).toBe(true)
    expect(engine.commands.execute(command))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('leaf')?.props).toEqual({
      position: 'absolute',
      'aria-label': 'Revenue note',
    })

    expect(engine.commands.execute({ type: 'history.undo' }))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('leaf')?.props).toEqual({ position: 'absolute' })

    expect(engine.commands.execute({ type: 'history.redo' }))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('leaf')?.props['aria-label'])
      .toBe('Revenue note')

    engine.dispose()
    projection.dispose()
  })

  it('rejects a non-JSON props edit without adding document history', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const before = document.snapshot
    const command = {
      type: 'node.edit',
      nodeId: 'leaf',
      label: 'Install invalid handler',
      edits: [{
        target: 'props',
        field: 'onClick',
        value: () => undefined,
      }],
    } as unknown as EditorEngineCommand

    expect(engine.commands.can(command)).toBe(false)
    expect(engine.commands.execute(command)).toMatchObject({
      code: 'unavailable',
      ok: false,
      reason: 'Invalid JSON props value: onClick',
    })
    expect(document.snapshot).toBe(before)
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: false,
    })

    engine.dispose()
    projection.dispose()
  })

  it.each([
    ['undefined', undefined],
    ['function', () => undefined],
    ['BigInt', BigInt(1)],
    ['cycle', createCyclicValue()],
    ['sparse array', Array(1)],
  ])('rejects %s props during preview without throwing', (_label, value) => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const session = engine.commands.beginPreview({
      label: 'Preview invalid props',
      nodeId: 'leaf',
    })

    expect(session?.update([{
      target: 'props',
      field: 'invalid',
      value,
    } as never])).toMatchObject({
      code: 'unavailable',
      ok: false,
      reason: 'Invalid JSON props value: invalid',
    })
    expect(engine.read.node('leaf')?.props)
      .toEqual({ position: 'absolute' })
    expect(document.historyStatus().canUndo).toBe(false)
    expect(engine.snapshot().preview).toEqual({ nodeId: 'leaf' })
    expect(session?.cancel()).toEqual({ ok: true, changed: true })

    engine.dispose()
    projection.dispose()
  })

  it('keeps component instance content local while synchronizing layout and style', () => {
    const document = createDesignDocument(createComponentEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    expect(engine.commands.execute({
      type: 'node.edit',
      nodeId: 'card-a',
      label: 'Edit card copy',
      edits: [{ target: 'text', value: 'Edited A' }],
    })).toEqual({ ok: true, changed: true })
    expect(engine.read.node('card-a')?.text).toBe('Edited A')
    expect(engine.read.node('card-b')?.text).toBe('Card B')

    engine.dispose()
    projection.dispose()
  })

  it('keeps component instance props edits node-local', () => {
    const document = createDesignDocument(createComponentEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    expect(engine.commands.execute({
      type: 'node.edit',
      nodeId: 'card-a',
      label: 'Edit card A variant',
      edits: [{ target: 'props', field: 'variant', value: 'warning' }],
    })).toEqual({ ok: true, changed: true })
    expect(engine.read.node('card-a')?.props).toEqual({
      className: 'card-a',
      variant: 'warning',
    })
    expect(engine.read.node('card-b')?.props).toEqual({
      className: 'card-b',
    })

    engine.dispose()
    projection.dispose()
  })

  it('reports unavailable node edits without mutating the document', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const command = {
      type: 'node.edit' as const,
      nodeId: 'child',
      label: 'Invalid text edit',
      edits: [{ target: 'text' as const, value: 'Not editable' }],
    }

    expect(engine.commands.can(command)).toBe(false)
    expect(engine.commands.execute(command)).toMatchObject({
      code: 'unavailable',
      ok: false,
    })
    expect(document.historyStatus().canUndo).toBe(false)

    engine.dispose()
    projection.dispose()
  })

  it('normalizes supported numeric values and rejects invalid layout choices', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    expect(engine.commands.execute({
      type: 'node.edit',
      nodeId: 'leaf',
      label: 'Normalize leaf',
      edits: [
        { target: 'layout', field: 'padding', value: -999 },
        { target: 'style', field: 'opacity', value: 1_000 },
        { target: 'layout', field: 'x', value: 484.25 },
      ],
    })).toEqual({ ok: true, changed: true })
    expect(engine.read.node('leaf')).toMatchObject({
      layout: {
        padding: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        x: 484.25,
      },
      style: { opacity: 100 },
    })

    expect(engine.commands.execute({
      type: 'node.edit',
      nodeId: 'leaf',
      label: 'Reject leaf direction',
      edits: [{
        target: 'layout',
        field: 'direction',
        value: 'diagonal',
      }],
    })).toMatchObject({ code: 'unavailable', ok: false })
    expect(engine.read.node('leaf')?.layout.direction).toBeUndefined()

    const invalidRuntimeCommand = {
      type: 'node.edit',
      nodeId: 'leaf',
      label: 'Reject storage target',
      edits: [{ target: 'storage', field: 'opacity', value: 50 }],
    } as unknown as EditorEngineCommand

    expect(engine.commands.execute(invalidRuntimeCommand)).toMatchObject({
      code: 'unavailable',
      ok: false,
    })
    expect(engine.read.node('leaf')?.style.opacity).toBe(100)

    engine.dispose()
    projection.dispose()
  })

  it('routes geometry and sizing edits through document frame fields', () => {
    const snapshot = createEditorSnapshot()
    const document = createDesignDocument({
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node.id === 'root'
        ? {
            ...node,
            frame: {
              x: 10,
              y: 20,
              width: 320,
              height: 240,
              rotation: 0,
              widthMode: 'fixed' as const,
              heightMode: 'fixed' as const,
              overflow: 'visible' as const,
            },
          }
        : node),
    })
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    expect(engine.commands.execute({
      type: 'node.edit',
      nodeId: 'root',
      label: 'Edit root frame',
      edits: [
        { target: 'layout', field: 'x', value: 44 },
        { target: 'layout', field: 'w', value: 480 },
        { target: 'layout', field: 'widthMode', value: 'hug' },
        { target: 'style', field: 'rotation', value: 12 },
      ],
    })).toEqual({ ok: true, changed: true })
    expect(engine.read.node('root')?.frame).toMatchObject({
      x: 44,
      width: 480,
      widthMode: 'content',
      rotation: 12,
    })
    expect(engine.read.node('root')?.layout.x).toBe(0)

    engine.dispose()
    projection.dispose()
  })

  it('edits authored frame settings atomically through document history', () => {
    const snapshot = createEditorSnapshot()
    const document = createDesignDocument({
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node.id === 'root'
        ? {
            ...node,
            frame: {
              x: 10,
              y: 20,
              width: 1280,
              height: 800,
              rotation: 0,
              widthMode: 'fixed' as const,
              heightMode: 'content' as const,
              overflow: 'scroll' as const,
            },
          }
        : node),
    })
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const command = {
      type: 'frame.edit' as const,
      nodeId: 'root',
      label: 'Apply mobile frame',
      values: {
        width: 390,
        height: 844,
        heightMode: 'fixed' as const,
        overflow: 'clip' as const,
      },
    } satisfies EditorEngineCommand

    expect(engine.commands.can(command)).toBe(true)
    expect(engine.commands.execute(command)).toEqual({
      ok: true,
      changed: true,
    })
    expect(engine.read.node('root')?.frame).toEqual({
      x: 10,
      y: 20,
      width: 390,
      height: 844,
      rotation: 0,
      widthMode: 'fixed',
      heightMode: 'fixed',
      overflow: 'clip',
    })
    expect(engine.snapshot().history.canUndo).toBe(true)

    expect(engine.commands.execute({ type: 'history.undo' }))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('root')?.frame).toMatchObject({
      width: 1280,
      height: 800,
      heightMode: 'content',
      overflow: 'scroll',
    })
    expect(engine.commands.execute({ type: 'history.redo' }))
      .toEqual({ ok: true, changed: true })
    expect(engine.read.node('root')?.frame).toMatchObject({
      width: 390,
      height: 844,
      heightMode: 'fixed',
      overflow: 'clip',
    })

    engine.dispose()
    projection.dispose()
  })

  it('rejects invalid frame edits without creating history', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    expect(engine.commands.execute({
      type: 'frame.edit',
      nodeId: 'root',
      label: 'Edit missing frame',
      values: { overflow: 'clip' },
    })).toMatchObject({ code: 'unavailable', ok: false })

    const invalidCommand = {
      type: 'frame.edit',
      nodeId: 'root',
      label: 'Edit invalid frame',
      values: { overflow: 'auto' },
    } as unknown as EditorEngineCommand

    expect(engine.commands.can(invalidCommand)).toBe(false)
    expect(engine.commands.execute(invalidCommand)).toMatchObject({
      code: 'unavailable',
      ok: false,
    })
    expect(document.historyStatus().canUndo).toBe(false)

    engine.dispose()
    projection.dispose()
  })

  it('rejects position edits for nodes without authored or frame geometry', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    const command = {
      type: 'node.edit',
      nodeId: 'child',
      label: 'Nudge static child',
      edits: [{ target: 'layout', field: 'x', value: 12 }],
    } satisfies EditorEngineCommand

    expect(engine.commands.can(command)).toBe(false)
    expect(engine.commands.execute(command)).toMatchObject({
      code: 'unavailable',
      ok: false,
    })
    expect(document.historyStatus().canUndo).toBe(false)

    engine.dispose()
    projection.dispose()
  })

  it('materializes missing padding sides before editing one side', () => {
    const snapshot = createEditorSnapshot()
    const document = createDesignDocument({
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node.id === 'leaf'
        ? { ...node, layout: { ...node.layout, padding: 8 } }
        : node),
    })
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    expect(engine.commands.execute({
      type: 'node.edit',
      nodeId: 'leaf',
      label: 'Edit left padding',
      edits: [{ target: 'layout', field: 'paddingLeft', value: 16 }],
    })).toEqual({ ok: true, changed: true })
    expect(engine.read.node('leaf')?.layout).toMatchObject({
      padding: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 8,
      paddingTop: 8,
    })

    engine.dispose()
    projection.dispose()
  })

  it('reconciles selection before commands even without a subscribed view', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })

    engine.commands.execute({
      type: 'selection.replace',
      nodeId: 'leaf',
    })
    document.execute({
      label: 'Remove leaf externally',
      changes: [{ type: 'remove', nodeId: 'leaf' }],
    })

    expect(() => engine.commands.execute({ type: 'selection.parent' }))
      .not.toThrow()
    expect(engine.snapshot().selection.primaryNodeId).toBeNull()

    engine.dispose()
    projection.dispose()
  })

  it('invalidates an unsubscribed preview before the next document read', () => {
    const document = createDesignDocument(createEditorSnapshot())
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const engine = createEditorEngine({ document, projection })
    const session = engine.commands.beginPreview({
      label: 'Preview leaf',
      nodeId: 'leaf',
    })

    session?.update([{ target: 'layout', field: 'x', value: 40 }])
    document.execute({
      label: 'External leaf update',
      changes: [{
        type: 'update',
        nodeId: 'leaf',
        values: { style: { color: 'green' } },
      }],
    })

    expect(engine.read.node('leaf')).toMatchObject({
      layout: { x: 0 },
      style: { color: 'green' },
    })
    expect(engine.snapshot().preview).toBeNull()
    expect(session?.commit()).toMatchObject({
      code: 'stale-preview',
      ok: false,
    })

    engine.dispose()
    projection.dispose()
  })
})

function createEditorSnapshot(): DesignDocumentSnapshot {
  return {
    schemaVersion: 1,
    roots: ['root'],
    nodes: [
      createNode('root', ['child']),
      createNode('child', ['leaf']),
      {
        ...createNode('leaf'),
        props: { position: 'absolute' },
        text: 'Leaf',
      },
    ],
  }
}

function createComponentEditorSnapshot(): DesignDocumentSnapshot {
  return {
    schemaVersion: 1,
    roots: ['root'],
    nodes: [
      createNode('root', ['card-a', 'card-b']),
      {
        ...createNode('card-a'),
        text: 'Card A',
        definition: { kind: 'component', id: 'card' },
        props: { className: 'card-a' },
        layout: { ...createNode('card-a').layout, padding: 8, x: 10 },
        style: { color: 'red', opacity: 100 },
        component: {
          definitionId: 'card',
          instanceId: 'a',
          slotId: 'root',
        },
      },
      {
        ...createNode('card-b'),
        text: 'Card B',
        definition: { kind: 'component', id: 'card' },
        props: { className: 'card-b' },
        layout: { ...createNode('card-b').layout, padding: 12, x: 20 },
        style: { color: 'blue', opacity: 90 },
        component: {
          definitionId: 'card',
          instanceId: 'b',
          slotId: 'root',
        },
      },
    ],
  }
}

function createNode(id: string, children: readonly string[] = []) {
  return {
    id,
    label: id,
    definition: { kind: 'intrinsic' as const, id: 'div' },
    children,
    props: {},
    text: null,
    layout: {
      h: 40,
      heightMode: 'fixed',
      w: 80,
      widthMode: 'fixed',
      x: 0,
      y: 0,
    },
    style: {},
    frame: null,
    component: null,
  }
}

function createElement(parentElement: HTMLElement | null = null) {
  return { parentElement } as HTMLElement
}

function createCyclicValue() {
  const value: Record<string, unknown> = {}

  value.self = value
  return value
}

function countDocumentSubscriptions(
  document: DesignDocument,
  callbacks: { onSubscribe(): void; onUnsubscribe(): void },
): DesignDocument {
  return {
    get snapshot() {
      return document.snapshot
    },
    read: document.read,
    execute: document.execute,
    historyStatus: document.historyStatus,
    redo: document.redo,
    serialize: document.serialize,
    subscribe(listener) {
      callbacks.onSubscribe()
      const unsubscribe = document.subscribe(listener)

      return () => {
        callbacks.onUnsubscribe()
        unsubscribe()
      }
    },
    undo: document.undo,
  }
}

function countProjectionSubscriptions(
  projection: DomProjection,
  callbacks: { onSubscribe(): void; onUnsubscribe(): void },
): DomProjection {
  return {
    ...projection,
    subscribe(listener) {
      callbacks.onSubscribe()
      const unsubscribe = projection.subscribe(listener)

      return () => {
        callbacks.onUnsubscribe()
        unsubscribe()
      }
    },
  }
}
