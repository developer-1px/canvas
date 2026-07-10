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
  type EditorEngineCommand,
} from './index'

describe('EditorEngine', () => {
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
      edits: [{ target: 'props', field: 'opacity', value: 50 }],
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
