import { performance } from 'node:perf_hooks'
import { describe, expect, it } from 'vitest'
import { createDesignDocument } from './DesignDocument'
import type {
  DesignDocumentSnapshot,
  DesignNode,
} from './DesignDocumentTypes'

const RUN_BENCHMARK = process.env.CANVAS_DESIGN_DOCUMENT_BENCHMARK === '1'
const FRAME_BUDGET_MS = 16.7
const FLAT_NODE_COUNTS = [1_000, 5_000, 10_000] as const
const SAMPLE_COUNT = 9
const WARMUP_COUNT = 2

describe('DesignDocument performance', () => {
  it('publishes a single-node update without reconstructing untouched ranges', () => {
    const document = createDesignDocument(createFlatSnapshot(100))
    const rootsBefore = document.snapshot.roots
    const untouchedNodeBefore = document.read.node('node-0')
    const updatedNodeBefore = document.read.node('node-99')

    expect(document.execute({
      label: 'Update one leaf',
      changes: [{
        type: 'update',
        nodeId: 'node-99',
        values: { label: 'Updated leaf' },
      }],
    })).toEqual({ changed: true, ok: true })

    expect(document.snapshot.roots).toBe(rootsBefore)
    expect(document.read.node('node-0')).toBe(untouchedNodeBefore)
    expect(document.read.node('node-99')).not.toBe(updatedNodeBefore)
  })

  it('creates, updates, serializes, and removes a 5k-node deep graph', () => {
    const document = createDesignDocument(createDeepSnapshot(5_000))

    expect(document.execute({
      label: 'Update deepest node',
      changes: [{
        type: 'update',
        nodeId: 'node-4999',
        values: { label: 'Deepest node updated' },
      }],
    })).toEqual({ changed: true, ok: true })
    expect(JSON.parse(document.serialize()).nodes).toHaveLength(5_000)
    expect(document.execute({
      label: 'Remove deep subtree',
      changes: [{ type: 'remove', nodeId: 'node-1' }],
    })).toEqual({ changed: true, ok: true })
    expect(document.snapshot.nodes).toHaveLength(1)
  }, 30_000)

  if (RUN_BENCHMARK) {
    it(
      'updates one node within the frame budget across flat document sizes',
      () => {
        const results = FLAT_NODE_COUNTS.map(measureFlatDocumentUpdate)
        const fiveThousandNodes = results.find(({ nodeCount }) =>
          nodeCount === 5_000)

        console.log(JSON.stringify({
          environment: {
            arch: process.arch,
            node: process.version,
            platform: process.platform,
          },
          results,
        }, null, 2))

        expect(fiveThousandNodes?.medianMs)
          .toBeLessThanOrEqual(FRAME_BUDGET_MS)
      },
      30_000,
    )
  }
})

function measureFlatDocumentUpdate(nodeCount: number) {
  const document = createDesignDocument(createFlatSnapshot(nodeCount))

  for (let index = 0; index < WARMUP_COUNT; index += 1) {
    executeMeasuredUpdate(document, nodeCount, `warmup-${index}`)
  }

  const samples = Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const startedAt = performance.now()

    executeMeasuredUpdate(document, nodeCount, `sample-${index}`)

    return performance.now() - startedAt
  }).sort((left, right) => left - right)

  return {
    medianMs: roundMilliseconds(samples[Math.floor(samples.length / 2)]),
    nodeCount,
    samplesMs: samples.map(roundMilliseconds),
  }
}

function executeMeasuredUpdate(
  document: ReturnType<typeof createDesignDocument>,
  nodeCount: number,
  label: string,
) {
  const result = document.execute({
    label: 'Benchmark single-node update',
    changes: [{
      type: 'update',
      nodeId: `node-${nodeCount - 1}`,
      values: { label },
    }],
  })

  if (!result.ok || !result.changed) {
    throw new Error(`benchmark update failed: ${JSON.stringify(result)}`)
  }
}

function createFlatSnapshot(nodeCount: number): DesignDocumentSnapshot {
  const childIds = Array.from(
    { length: nodeCount - 1 },
    (_, index) => `node-${index + 1}`,
  )

  return {
    schemaVersion: 1,
    roots: ['node-0'],
    nodes: Array.from({ length: nodeCount }, (_, index) =>
      createNode(`node-${index}`, index === 0 ? childIds : [])),
  }
}

function createDeepSnapshot(nodeCount: number): DesignDocumentSnapshot {
  return {
    schemaVersion: 1,
    roots: ['node-0'],
    nodes: Array.from({ length: nodeCount }, (_, index) =>
      createNode(
        `node-${index}`,
        index + 1 < nodeCount ? [`node-${index + 1}`] : [],
      )),
  }
}

function createNode(id: string, children: readonly string[]): DesignNode {
  return {
    id,
    label: id,
    definition: { kind: 'intrinsic', id: 'div' },
    children,
    props: {},
    text: null,
    layout: {},
    style: {},
    frame: null,
    component: null,
  }
}

function roundMilliseconds(value: number) {
  return Math.round(value * 1_000) / 1_000
}
