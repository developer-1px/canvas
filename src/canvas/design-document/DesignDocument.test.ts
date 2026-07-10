import { describe, expect, it } from 'vitest'

import {
  createDesignDocument,
  restoreDesignDocument,
  type DesignDocumentSnapshot,
} from './index'

describe('DesignDocument', () => {
  it('serializes and restores a representative design graph through its read interface', () => {
    const snapshot = createRepresentativeSnapshot()

    const document = createDesignDocument(snapshot)
    const restored = restoreDesignDocument(document.serialize())

    expect(restored.snapshot).toEqual(snapshot)
    expect(restored.read.roots().map((node) => node.id))
      .toEqual(['workspacePage', 'workspaceReactWidget'])
    expect(restored.read.children('workspaceMain').map((node) => node.id))
      .toEqual([
        'workspaceHeroTitle',
        'workspaceStatRevenue',
        'workspaceStatConversion',
      ])
    expect(restored.read.ancestry('workspaceHeroTitle').map((node) => node.id))
      .toEqual(['workspacePage', 'workspaceMain', 'workspaceHeroTitle'])
    expect(
      restored.read.componentPeers('workspaceStatRevenue')
        .map((node) => node.id),
    ).toEqual(['workspaceStatRevenue', 'workspaceStatConversion'])
  })

  it('rejects duplicate stable node ids at the Module seam', () => {
    const snapshot = createRepresentativeSnapshot()

    expect(() => createDesignDocument({
      ...snapshot,
      nodes: [...snapshot.nodes, snapshot.nodes[0]],
    })).toThrowError('Duplicate design node id: workspacePage')
  })

  it.each([
    [
      'missing children',
      (snapshot: DesignDocumentSnapshot) => ({
        ...snapshot,
        nodes: snapshot.nodes.filter((node) =>
          node.id !== 'workspaceHeroTitle'),
      }),
      'Missing design child: workspaceHeroTitle',
    ],
    [
      'orphans',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspaceMain',
        { children: ['workspaceStatRevenue', 'workspaceStatConversion'] },
      ),
      'Orphan design node: workspaceHeroTitle',
    ],
    [
      'cycles',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspaceHeroTitle',
        { children: ['workspacePage'], text: null },
      ),
      'Design graph cycle:',
    ],
    [
      'multiple parents',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspacePage',
        { children: ['workspaceMain', 'workspaceHeroTitle'] },
      ),
      'Multiple parents for design node: workspaceHeroTitle',
    ],
    [
      'text parents',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspaceMain',
        { text: 'Invalid parent' },
      ),
      'Text design node cannot have children: workspaceMain',
    ],
    [
      'widget parents',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspaceMain',
        { definition: { kind: 'widget', id: 'sticky-note' } },
      ),
      'Widget design node cannot have children: workspaceMain',
    ],
    [
      'void intrinsic parents',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspaceMain',
        { definition: { kind: 'intrinsic', id: 'img' } },
      ),
      'Void intrinsic design node cannot have children: workspaceMain',
    ],
  ])('rejects structurally invalid graphs with %s', (_label, change, reason) => {
    expect(() => createDesignDocument(
      change(createRepresentativeSnapshot()),
    )).toThrowError(reason)
  })

  it.each([
    [
      'unknown schema versions',
      (snapshot: DesignDocumentSnapshot) => ({
        ...snapshot,
        schemaVersion: 2,
      }),
    ],
    [
      'non-JSON props',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspacePage',
        { props: { onClick: () => undefined } as never },
      ),
    ],
  ])('rejects %s before indexing the graph', (_label, change) => {
    expect(() => createDesignDocument(
      change(createRepresentativeSnapshot()),
    )).toThrow()
  })

  it.each([
    [
      'ephemeral runtime state',
      (snapshot: DesignDocumentSnapshot) => ({
        ...snapshot,
        selection: { nodeIds: ['workspacePage'] },
        viewport: { x: 0, y: 0, zoom: 1 },
      }),
    ],
    [
      'class instances',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspacePage',
        { props: { reference: new RuntimeReference() } as never },
      ),
    ],
    [
      'React-like symbols',
      (snapshot: DesignDocumentSnapshot) => updateNode(
        snapshot,
        'workspacePage',
        { props: { element: { $$typeof: Symbol.for('react.element') } } as never },
      ),
    ],
  ])('rejects %s from persistent authored content', (_label, change) => {
    expect(() => createDesignDocument(
      change(createRepresentativeSnapshot()),
    )).toThrow()
  })

  it('commits a multi-node update as one atomic undoable command', () => {
    const document = createDesignDocument(createRepresentativeSnapshot())
    const before = document.snapshot

    expect(document.execute({
      label: 'Update stat card padding',
      changes: [
        {
          type: 'update',
          nodeId: 'workspaceStatRevenue',
          values: { layout: { display: 'flex', padding: 20 } },
        },
        {
          type: 'update',
          nodeId: 'workspaceStatConversion',
          values: { layout: { display: 'flex', padding: 20 } },
        },
      ],
    })).toEqual({ changed: true, ok: true })
    expect(document.snapshot).not.toBe(before)
    expect(document.read.node('workspaceStatRevenue')?.layout.padding).toBe(20)
    expect(document.read.node('workspaceStatConversion')?.layout.padding)
      .toBe(20)

    expect(document.undo()).toBe(true)
    expect(document.snapshot).toEqual(before)
    expect(document.undo()).toBe(false)

    expect(document.redo()).toBe(true)
    expect(document.read.node('workspaceStatRevenue')?.layout.padding).toBe(20)
    expect(document.read.node('workspaceStatConversion')?.layout.padding)
      .toBe(20)
    expect(document.redo()).toBe(false)
  })

  it('adds, reparents, and removes nodes through ordered structural commands', () => {
    const document = createDesignDocument(createRepresentativeSnapshot())
    const note = {
      id: 'workspaceNote',
      label: 'Review note',
      definition: { kind: 'intrinsic' as const, id: 'aside' },
      children: [],
      props: {},
      text: 'Review pipeline risk',
      layout: {},
      style: { backgroundColor: '#fef3c7' },
      frame: null,
      component: null,
    }

    expect(document.execute({
      label: 'Add note',
      changes: [{
        type: 'add',
        parentId: 'workspaceMain',
        index: 1,
        node: note,
      }],
    })).toEqual({ changed: true, ok: true })
    expect(document.read.children('workspaceMain').map((node) => node.id))
      .toEqual([
        'workspaceHeroTitle',
        'workspaceNote',
        'workspaceStatRevenue',
        'workspaceStatConversion',
      ])

    expect(document.execute({
      label: 'Move note',
      changes: [{
        type: 'move',
        nodeId: 'workspaceNote',
        parentId: 'workspacePage',
        index: 1,
      }],
    })).toEqual({ changed: true, ok: true })
    expect(document.read.ancestry('workspaceNote').map((node) => node.id))
      .toEqual(['workspacePage', 'workspaceNote'])

    expect(document.execute({
      label: 'Remove note',
      changes: [{ type: 'remove', nodeId: 'workspaceNote' }],
    })).toEqual({ changed: true, ok: true })
    expect(document.read.node('workspaceNote')).toBeNull()

    expect(document.undo()).toBe(true)
    expect(document.read.node('workspaceNote')).toEqual(note)
    expect(document.undo()).toBe(true)
    expect(document.read.ancestry('workspaceNote').map((node) => node.id))
      .toEqual(['workspacePage', 'workspaceMain', 'workspaceNote'])
    expect(document.undo()).toBe(true)
    expect(document.read.node('workspaceNote')).toBeNull()
  })

  it('rolls back failed linked changes and preserves identity for no-op commands', () => {
    const document = createDesignDocument(createRepresentativeSnapshot())
    const before = document.snapshot

    expect(document.execute({
      label: 'Invalid linked update',
      changes: [
        {
          type: 'update',
          nodeId: 'workspaceStatRevenue',
          values: { layout: { display: 'flex', padding: 20 } },
        },
        {
          type: 'update',
          nodeId: 'workspaceStatConversion',
          values: { props: { onClick: () => undefined } as never },
        },
      ],
    })).toMatchObject({ ok: false, code: 'invalid-command' })
    expect(document.snapshot).toBe(before)
    expect(document.read.node('workspaceStatRevenue')?.layout.padding).toBe(14)
    expect(document.undo()).toBe(false)

    expect(document.execute({
      label: 'Unknown change',
      changes: [{ type: 'replace-node' } as never],
    })).toMatchObject({ ok: false, code: 'invalid-command' })
    expect(document.snapshot).toBe(before)

    expect(document.execute({
      label: 'No-op update',
      changes: [{
        type: 'update',
        nodeId: 'workspaceStatRevenue',
        values: { layout: { display: 'flex', padding: 14 } },
      }],
    })).toEqual({ changed: false, ok: true })
    expect(document.snapshot).toBe(before)
    expect(document.undo()).toBe(false)
  })

  it('treats JSON object key reordering as a no-op', () => {
    const document = createDesignDocument(createRepresentativeSnapshot())
    const before = document.snapshot

    expect(document.execute({
      label: 'Reorder equivalent layout keys',
      changes: [{
        type: 'update',
        nodeId: 'workspaceMain',
        values: { layout: { gap: 12, display: 'grid' } },
      }],
    })).toEqual({ changed: false, ok: true })
    expect(document.snapshot).toBe(before)
    expect(document.undo()).toBe(false)
  })

  it('isolates the immutable public snapshot from caller-owned input', () => {
    const input = createRepresentativeSnapshot()
    const document = createDesignDocument(input)
    const root = document.read.node('workspacePage')

    ;(input.nodes[0].props as Record<string, unknown>).mutated = true

    expect(root?.props).toEqual({ 'aria-label': 'Workspace' })
    expect(Object.isFrozen(document.snapshot)).toBe(true)
    expect(Object.isFrozen(root)).toBe(true)
    expect(Object.isFrozen(root?.props)).toBe(true)

    document.execute({
      label: 'Change root label',
      changes: [{
        type: 'update',
        nodeId: 'workspacePage',
        values: { label: 'Changed workspace' },
      }],
    })
    document.undo()
    expect(document.read.node('workspacePage')?.props)
      .toEqual({ 'aria-label': 'Workspace' })
  })

  it('rejects duplicate component instance slots', () => {
    const snapshot = createRepresentativeSnapshot()

    expect(() => createDesignDocument(updateNode(
      snapshot,
      'workspaceStatConversion',
      {
        component: {
          definitionId: 'workspace-stat-card',
          instanceId: 'revenue',
          slotId: 'root',
        },
      },
    ))).toThrowError(
      'Duplicate component instance slot: workspace-stat-card/revenue/root',
    )
  })

  it('keeps component binding tuples distinct when stable ids contain slashes', () => {
    const snapshot = updateNode(
      updateNode(
        createRepresentativeSnapshot(),
        'workspaceStatRevenue',
        {
          definition: { kind: 'component', id: 'a/b' },
          component: {
            definitionId: 'a/b',
            instanceId: 'c',
            slotId: 'd',
          },
        },
      ),
      'workspaceStatConversion',
      {
        definition: { kind: 'component', id: 'a' },
        component: {
          definitionId: 'a',
          instanceId: 'b/c',
          slotId: 'd',
        },
      },
    )

    expect(() => createDesignDocument(snapshot)).not.toThrow()
  })

  it('notifies subscribers only when the authored snapshot changes', () => {
    const document = createDesignDocument(createRepresentativeSnapshot())
    const snapshots: DesignDocumentSnapshot[] = []
    const unsubscribe = document.subscribe(() => snapshots.push(
      document.snapshot,
    ))

    document.execute({
      label: 'Update title',
      changes: [{
        type: 'update',
        nodeId: 'workspaceHeroTitle',
        values: { text: 'A canonical React workspace.' },
      }],
    })
    document.execute({
      label: 'No-op title',
      changes: [{
        type: 'update',
        nodeId: 'workspaceHeroTitle',
        values: { text: 'A canonical React workspace.' },
      }],
    })
    document.undo()

    expect(snapshots).toHaveLength(2)
    expect(snapshots[0]).not.toBe(snapshots[1])

    unsubscribe()
    document.redo()
    expect(snapshots).toHaveLength(2)
  })

  it('contains subscriber failures without changing command or history results', () => {
    const document = createDesignDocument(createRepresentativeSnapshot())
    const notifications: string[] = []

    document.subscribe(() => {
      notifications.push('throwing')
      throw new Error('subscriber failed')
    })
    document.subscribe(() => notifications.push('healthy'))

    expect(() => document.execute({
      label: 'Update title despite a broken observer',
      changes: [{
        type: 'update',
        nodeId: 'workspaceHeroTitle',
        values: { text: 'A resilient canonical workspace.' },
      }],
    })).not.toThrow()
    expect(notifications).toEqual(['throwing', 'healthy'])
    expect(document.read.node('workspaceHeroTitle')?.text)
      .toBe('A resilient canonical workspace.')

    expect(() => document.undo()).not.toThrow()
    expect(notifications).toEqual([
      'throwing',
      'healthy',
      'throwing',
      'healthy',
    ])
    expect(document.read.node('workspaceHeroTitle')?.text)
      .toBe('Build a workspace that moves with the team.')
  })
})

