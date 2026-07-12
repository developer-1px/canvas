import type {
  DesignDocumentSnapshot,
  DesignNode,
  DesignNodeId,
} from './DesignDocumentTypes'

export type DesignDocumentGraphIndex = {
  readonly nodeById: ReadonlyMap<DesignNodeId, DesignNode>
  readonly nodeIndexById: ReadonlyMap<DesignNodeId, number>
  readonly parentById: ReadonlyMap<DesignNodeId, DesignNodeId>
  readonly componentNodeIdBySlot: ReadonlyMap<string, DesignNodeId>
}

export function validateAndIndexDesignDocument(
  snapshot: DesignDocumentSnapshot,
): DesignDocumentGraphIndex {
  const nodeById = new Map<DesignNodeId, DesignNode>()
  const nodeIndexById = new Map<DesignNodeId, number>()
  const parentById = new Map<DesignNodeId, DesignNodeId>()

  for (const [index, node] of snapshot.nodes.entries()) {
    if (nodeById.has(node.id)) {
      throw new Error(`Duplicate design node id: ${node.id}`)
    }

    nodeById.set(node.id, node)
    nodeIndexById.set(node.id, index)
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
    validateDesignNodeParentKind(node)

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

  const componentNodeIdBySlot = validateComponentBindings(snapshot.nodes)

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

  return {
    componentNodeIdBySlot,
    nodeById,
    nodeIndexById,
    parentById,
  }
}

function validateComponentBindings(nodes: readonly DesignNode[]) {
  const componentNodeIdBySlot = new Map<string, DesignNodeId>()

  for (const node of nodes) {
    const instanceSlot = validateDesignNodeComponentBinding(node)
    if (instanceSlot === null) {
      continue
    }

    if (componentNodeIdBySlot.has(instanceSlot.key)) {
      throw new Error(
        `Duplicate component instance slot: ${instanceSlot.label}`,
      )
    }

    componentNodeIdBySlot.set(instanceSlot.key, node.id)
  }

  return componentNodeIdBySlot
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

export function validateDesignNodeParentKind(node: DesignNode) {
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

export function validateDesignNodeComponentBinding(node: DesignNode): {
  readonly key: string
  readonly label: string
} | null {
  const binding = node.component

  if (!binding) {
    return null
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

  return {
    key: JSON.stringify(instanceSlotParts),
    label: instanceSlotParts.join('/'),
  }
}

function validateAcyclicGraph(
  nodes: readonly DesignNode[],
  nodeById: ReadonlyMap<DesignNodeId, DesignNode>,
) {
  const visiting = new Set<DesignNodeId>()
  const visited = new Set<DesignNodeId>()
  const path: DesignNodeId[] = []

  for (const node of nodes) {
    if (visited.has(node.id)) {
      continue
    }

    const frames = [{ childIndex: 0, nodeId: node.id }]
    visiting.add(node.id)
    path.push(node.id)

    while (frames.length > 0) {
      const frame = frames[frames.length - 1]
      const children = nodeById.get(frame.nodeId)?.children ?? []
      const childId = children[frame.childIndex]

      if (childId !== undefined) {
        frame.childIndex += 1

        if (visiting.has(childId)) {
          const cycleStart = path.indexOf(childId)
          const cycle = [...path.slice(cycleStart), childId]

          throw new Error(`Design graph cycle: ${cycle.join(' -> ')}`)
        }

        if (!visited.has(childId)) {
          visiting.add(childId)
          path.push(childId)
          frames.push({ childIndex: 0, nodeId: childId })
        }

        continue
      }

      frames.pop()
      path.pop()
      visiting.delete(frame.nodeId)
      visited.add(frame.nodeId)
    }
  }
}

function collectReachableIds(
  nodeId: DesignNodeId,
  nodeById: ReadonlyMap<DesignNodeId, DesignNode>,
  reachableIds: Set<DesignNodeId>,
) {
  const pending = [nodeId]

  while (pending.length > 0) {
    const currentId = pending.pop()

    if (currentId === undefined || reachableIds.has(currentId)) {
      continue
    }

    reachableIds.add(currentId)

    for (const childId of nodeById.get(currentId)?.children ?? []) {
      pending.push(childId)
    }
  }
}
