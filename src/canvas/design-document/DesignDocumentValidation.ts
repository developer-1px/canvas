import type {
  DesignDocumentSnapshot,
  DesignNode,
  DesignNodeId,
} from './DesignDocumentTypes'

export type DesignDocumentGraphIndex = {
  readonly nodeById: ReadonlyMap<DesignNodeId, DesignNode>
  readonly parentById: ReadonlyMap<DesignNodeId, DesignNodeId>
}

export function validateAndIndexDesignDocument(
  snapshot: DesignDocumentSnapshot,
): DesignDocumentGraphIndex {
  const nodeById = new Map<DesignNodeId, DesignNode>()
  const parentById = new Map<DesignNodeId, DesignNodeId>()

  for (const node of snapshot.nodes) {
    if (nodeById.has(node.id)) {
      throw new Error(`Duplicate design node id: ${node.id}`)
    }

    nodeById.set(node.id, node)
  }

  const rootIds = new Set<DesignNodeId>()

  for (const rootId of snapshot.roots) {
    if (rootIds.has(rootId)) {
      throw new Error(`Duplicate design root id: ${rootId}`)
    }

    if (!nodeById.has(rootId)) {
      throw new Error(`Missing design root: ${rootId}`)
    }

    rootIds.add(rootId)
  }

  for (const node of snapshot.nodes) {
    validateParentKind(node)

    for (const childId of node.children) {
      if (!nodeById.has(childId)) {
        throw new Error(`Missing design child: ${childId}`)
      }

      if (parentById.has(childId)) {
        throw new Error(`Multiple parents for design node: ${childId}`)
      }

      parentById.set(childId, node.id)
    }
  }

  validateComponentBindings(snapshot.nodes)

  validateAcyclicGraph(snapshot.nodes, nodeById)

  for (const rootId of snapshot.roots) {
    if (parentById.has(rootId)) {
      throw new Error(`Design root cannot be a child: ${rootId}`)
    }
  }

  const reachableIds = new Set<DesignNodeId>()

  for (const rootId of snapshot.roots) {
    collectReachableIds(rootId, nodeById, reachableIds)
  }

  for (const node of snapshot.nodes) {
    if (!reachableIds.has(node.id)) {
      throw new Error(`Orphan design node: ${node.id}`)
    }
  }

  return { nodeById, parentById }
}

function validateComponentBindings(nodes: readonly DesignNode[]) {
  const instanceSlots = new Set<string>()

  for (const node of nodes) {
    const binding = node.component

    if (!binding) {
      continue
    }

    if (
      node.definition.kind === 'component' &&
      node.definition.id !== binding.definitionId
    ) {
      throw new Error(
        `Component definition mismatch for design node: ${node.id}`,
      )
    }

    const instanceSlotParts = [
      binding.definitionId,
      binding.instanceId,
      binding.slotId,
    ]
    const instanceSlot = JSON.stringify(instanceSlotParts)

    if (instanceSlots.has(instanceSlot)) {
      throw new Error(
        `Duplicate component instance slot: ${instanceSlotParts.join('/')}`,
      )
    }

    instanceSlots.add(instanceSlot)
  }
}

const VOID_INTRINSIC_IDS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

function validateParentKind(node: DesignNode) {
  if (node.children.length === 0) {
    return
  }

  if (node.text !== null) {
    throw new Error(`Text design node cannot have children: ${node.id}`)
  }

  if (node.definition.kind === 'widget') {
    throw new Error(`Widget design node cannot have children: ${node.id}`)
  }

  if (
    node.definition.kind === 'intrinsic' &&
    VOID_INTRINSIC_IDS.has(node.definition.id)
  ) {
    throw new Error(
      `Void intrinsic design node cannot have children: ${node.id}`,
    )
  }
}

function validateAcyclicGraph(
  nodes: readonly DesignNode[],
  nodeById: ReadonlyMap<DesignNodeId, DesignNode>,
) {
  const visiting = new Set<DesignNodeId>()
  const visited = new Set<DesignNodeId>()
  const path: DesignNodeId[] = []

  function visit(nodeId: DesignNodeId) {
    if (visiting.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId)
      const cycle = [...path.slice(cycleStart), nodeId]

      throw new Error(`Design graph cycle: ${cycle.join(' -> ')}`)
    }

    if (visited.has(nodeId)) {
      return
    }

    visiting.add(nodeId)
    path.push(nodeId)

    for (const childId of nodeById.get(nodeId)?.children ?? []) {
      visit(childId)
    }

    path.pop()
    visiting.delete(nodeId)
    visited.add(nodeId)
  }

  for (const node of nodes) {
    visit(node.id)
  }
}

function collectReachableIds(
  nodeId: DesignNodeId,
  nodeById: ReadonlyMap<DesignNodeId, DesignNode>,
  reachableIds: Set<DesignNodeId>,
) {
  if (reachableIds.has(nodeId)) {
    return
  }

  reachableIds.add(nodeId)

  for (const childId of nodeById.get(nodeId)?.children ?? []) {
    collectReachableIds(childId, nodeById, reachableIds)
  }
}
