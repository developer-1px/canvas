import { describe, expect, it } from 'vitest'

import {
  createCausalPatchInbox,
  type CausalPatchInbox,
  type CausalPatchIngestResult,
} from '@interactive-os/json-document-causal-patch-inbox'
import {
  createDesignDocument,
  getDesignDocumentPatchPort,
  type DesignDocumentSnapshot,
} from '../design-document'
import { createDomProjection } from '../dom-projection'
import {
  createEditorEngine,
  getEditorEngineDocumentHost,
  type EditorEngine,
} from './index'

const DESIGN_NODE_SCOPES = [{
  scope: 'design-node',
  query: '$.nodes[*]',
  readId(value: unknown) {
    if (!value || typeof value !== 'object' || !('id' in value)) {
      return undefined
    }

    return typeof value.id === 'string' ? value.id : undefined
  },
}]

describe('EditorEngine causal integration tracer', () => {
  it('defers a stable-id change until the active text preview commits', async () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const noteAElement = {} as HTMLElement
    const noteBElement = {} as HTMLElement
    const unregisterA = projection.register('note-a', noteAElement)
    const unregisterB = projection.register('note-b', noteBElement)
    const inbox = createCausalPatchInbox(port, {
      host: getEditorEngineDocumentHost(engine),
      stableIdScopes: DESIGN_NODE_SCOPES,
    })
    const publications: { mergeKey?: string; origin?: string }[] = []
    const retries: CausalPatchIngestResult[] = []
    const stopPublication = port.subscribe((_operations, metadata) => {
      publications.push({
        ...(metadata?.mergeKey === undefined
          ? {} : { mergeKey: metadata.mergeKey }),
        ...(metadata?.origin === undefined
          ? {} : { origin: metadata.origin }),
      })
    })
    const stopRetry = bindReadyCausalRetry(engine, inbox, (result) => {
      retries.push(result)
    })
    const session = engine.commands.beginPreview({
      label: 'Edit note A',
      nodeId: 'note-a',
    })

    expect(session?.update([{ target: 'text', value: 'Composing A' }]))
      .toEqual({ changed: true, ok: true })

    const deferred = inbox.ingest({
      id: 'remote-note-b',
      dependsOn: [],
      intent: {
        kind: 'stable-id-replace',
        target: { scope: 'design-node', id: 'note-b' },
        relativePath: '/text',
        expected: 'Draft B',
        value: 'Remote B',
      },
    })

    expect(deferred).toMatchObject({
      applied: [],
      code: 'host_not_ready',
      id: 'remote-note-b',
      ok: false,
    })
    expect(document.read.node('note-a')?.text).toBe('Draft A')
    expect(engine.read.node('note-a')?.text).toBe('Composing A')
    expect(document.read.node('note-b')?.text).toBe('Draft B')

    expect(session?.commit()).toEqual({ changed: true, ok: true })
    await flushMicrotasks()

    expect(retries).toHaveLength(1)
    expect(retries[0]).toMatchObject({
      applied: ['remote-note-b'],
      ok: true,
    })
    expect(document.read.node('note-a')?.text).toBe('Composing A')
    expect(document.read.node('note-b')?.text).toBe('Remote B')
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: false,
    })
    expect(engine.snapshot()).toMatchObject({
      history: { canRedo: false, canUndo: false },
      preview: null,
    })
    expect(projection.element('note-a')).toBe(noteAElement)
    expect(projection.element('note-b')).toBe(noteBElement)
    expect(inbox.current()).toMatchObject({
      frontier: ['remote-note-b'],
      journalRevision: 2,
      queued: [],
      status: 'active',
    })
    expect(publications).toHaveLength(2)
    expect(publications[0]?.origin).toBe('design-document')
    expect(publications[1]).toMatchObject({ mergeKey: 'remote-note-b' })
    expect(publications[1]?.origin).toMatch(/^causal-patch-inbox:/)

    stopRetry()
    stopPublication()
    inbox.dispose()
    unregisterA()
    unregisterB()
    engine.dispose()
    projection.dispose()
  })

  it('blocks a delayed replacement instead of overwriting a newer local field', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const inbox = createCausalPatchInbox(port, {
      host: getEditorEngineDocumentHost(engine),
      stableIdScopes: DESIGN_NODE_SCOPES,
    })
    const publications: string[] = []
    const stopPublication = port.subscribe((_operations, metadata) => {
      publications.push(metadata?.origin ?? 'unknown')
    })

    expect(engine.commands.execute({
      edits: [{ target: 'text', value: 'Local B' }],
      label: 'Edit note B locally',
      nodeId: 'note-b',
      type: 'node.edit',
    })).toEqual({ changed: true, ok: true })

    const result = inbox.ingest({
      id: 'remote-note-b',
      dependsOn: [],
      intent: {
        kind: 'stable-id-replace',
        target: { scope: 'design-node', id: 'note-b' },
        relativePath: '/text',
        expected: 'Draft B',
        value: 'Remote B',
      },
    })

    expect(result).toMatchObject({
      code: 'materialization_failed',
      id: 'remote-note-b',
      materialization: {
        code: 'target_changed',
        ok: false,
      },
      ok: false,
      policy: 'stable-id-replace',
    })
    expect(document.read.node('note-b')?.text).toBe('Local B')
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: true,
    })
    expect(publications).toEqual(['design-document'])
    expect(inbox.current()).toMatchObject({
      failure: {
        id: 'remote-note-b',
        policy: 'stable-id-replace',
      },
      status: 'blocked',
    })
    expect(document.undo()).toBe(true)
    expect(document.read.node('note-b')?.text).toBe('Draft B')

    stopPublication()
    inbox.dispose()
    engine.dispose()
    projection.dispose()
  })

  it('integrates a no-op envelope without splitting document and engine history', () => {
    const document = createDesignDocument(createSnapshot())
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const inbox = createCausalPatchInbox(
      getDesignDocumentPatchPort(document),
      { host: getEditorEngineDocumentHost(engine) },
    )
    expect(engine.commands.execute({
      edits: [{ target: 'text', value: 'Local B' }],
      label: 'Edit note B locally',
      nodeId: 'note-b',
      type: 'node.edit',
    })).toEqual({ changed: true, ok: true })
    const before = engine.snapshot()

    expect(inbox.ingest({
      id: 'only-test',
      dependsOn: [],
      operations: [
        { op: 'test', path: '/nodes/2/text', value: 'Local B' },
      ],
    })).toMatchObject({
      applied: ['only-test'],
      ok: true,
    })
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: true,
    })
    expect(engine.snapshot()).toMatchObject({
      history: { canRedo: false, canUndo: true },
      revision: before.revision,
    })
    expect(inbox.current()).toMatchObject({
      frontier: ['only-test'],
      journalRevision: 2,
      status: 'active',
    })
    expect(engine.commands.execute({ type: 'history.undo' }))
      .toEqual({ changed: true, ok: true })
    expect(document.read.node('note-b')?.text).toBe('Draft B')

    inbox.dispose()
    engine.dispose()
    projection.dispose()
  })
})

function bindReadyCausalRetry(
  engine: EditorEngine,
  inbox: CausalPatchInbox<DesignDocumentSnapshot>,
  onRetry: (result: CausalPatchIngestResult) => void,
) {
  let queued = false

  return engine.subscribe(() => {
    if (queued || engine.snapshot().preview !== null) {
      return
    }

    queued = true
    queueMicrotask(() => {
      queued = false

      if (
        engine.snapshot().preview === null &&
        inbox.current().queued.some((entry) => entry.missing.length === 0)
      ) {
        onRetry(inbox.ingest([]))
      }
    })
  })
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

function createProjection() {
  return createDomProjection({
    getStageElement: () => null,
    getViewport: () => ({ scale: 1, x: 0, y: 0 }),
  })
}

function createSnapshot(): DesignDocumentSnapshot {
  return {
    schemaVersion: 1,
    roots: ['root'],
    nodes: [
      createNode('root', ['note-a', 'note-b']),
      { ...createNode('note-a'), text: 'Draft A' },
      { ...createNode('note-b'), text: 'Draft B' },
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
    layout: {},
    style: {},
    frame: null,
    component: null,
  }
}