function createRepresentativeSnapshot(): DesignDocumentSnapshot {
  return {
    schemaVersion: 1,
    roots: ['workspacePage', 'workspaceReactWidget'],
    nodes: [
      {
        id: 'workspacePage',
        label: 'Workspace page',
        definition: { kind: 'intrinsic', id: 'section' },
        children: ['workspaceMain'],
        props: { 'aria-label': 'Workspace' },
        text: null,
        layout: { display: 'flex', direction: 'column' },
        style: { backgroundColor: '#f8fafc' },
        frame: {
          x: 0,
          y: 0,
          width: 1440,
          height: 1024,
          rotation: 0,
          widthMode: 'fixed',
          heightMode: 'content',
          overflow: 'scroll',
        },
        component: null,
      },
      {
        id: 'workspaceMain',
        label: 'Main area',
        definition: { kind: 'intrinsic', id: 'main' },
        children: [
          'workspaceHeroTitle',
          'workspaceStatRevenue',
          'workspaceStatConversion',
        ],
        props: {},
        text: null,
        layout: { display: 'grid', gap: 12 },
        style: {},
        frame: null,
        component: null,
      },
      {
        id: 'workspaceHeroTitle',
        label: 'Hero title',
        definition: { kind: 'intrinsic', id: 'h2' },
        children: [],
        props: {},
        text: 'Build a workspace that moves with the team.',
        layout: {},
        style: { color: '#0f172a' },
        frame: null,
        component: null,
      },
      createStatCardNode('workspaceStatRevenue', 'revenue'),
      createStatCardNode('workspaceStatConversion', 'conversion'),
      {
        id: 'workspaceReactWidget',
        label: 'React widget',
        definition: { kind: 'widget', id: 'workspace-counter' },
        children: [],
        props: { count: 3 },
        text: null,
        layout: {},
        style: {},
        frame: {
          x: 1512,
          y: 0,
          width: 320,
          height: 220,
          rotation: 0,
          widthMode: 'fixed',
          heightMode: 'fixed',
          overflow: 'visible',
        },
        component: null,
      },
    ],
  }
}

function createStatCardNode(
  id: string,
  instanceId: string,
): DesignDocumentSnapshot['nodes'][number] {
  return {
    id,
    label: `${instanceId} stat`,
    definition: { kind: 'component', id: 'workspace-stat-card' },
    children: [],
    props: { label: instanceId },
    text: null,
    layout: { display: 'flex', padding: 14 },
    style: { borderRadius: 14 },
    frame: null,
    component: {
      definitionId: 'workspace-stat-card',
      instanceId,
      slotId: 'root',
    },
  }
}

function updateNode(
  snapshot: DesignDocumentSnapshot,
  nodeId: string,
  change: Partial<DesignDocumentSnapshot['nodes'][number]>,
): DesignDocumentSnapshot {
  return {
    ...snapshot,
    nodes: snapshot.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...change } : node),
  }
}

class RuntimeReference {
  readonly current = 'ephemeral'
}
