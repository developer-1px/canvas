import type {
  DesignDocumentChange,
  DesignDocumentSnapshot,
  DesignNode,
  DesignNodeUpdateValues,
} from './DesignDocumentTypes'

export function applyDesignDocumentChanges(
  snapshot: DesignDocumentSnapshot,
  changes: readonly DesignDocumentChange[],
): DesignDocumentSnapshot {
  let current = snapshot

  for (const change of changes) {
    switch (change.type) {
      case 'add':
        current = addDesignNode(current, change)
        break
      case 'move':
        current = moveDesignNode(current, change)
        break
      case 'remove':
        current = removeDesignNode(current, change.nodeId)
        break
      case 'update':
        current = updateDesignNode(current, change)
        break
      default:
        throw new Error(
          `Unknown design document change: ${readUnknownChangeType(change)}`,
        )
    }
  }

  return current
}

function readUnknownChangeType(change: unknown) {
  if (
    change &&
    typeof change === 'object' &&
    'type' in change &&
    typeof change.type === 'string'
  ) {
    return change.type
  }

  return 'unknown'
}

function addDesignNode(
  snapshot: DesignDocumentSnapshot,
  change: Extract<DesignDocumentChange, { type: 'add' }>,
) {
  if (snapshot.nodes.some((node) => node.id === change.node.id)) {
    throw new Error(`Duplicate design node id: ${change.node.id}`)
  }

  if (change.node.children.length > 0) {
    throw new Error(`Added design node must start without children: ${change.node.id}`)
  }

  return insertDesignNodePlacement(
    { ...snapshot, nodes: [...snapshot.nodes, change.node] },
    change.node.id,
    change.parentId,
    change.index,
  )
}

function moveDesignNode(
  snapshot: DesignDocumentSnapshot,
  change: Extract<DesignDocumentChange, { type: 'move' }>,
) {
  requireDesignNode(snapshot, change.nodeId)
  const withoutPlacement = removeDesignNodePlacement(snapshot, change.nodeId)

  return insertDesignNodePlacement(
    withoutPlacement,
    change.nodeId,
    change.parentId,
    change.index,
  )
}

function removeDesignNode(
  snapshot: DesignDocumentSnapshot,
  nodeId: string,
) {
  requireDesignNode(snapshot, nodeId)
  const removedIds = new Set<string>()

  collectSubtreeIds(snapshot, nodeId, removedIds)

  const withoutPlacement = removeDesignNodePlacement(snapshot, nodeId)

  return {
    ...withoutPlacement,
    nodes: withoutPlacement.nodes.filter((node) => !removedIds.has(node.id)),
  }
}

function updateDesignNode(
  snapshot: DesignDocumentSnapshot,
  change: Extract<DesignDocumentChange, { type: 'update' }>,
) {
  const nodeIndex = snapshot.nodes.findIndex(
    (node) => node.id === change.nodeId,
  )

  if (nodeIndex === -1) {
    throw new Error(`Unknown design node: ${change.nodeId}`)
  }

  const nextNode = applyDesignNodeUpdate(
    snapshot.nodes[nodeIndex],
    change.values,
  )

  return {
    ...snapshot,
    nodes: [
      ...snapshot.nodes.slice(0, nodeIndex),
      nextNode,
      ...snapshot.nodes.slice(nodeIndex + 1),
    ],
  }
}

export function applyDesignNodeUpdate(
  node: DesignNode,
  values: DesignNodeUpdateValues,
): DesignNode {
  return {
    ...node,
    ...(values.definition === undefined
      ? {} : { definition: values.definition }),
    ...(values.label === undefined ? {} : { label: values.label }),
    ...(values.props === undefined ? {} : { props: values.props }),
    ...(values.text === undefined ? {} : { text: values.text }),
    ...(values.layout === undefined ? {} : { layout: values.layout }),
    ...(values.style === undefined ? {} : { style: values.style }),
    ...(values.frame === undefined ? {} : { frame: values.frame }),
    ...(values.component === undefined
      ? {} : { component: values.component }),
  }
}

function insertDesignNodePlacement(
  snapshot: DesignDocumentSnapshot,
  nodeId: string,
  parentId: string | null,
  index: number,
): DesignDocumentSnapshot {
  if (parentId === null) {
    assertInsertionIndex(index, snapshot.roots.length)

    return {
      ...snapshot,
      roots: insertAt(snapshot.roots, index, nodeId),
    }
  }

  const parentIndex = snapshot.nodes.findIndex((node) => node.id === parentId)

  if (parentIndex === -1) {
    throw new Error(`Unknown design parent: ${parentId}`)
  }

  const parent = snapshot.nodes[parentIndex]
  assertInsertionIndex(index, parent.children.length)

  return {
    ...snapshot,
    nodes: replaceAt(snapshot.nodes, parentIndex, {
      ...parent,
      children: insertAt(parent.children, index, nodeId),
    }),
  }
}

function removeDesignNodePlacement(
  snapshot: DesignDocumentSnapshot,
  nodeId: string,
): DesignDocumentSnapshot {
  const rootIndex = snapshot.roots.indexOf(nodeId)

  if (rootIndex !== -1) {
    return {
      ...snapshot,
      roots: removeAt(snapshot.roots, rootIndex),
    }
  }

  const parentIndex = snapshot.nodes.findIndex((node) =>
    node.children.includes(nodeId))

  if (parentIndex === -1) {
    throw new Error(`Design node has no placement: ${nodeId}`)
  }

  const parent = snapshot.nodes[parentIndex]
  const childIndex = parent.children.indexOf(nodeId)

  return {
    ...snapshot,
    nodes: replaceAt(snapshot.nodes, parentIndex, {
      ...parent,
      children: removeAt(parent.children, childIndex),
    }),
  }
}

function collectSubtreeIds(
  snapshot: DesignDocumentSnapshot,
  nodeId: string,
  nodeIds: Set<string>,
) {
  const nodeById = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const pending = [nodeId]

  while (pending.length > 0) {
    const currentId = pending.pop()

    if (currentId === undefined || nodeIds.has(currentId)) {
      continue
    }

    const node = nodeById.get(currentId)

    if (!node) {
      throw new Error(`Unknown design node: ${currentId}`)
    }

    nodeIds.add(currentId)

    for (const childId of node.children) {
      pending.push(childId)
    }
  }
}

function requireDesignNode(snapshot: DesignDocumentSnapshot, nodeId: string) {
  const node = snapshot.nodes.find((candidate) => candidate.id === nodeId)

  if (!node) {
    throw new Error(`Unknown design node: ${nodeId}`)
  }

  return node
}

function assertInsertionIndex(index: number, length: number) {
  if (!Number.isInteger(index) || index < 0 || index > length) {
    throw new Error(`Invalid design child index: ${index}`)
  }
}

function insertAt<T>(values: readonly T[], index: number, value: T) {
  return [...values.slice(0, index), value, ...values.slice(index)]
}

function removeAt<T>(values: readonly T[], index: number) {
  return [...values.slice(0, index), ...values.slice(index + 1)]
}

function replaceAt<T>(values: readonly T[], index: number, value: T) {
  return [...values.slice(0, index), value, ...values.slice(index + 1)]
}
