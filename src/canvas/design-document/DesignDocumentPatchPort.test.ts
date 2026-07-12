import { describe, expect, it, vi } from 'vitest'

import {
  createDesignDocument,
  getDesignDocumentPatchPort,
  type DesignDocumentPatchPort,
  type DesignDocumentSnapshot,
} from './index'

describe('DesignDocumentPatchPort', () => {
  it('publishes a validated external patch outside local document history', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const listener = vi.fn(() => document.historyStatus())

    document.subscribe(listener)

    expect(port.commit([
      { op: 'test', path: '/nodes/1/id', value: 'leaf' },
      { op: 'replace', path: '/nodes/1/text', value: 'Reviewed' },
    ], {
      label: 'Remote text',
      mergeKey: 'remote-text',
      origin: 'causal-test',
    })).toEqual({ ok: true })

    expect(document.snapshot.nodes[1]?.text).toBe('Reviewed')
    expect(document.read.node('leaf')?.text).toBe('Reviewed')
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: false,
    })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.results[0]?.value).toEqual({
      canRedo: false,
      canUndo: false,
    })
  })

  it('rejects graph-invalid patches before publication', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const publication = vi.fn()

    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })
    const snapshot = document.snapshot
    port.subscribe(publication)

    const invalidPatch = [
      { op: 'replace' as const, path: '/roots/0' as const, value: 'missing' },
    ]

    expect(port.canPatch(invalidPatch)).toMatchObject({
      code: 'schema_violation',
      ok: false,
    })
    expect(port.commit(invalidPatch)).toMatchObject({
      code: 'schema_violation',
      ok: false,
    })
    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ], {
      selectionAfter: '/nodes/1/text',
    })).toMatchObject({
      code: 'schema_violation',
      ok: false,
      reason: 'DesignDocument authored content does not own text selection',
    })
    expect(document.snapshot).toBe(snapshot)
    expect(document.historyStatus().canUndo).toBe(true)
    expect(publication).not.toHaveBeenCalled()
    expect(document.undo()).toBe(true)
    expect(document.read.node('leaf')?.text).toBe('Draft')
  })

  it('rejects patches that would normalize differently in canonical state', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const publication = vi.fn()
    const patch = [
      { op: 'replace' as const, path: '/nodes/1/label', value: ' Remote ' },
    ]

    port.subscribe(publication)

    expect(port.canPatch(patch)).toEqual({
      code: 'schema_violation',
      ok: false,
      reason: 'DesignDocument patches must already contain canonical values',
    })
    expect(port.commit(patch)).toEqual({
      code: 'schema_violation',
      ok: false,
      reason: 'DesignDocument patches must already contain canonical values',
    })
    expect(document.read.node('leaf')?.label).toBe('leaf')
    expect(document.historyStatus().canUndo).toBe(false)
    expect(publication).not.toHaveBeenCalled()
  })

  it('preserves local history and emits no publication for a successful no-op patch', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const publication = vi.fn()

    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })
    port.subscribe(publication)

    expect(port.commit([
      { op: 'test', path: '/nodes/1/text', value: 'Local' },
      { op: 'replace', path: '/nodes/1/text', value: 'Local' },
    ])).toEqual({ ok: true })
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: true,
    })
    expect(document.read.node('leaf')?.text).toBe('Local')
    expect(publication).not.toHaveBeenCalled()
    expect(document.undo()).toBe(true)
    expect(document.read.node('leaf')?.text).toBe('Draft')
  })

  it('keeps ordinary document commands atomic and undoable', () => {
    const document = createDesignDocument(createSnapshot())
    const listener = vi.fn()

    document.subscribe(listener)

    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })

    expect(document.snapshot.nodes[1]?.text).toBe('Local')
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: true,
    })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('publishes one frozen canonical root replacement for an internal transaction', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const publication = vi.fn()

    port.subscribe(publication)

    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })

    const operations = publication.mock.calls[0]?.[0]
    expect(operations).toHaveLength(1)
    expect(operations[0]).toMatchObject({ op: 'replace', path: '' })
    expect(operations[0]?.value).toBe(document.snapshot)
    expect(Object.isFrozen(operations)).toBe(true)
    expect(Object.isFrozen(operations[0])).toBe(true)
    expect(publication.mock.calls[0]?.[1]).toEqual({
      label: 'Local text',
      origin: 'design-document',
    })
  })

  it('rejects a patch reentered from the synchronous publication turn', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    let nestedResult: ReturnType<DesignDocumentPatchPort['commit']> | null = null

    port.subscribe(() => {
      nestedResult = port.commit([
        { op: 'replace', path: '/nodes/1/text', value: 'Nested' },
      ])
    })

    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })
    expect(nestedResult).toMatchObject({
      code: 'schema_violation',
      ok: false,
      reason: 'DesignDocument publications cannot be nested',
    })
    expect(document.read.node('leaf')?.text).toBe('Local')
  })

  it('rejects a document command reentered while synchronizing a patch', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    let nestedResult: ReturnType<typeof document.execute> | null = null

    document.subscribe(() => {
      if (nestedResult !== null) {
        return
      }

      nestedResult = document.execute({
        changes: [{
          nodeId: 'leaf',
          type: 'update',
          values: { text: 'Nested' },
        }],
        label: 'Nested text',
      })
    })

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ])).toEqual({ ok: true })
    expect(nestedResult).toMatchObject({
      code: 'invalid-command',
      ok: false,
      reason: 'DesignDocument publications cannot be nested',
    })
    expect(document.read.node('leaf')?.text).toBe('Remote')
  })

  it('notifies patch observers after every canonical read is synchronized', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const observed: unknown[] = []

    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })

    port.subscribe(() => {
      observed.push({
        document: document.snapshot.nodes[1]?.text,
        history: document.historyStatus(),
        pointer: port.at('/nodes/1/text'),
        query: port.query('$.nodes[?@.id == "leaf"].text'),
        value: port.value.nodes[1]?.text,
      })
    })

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ])).toEqual({ ok: true })
    expect(observed).toEqual([{
      document: 'Remote',
      history: {
        canRedo: false,
        canUndo: false,
      },
      pointer: {
        ok: true,
        path: '/nodes/1/text',
        value: 'Remote',
      },
      query: {
        ok: true,
        pointers: ['/nodes/1/text'],
        query: '$.nodes[?@.id == "leaf"].text',
      },
      value: 'Remote',
    }])
  })

  it('does not replay a publication to a subscriber added during synchronization', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const late = vi.fn()
    const lateSubscriptions: Array<() => void> = []

    document.subscribe(() => {
      if (lateSubscriptions.length === 0) {
        lateSubscriptions.push(port.subscribe(late))
      }
    })

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'First' },
    ])).toEqual({ ok: true })
    expect(late).not.toHaveBeenCalled()

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Second' },
    ])).toEqual({ ok: true })
    expect(late).toHaveBeenCalledTimes(1)
    expect(late.mock.calls[0]?.[0]).toEqual([
      { op: 'replace', path: '/nodes/1/text', value: 'Second' },
    ])

    lateSubscriptions[0]?.()
  })

  it('exposes frozen canonical values instead of the mutable history store', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const roots = port.at('/roots')

    expect(roots).toMatchObject({ ok: true, value: ['root'] })
    if (!roots.ok) {
      throw new Error('Expected roots to exist')
    }

    expect(Object.isFrozen(roots.value)).toBe(true)
    expect(() => {
      ;(roots.value as string[])[0] = 'missing'
    }).toThrow()
    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ])).toEqual({ ok: true })
    expect(document.snapshot.roots).toEqual(['root'])
    expect(document.read.node('leaf')?.text).toBe('Remote')
  })

  it('owns immutable patch data across later local undo and redo', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const operations = [
      { op: 'replace' as const, path: '/nodes/1/text', value: 'Remote' },
    ]
    const healthy = vi.fn()

    port.subscribe((published) => {
      const mutable = published as unknown as Array<{
        path: string
        value: unknown
      }>
      mutable[0]!.path = '/roots/0'
      mutable[0]!.value = 'missing'
    })
    port.subscribe(healthy)

    expect(port.commit(operations)).toEqual({ ok: true })
    operations[0]!.path = '/roots/0'
    operations[0]!.value = 'missing'

    expect(healthy).toHaveBeenCalledTimes(1)
    expect(healthy.mock.calls[0]?.[0]).toEqual([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ])
    expect(healthy.mock.calls[0]?.[1]).toBeUndefined()
    expect(Object.isFrozen(healthy.mock.calls[0]?.[0])).toBe(true)
    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })
    expect(document.undo()).toBe(true)
    expect(document.read.node('leaf')?.text).toBe('Remote')
    expect(document.redo()).toBe(true)
    expect(document.read.node('leaf')?.text).toBe('Local')
    expect(document.snapshot.roots).toEqual(['root'])
  })

  it('uses an external publication as a local history barrier', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)

    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local A' },
      }],
      historyGroup: 'typing',
      label: 'Local A',
    })).toEqual({ changed: true, ok: true })
    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ])).toEqual({ ok: true })
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: false,
    })
    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local B' },
      }],
      historyGroup: 'typing',
      label: 'Local B',
    })).toEqual({ changed: true, ok: true })

    expect(document.undo()).toBe(true)
    expect(document.read.node('leaf')?.text).toBe('Remote')
    expect(document.historyStatus()).toEqual({
      canRedo: true,
      canUndo: false,
    })
    expect(document.undo()).toBe(false)
    expect(document.read.node('leaf')?.text).toBe('Remote')
    expect(document.redo()).toBe(true)
    expect(document.read.node('leaf')?.text).toBe('Local B')
  })

  it('discards stale local redo when an external publication advances the barrier', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)

    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })
    expect(document.undo()).toBe(true)
    expect(document.historyStatus()).toEqual({
      canRedo: true,
      canUndo: false,
    })

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ])).toEqual({ ok: true })
    expect(document.historyStatus()).toEqual({
      canRedo: false,
      canUndo: false,
    })
    expect(document.redo()).toBe(false)
    expect(document.read.node('leaf')?.text).toBe('Remote')
  })

  it('rejects non-string metadata before mutating the internal store', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Ghost' },
    ], {
      origin: (() => 'invalid') as unknown as string,
    })).toMatchObject({
      code: 'schema_violation',
      ok: false,
      reason: 'DesignDocument patch metadata origin must be a string',
    })
    expect(document.read.node('leaf')?.text).toBe('Draft')
    expect(document.historyStatus().canUndo).toBe(false)

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Next' },
    ])).toEqual({ ok: true })
    expect(document.undo()).toBe(false)
    expect(document.read.node('leaf')?.text).toBe('Next')
    expect(document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: 'Local text',
    })).toEqual({ changed: true, ok: true })
    expect(document.undo()).toBe(true)
    expect(document.read.node('leaf')?.text).toBe('Next')
  })

  it('never lets runtime-invalid command metadata split canonical state', () => {
    const document = createDesignDocument(createSnapshot())

    expect(() => document.execute({
      changes: [{
        nodeId: 'leaf',
        type: 'update',
        values: { text: 'Local' },
      }],
      label: (() => 'invalid') as unknown as string,
    })).not.toThrow()
    expect(document.read.node('leaf')?.text).toBe('Local')
    expect(document.undo()).toBe(true)
    expect(document.read.node('leaf')?.text).toBe('Draft')
  })

  it('isolates patch-port observers so later journals still receive a publication', () => {
    const document = createDesignDocument(createSnapshot())
    const port = getDesignDocumentPatchPort(document)
    const healthy = vi.fn()

    port.subscribe(() => {
      throw new Error('observer failed')
    })
    port.subscribe(healthy)

    expect(port.commit([
      { op: 'replace', path: '/nodes/1/text', value: 'Remote' },
    ])).toEqual({ ok: true })
    expect(healthy).toHaveBeenCalledTimes(1)
  })
})

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
