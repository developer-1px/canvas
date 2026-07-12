import { describe, expect, it, vi } from 'vitest'

import {
  createDesignDocument,
  getDesignDocumentPatchPort,
  type DesignDocumentSnapshot,
} from '../design-document'
import { createDomProjection } from '../dom-projection'
import {
  createEditorEngine,
  getEditorEngineDocumentHost,
} from './index'

describe('EditorEngineDocumentHost', () => {
  it('defers a ready patch while an editor preview owns uncommitted input', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const host = getEditorEngineDocumentHost(engine)
    const leafElement = {} as HTMLElement
    const unregister = projection.register('leaf', leafElement)
    const session = engine.commands.beginPreview({
      label: 'Edit leaf text',
      nodeId: 'leaf',
    })
    const apply = vi.fn(() => {
      expect(port.commit([
        { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
      ], {
        mergeKey: 'remote-text',
        origin: 'causal-test',
      })).toEqual({ ok: true })
    })

    expect(session?.update([{ target: 'text', value: 'Composing' }]))
      .toEqual({ changed: true, ok: true })
    expect(host.runReady({ id: 'remote-text', apply })).toMatchObject({
      code: 'host_not_ready',
      ok: false,
    })
    expect(apply).not.toHaveBeenCalled()
    expect(engine.read.node('leaf')?.text).toBe('Composing')
    expect(document.read.node('leaf')?.text).toBe('Draft')

    expect(session?.cancel()).toEqual({ changed: true, ok: true })
    const revisionBeforeReady = engine.snapshot().revision
    expect(host.runReady({ id: 'remote-text', apply })).toEqual({ ok: true })
    expect(apply).toHaveBeenCalledTimes(1)
    expect(engine.snapshot().revision).toBe(revisionBeforeReady + 1)
    expect(engine.read.node('leaf')?.text).toBe('Remote')
    expect(projection.element('leaf')).toBe(leafElement)

    unregister()
    engine.dispose()
    projection.dispose()
  })

  it('classifies document publications with pre-commit monotonic sequences', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const host = getEditorEngineDocumentHost(engine)
    const ownership: unknown[] = []

    port.subscribe((operations, metadata) => {
      ownership.push(host.ownsPublication({ operations, metadata }))
    })

    expect(engine.commands.execute({
      edits: [{ target: 'text', value: 'Local' }],
      label: 'Local text',
      nodeId: 'leaf',
      type: 'node.edit',
    })).toEqual({ changed: true, ok: true })
    expect(engine.commands.execute({ type: 'history.undo' }))
      .toEqual({ changed: true, ok: true })
    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ])).toEqual({ ok: true })

    expect(ownership).toEqual([
      { sequence: 1 },
      { sequence: 2 },
      { sequence: 3 },
    ])

    engine.dispose()
    projection.dispose()
  })

  it('does not turn an entry-time preview into ready work while synchronizing', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const host = getEditorEngineDocumentHost(engine)
    const session = engine.commands.beginPreview({
      label: 'Edit leaf text',
      nodeId: 'leaf',
    })
    const apply = vi.fn()

    expect(session?.update([{ target: 'text', value: 'Pending input' }]))
      .toEqual({ changed: true, ok: true })
    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Earlier remote' },
    ])).toEqual({ ok: true })

    expect(host.runReady({ id: 'next-remote', apply })).toMatchObject({
      code: 'host_not_ready',
      ok: false,
    })
    expect(apply).not.toHaveBeenCalled()
    expect(engine.snapshot().preview).toBeNull()
    expect(session?.commit()).toMatchObject({
      code: 'stale-preview',
      ok: false,
    })

    engine.dispose()
    projection.dispose()
  })

  it('serializes ready work from the start of preflight synchronization', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const host = getEditorEngineDocumentHost(engine)
    const innerApply = vi.fn(() => {
      expect(port.commit([
        { op: 'replace', path: '/nodes/1/text', value: 'Inner' },
      ])).toEqual({ ok: true })
    })
    const outerApply = vi.fn(() => {
      expect(port.commit([
        { op: 'replace', path: '/nodes/1/text', value: 'Outer' },
      ])).toEqual({ ok: true })
    })
    let innerResult: ReturnType<typeof host.runReady> | null = null

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Earlier' },
    ])).toEqual({ ok: true })
    const unsubscribe = engine.subscribe(() => {
      if (innerResult !== null) {
        return
      }

      innerResult = host.runReady({ id: 'inner', apply: innerApply })
    })

    expect(host.runReady({ id: 'outer', apply: outerApply }))
      .toEqual({ ok: true })
    expect(innerResult).toMatchObject({
      code: 'host_not_ready',
      ok: false,
      reason: 'The editor is already publishing a document change',
    })
    expect(innerApply).not.toHaveBeenCalled()
    expect(outerApply).toHaveBeenCalledTimes(1)
    expect(document.read.node('leaf')?.text).toBe('Outer')

    unsubscribe()
    engine.dispose()
    projection.dispose()
  })

  it('does not apply ready work when preflight synchronization disposes the engine', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const host = getEditorEngineDocumentHost(engine)
    const apply = vi.fn()

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Earlier' },
    ])).toEqual({ ok: true })
    engine.subscribe(() => engine.dispose())

    expect(() => host.runReady({ id: 'remote', apply }))
      .toThrow('EditorEngine is disposed')
    expect(apply).not.toHaveBeenCalled()
    expect(document.read.node('leaf')?.text).toBe('Earlier')

    projection.dispose()
  })

  it('does not report ready success when publication disposes the engine', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const projection = createProjection()
    const engine = createEditorEngine({ document, projection })
    const host = getEditorEngineDocumentHost(engine)
    const apply = vi.fn(() => {
      expect(port.commit([
        { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
      ])).toEqual({ ok: true })
    })

    engine.subscribe(() => engine.dispose())

    expect(() => host.runReady({ id: 'remote', apply }))
      .toThrow('EditorEngine is disposed')
    expect(apply).toHaveBeenCalledTimes(1)
    expect(document.read.node('leaf')?.text).toBe('Remote')

    projection.dispose()
  })
})

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
      createNode('root', ['leaf']),
      { ...createNode('leaf'), text: 'Draft' },
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
