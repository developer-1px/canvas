import type { JSONPatchOperation } from '@interactive-os/json-document'
import {
  applyDesignDocumentChanges,
  applyDesignNodeUpdate,
} from './DesignDocumentChanges'
import {
  parseDesignDocumentSnapshot,
  parseDesignNode,
} from './DesignDocumentSchema'
import type {
  DesignDocumentChange,
  DesignDocumentSnapshot,
  DesignNode,
} from './DesignDocumentTypes'
import {
  type DesignDocumentGraphIndex,
  validateAndIndexDesignDocument,
  validateDesignNodeComponentBinding,
  validateDesignNodeParentKind,
} from './DesignDocumentValidation'

export type ValidatedDesignDocumentTransaction = {
  readonly changed: boolean
  readonly graph: DesignDocumentGraphIndex
  readonly publicationOperations: ReadonlyArray<JSONPatchOperation>
  readonly snapshot: DesignDocumentSnapshot
  readonly storeOperations: ReadonlyArray<JSONPatchOperation>
}

export function prepareDesignDocumentCommandTransaction(
  snapshot: DesignDocumentSnapshot,
  graph: DesignDocumentGraphIndex,
  changes: readonly DesignDocumentChange[],
): ValidatedDesignDocumentTransaction {
  return changes.every((change) => change.type === 'update')
    ? prepareDesignDocumentUpdateTransaction(snapshot, graph, changes)
    : prepareFullyValidatedTransaction(snapshot, changes)
}

export function freezeDesignDocumentSnapshot(
  snapshot: DesignDocumentSnapshot,
) {
  return deepFreeze(
    JSON.parse(JSON.stringify(snapshot)) as DesignDocumentSnapshot,
  )
}

function prepareDesignDocumentUpdateTransaction(
  snapshot: DesignDocumentSnapshot,
  graph: DesignDocumentGraphIndex,
  changes: readonly Extract<DesignDocumentChange, { type: 'update' }>[],
): ValidatedDesignDocumentTransaction {
  const pendingNodes = new Map<number, DesignNode>()

  for (const change of changes) {
    const nodeIndex = graph.nodeIndexById.get(change.nodeId)

    if (nodeIndex === undefined) {
      throw new Error(`Unknown design node: ${change.nodeId}`)
    }

    const currentNode = pendingNodes.get(nodeIndex) ?? snapshot.nodes[nodeIndex]
    pendingNodes.set(
      nodeIndex,
      applyDesignNodeUpdate(currentNode, change.values),
    )
  }

  const changedNodes = new Map<number, DesignNode>()

  for (const [nodeIndex, pendingNode] of pendingNodes) {
    const nextNode = deepFreeze(parseDesignNode(pendingNode))

    validateDesignNodeParentKind(nextNode)
    validateDesignNodeComponentBinding(nextNode)

    if (!areJSONValuesEqual(nextNode, snapshot.nodes[nodeIndex])) {
      changedNodes.set(nodeIndex, nextNode)
    }
  }

  if (changedNodes.size === 0) {
    return unchangedTransaction(snapshot, graph)
  }

  const nodes = Object.freeze(snapshot.nodes.map((node, index) =>
    changedNodes.get(index) ?? node))
  const nextSnapshot = Object.freeze({
    ...snapshot,
    nodes,
  })
  const nodeById = new Map(graph.nodeById)

  for (const node of changedNodes.values()) {
    nodeById.set(node.id, node)
  }

  const nextGraph = {
    ...graph,
    componentNodeIdBySlot: updateComponentSlotIndex(
      graph,
      snapshot,
      changedNodes,
    ),
    nodeById,
  }
  const storeOperations = freezeOperations(
    [...changedNodes.entries()]
      .sort(([left], [right]) => left - right)
      .map(([index, node]) => ({
        op: 'replace' as const,
        path: `/nodes/${index}`,
        value: node,
      })),
  )

  return {
    changed: true,
    graph: nextGraph,
    publicationOperations: rootReplacement(nextSnapshot),
    snapshot: nextSnapshot,
    storeOperations,
  }
}

function prepareFullyValidatedTransaction(
  snapshot: DesignDocumentSnapshot,
  changes: readonly DesignDocumentChange[],
): ValidatedDesignDocumentTransaction {
  const nextSnapshot = freezeDesignDocumentSnapshot(
    parseDesignDocumentSnapshot(
      applyDesignDocumentChanges(snapshot, changes),
    ),
  )
  const graph = validateAndIndexDesignDocument(nextSnapshot)

  if (areJSONValuesEqual(nextSnapshot, snapshot)) {
    return unchangedTransaction(snapshot, graph)
  }

  const operations = rootReplacement(nextSnapshot)

  return {
    changed: true,
    graph,
    publicationOperations: operations,
    snapshot: nextSnapshot,
    storeOperations: operations,
  }
}

function updateComponentSlotIndex(
  graph: DesignDocumentGraphIndex,
  snapshot: DesignDocumentSnapshot,
  changedNodes: ReadonlyMap<number, DesignNode>,
) {
  const changedBindings = [...changedNodes].filter(([index, node]) => {
    const previous = validateDesignNodeComponentBinding(snapshot.nodes[index])
    const next = validateDesignNodeComponentBinding(node)

    return previous?.key !== next?.key
  })

  if (changedBindings.length === 0) {
    return graph.componentNodeIdBySlot
  }

  const componentNodeIdBySlot = new Map(graph.componentNodeIdBySlot)

  for (const [index] of changedBindings) {
    const previous = validateDesignNodeComponentBinding(snapshot.nodes[index])

    if (previous !== null) {
      componentNodeIdBySlot.delete(previous.key)
    }
  }

  for (const [, node] of changedBindings) {
    const next = validateDesignNodeComponentBinding(node)

    if (next === null) {
      continue
    }

    const existingNodeId = componentNodeIdBySlot.get(next.key)

    if (existingNodeId !== undefined && existingNodeId !== node.id) {
      throw new Error(`Duplicate component instance slot: ${next.label}`)
    }

    componentNodeIdBySlot.set(next.key, node.id)
  }

  return componentNodeIdBySlot
}

function unchangedTransaction(
  snapshot: DesignDocumentSnapshot,
  graph: DesignDocumentGraphIndex,
): ValidatedDesignDocumentTransaction {
  return {
    changed: false,
    graph,
    publicationOperations: [],
    snapshot,
    storeOperations: [],
  }
}

function rootReplacement(snapshot: DesignDocumentSnapshot) {
  return freezeOperations([{ op: 'replace', path: '', value: snapshot }])
}

function freezeOperations(operations: ReadonlyArray<JSONPatchOperation>) {
  for (const operation of operations) {
    Object.freeze(operation)
  }

  return Object.freeze(operations)
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  const pending: object[] = [value]

  while (pending.length > 0) {
    const current = pending.pop()

    if (current === undefined || Object.isFrozen(current)) {
      continue
    }

    Object.freeze(current)

    for (const child of Object.values(current)) {
      if (child && typeof child === 'object' && !Object.isFrozen(child)) {
        pending.push(child)
      }
    }
  }

  return value
}

function areJSONValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) =>
        areJSONValuesEqual(value, right[index]))
  }

  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  ) {
    return false
  }

  const leftRecord = left as Record<string, unknown>
  const rightRecord = right as Record<string, unknown>
  const leftKeys = Object.keys(leftRecord)
  const rightKeys = Object.keys(rightRecord)

  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(rightRecord, key) &&
      areJSONValuesEqual(leftRecord[key], rightRecord[key]))
}
