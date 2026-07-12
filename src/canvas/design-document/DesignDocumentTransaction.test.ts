import { describe, expect, it } from 'vitest'
import { createDesignDocument } from './DesignDocument'
import { prepareDesignDocumentCommandTransaction } from './DesignDocumentTransaction'
import type { DesignDocumentSnapshot } from './DesignDocumentTypes'
import { validateAndIndexDesignDocument } from './DesignDocumentValidation'

describe('DesignDocument validated transaction', () => {
  it('uses touched node validation and preserves unrelated graph indexes', () => {
    const snapshot = createDesignDocument(createSnapshot()).snapshot
    const graph = validateAndIndexDesignDocument(snapshot)
    const transaction = prepareDesignDocumentCommandTransaction(
      snapshot,
      graph,
      [{
        type: 'update',
        nodeId: 'leaf',
        values: { label: 'Updated leaf' },
      }],
    )

    expect(transaction.snapshot.roots).toBe(snapshot.roots)
    expect(transaction.snapshot.nodes[0]).toBe(snapshot.nodes[0])
    expect(transaction.snapshot.nodes[1]).not.toBe(snapshot.nodes[1])
    expect(transaction.graph.parentById).toBe(graph.parentById)
    expect(transaction.graph.nodeIndexById).toBe(graph.nodeIndexById)
    expect(transaction.graph.componentNodeIdBySlot)
      .toBe(graph.componentNodeIdBySlot)
    expect(transaction.storeOperations).toEqual([{
      op: 'replace',
      path: '/nodes/1',
      value: transaction.snapshot.nodes[1],
    }])
    expect(transaction.publicationOperations).toEqual([{
      op: 'replace',
      path: '',
      value: transaction.snapshot,
    }])
  })
})

function createSnapshot(): DesignDocumentSnapshot {
  return {
    schemaVersion: 1,
    roots: ['root'],
    nodes: [
      {
        id: 'root',
        label: 'Root',
        definition: { kind: 'intrinsic', id: 'main' },
        children: ['leaf'],
        props: {},
        text: null,
        layout: {},
        style: {},
        frame: null,
        component: null,
      },
      {
        id: 'leaf',
        label: 'Leaf',
        definition: { kind: 'intrinsic', id: 'p' },
        children: [],
        props: {},
        text: 'Draft',
        layout: {},
        style: {},
        frame: null,
        component: null,
      },
    ],
  }
}
