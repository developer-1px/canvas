import type {
  DesignDocumentChange,
  DesignDocumentRead,
  DesignNode,
  DesignNodeId,
} from '@interactive-os/canvas/react-design'
import {
  getFigJamNodeReferenceIds,
  planFigJamReferenceRepairs,
  remapFigJamNodeReferences,
  translateFigJamNodeReferenceGeometry,
} from '@interactive-os/figjam-pack'

import {
  readFigJamNodeWorldBounds,
  readFigJamNodeWorldOrigin,
  readFigJamParentId,
  readFigJamPlacementIndex,
  unionFigJamBounds,
} from './FigJamDocumentGeometry'

export type FigJamDocumentPlan = {
  readonly changes: readonly DesignDocumentChange[]
  readonly selection: readonly DesignNodeId[]
}

export type FigJamClipboard = {
  readonly roots: readonly DesignNodeId[]
  readonly nodes: readonly DesignNode[]
}

export function planFigJamWrapSelection({
  container,
  nodeIds,
  read,
}: {
  readonly container: DesignNode
  readonly nodeIds: readonly DesignNodeId[]
  readonly read: DesignDocumentRead
}): FigJamDocumentPlan | null {
  const selected = readTopmostSelection(read, nodeIds)

  if (selected.length === 0) {
    return null
  }

  const parentId = readFigJamParentId(read, selected[0])

  if (selected.some((nodeId) => readFigJamParentId(read, nodeId) !== parentId)) {
    return null
  }

  const ordered = orderByPlacement(read, selected)
  const bounds = unionFigJamBounds(ordered.flatMap((nodeId) => {
    const value = readFigJamNodeWorldBounds(read, nodeId)
    return value ? [value] : []
  }))
  const parentOrigin = parentId
    ? readFigJamNodeWorldOrigin(read, parentId)
    : { x: 0, y: 0 }

  if (!bounds || !parentOrigin) {
    return null
  }

  const insertIndex = Math.min(...ordered.map((nodeId) =>
    readFigJamPlacementIndex(read, nodeId)))
  const nextContainer = {
    ...container,
    children: [],
    frame: null,
    layout: {
      ...container.layout,
      h: bounds.h,
      heightMode: 'fixed',
      w: bounds.w,
      widthMode: 'fixed',
      x: bounds.x - parentOrigin.x,
      y: bounds.y - parentOrigin.y,
    },
  } satisfies DesignNode
  const changes: DesignDocumentChange[] = [{
    type: 'add',
    index: insertIndex,
    node: nextContainer,
    parentId,
  }]

  for (const [index, nodeId] of ordered.entries()) {
    const node = read.node(nodeId)
    const worldOrigin = readFigJamNodeWorldOrigin(read, nodeId)

    if (!node || !worldOrigin) {
      return null
    }

    changes.push({
      type: 'update',
      nodeId,
      values: createFigJamReparentValues(
        node,
        worldOrigin.x - bounds.x,
        worldOrigin.y - bounds.y,
      ),
    }, {
      type: 'move',
      index,
      nodeId,
      parentId: nextContainer.id,
    })
  }

  return { changes, selection: [nextContainer.id] }
}

export function planFigJamUnwrapContainer(
  read: DesignDocumentRead,
  containerId: DesignNodeId,
): FigJamDocumentPlan | null {
  const container = read.node(containerId)
  const parentId = readFigJamParentId(read, containerId)
  const containerBounds = readFigJamNodeWorldBounds(read, containerId)
  const parentOrigin = parentId
    ? readFigJamNodeWorldOrigin(read, parentId)
    : { x: 0, y: 0 }
  const insertIndex = readFigJamPlacementIndex(read, containerId)

  if (!container || !containerBounds || !parentOrigin || insertIndex < 0) {
    return null
  }

  const children = read.children(containerId)
  const changes: DesignDocumentChange[] = []

  for (const [index, child] of children.entries()) {
    const worldOrigin = readFigJamNodeWorldOrigin(read, child.id)

    if (!worldOrigin) {
      return null
    }

    changes.push({
      type: 'update',
      nodeId: child.id,
      values: createFigJamReparentValues(
        child,
        worldOrigin.x - parentOrigin.x,
        worldOrigin.y - parentOrigin.y,
      ),
    }, {
      type: 'move',
      index: insertIndex + index,
      nodeId: child.id,
      parentId,
    })
  }

  changes.push({ type: 'remove', nodeId: containerId })

  return { changes, selection: children.map(({ id }) => id) }
}

export function captureFigJamClipboard(
  read: DesignDocumentRead,
  nodeIds: readonly DesignNodeId[],
): FigJamClipboard | null {
  const roots = readTopmostSelection(read, nodeIds)
  const nodes: DesignNode[] = []

  for (const rootId of roots) {
    visitSubtree(read, rootId, nodes)
  }

  return roots.length > 0 ? { roots, nodes } : null
}

export function planFigJamClipboardInsert({
  clipboard,
  createId,
  fallbackParentId,
  offset = 24,
  read,
}: {
  readonly clipboard: FigJamClipboard
  readonly createId: (sourceId: DesignNodeId) => DesignNodeId
  readonly fallbackParentId: DesignNodeId | null
  readonly offset?: number
  readonly read: DesignDocumentRead
}): FigJamDocumentPlan | null {
  const sourceById = new Map(clipboard.nodes.map((node) => [node.id, node]))
  const idMap = new Map<DesignNodeId, DesignNodeId>()

  for (const source of clipboard.nodes) {
    idMap.set(source.id, createId(source.id))
  }

  if (new Set(idMap.values()).size !== idMap.size) {
    return null
  }

  const changes: DesignDocumentChange[] = []
  const rootIds = new Set(clipboard.roots)

  const appendClone = (
    sourceId: DesignNodeId,
    parentId: DesignNodeId | null,
    index: number,
  ): boolean => {
    const source = sourceById.get(sourceId)
    const nextId = idMap.get(sourceId)

    if (!source || !nextId) {
      return false
    }

    const isRoot = rootIds.has(sourceId)
    const nextLayout = isRoot
      ? offsetFigJamLayout(source.layout, offset)
      : source.layout
    const remappedNode = remapFigJamNodeReferences({
      ...source,
      id: nextId,
      children: [],
      component: source.component
        ? { ...source.component, instanceId: nextId }
        : null,
      layout: nextLayout,
    }, idMap)
    const node = isRoot && getFigJamNodeReferenceIds(source)
      .some((nodeId) => idMap.has(nodeId))
      ? translateFigJamNodeReferenceGeometry(remappedNode, offset, offset)
      : remappedNode

    changes.push({ type: 'add', index, node, parentId })

    return source.children.every((childId, childIndex) =>
      appendClone(childId, nextId, childIndex))
  }

  const rootsByParent = new Map<DesignNodeId | null, number>()

  for (const sourceRootId of clipboard.roots) {
    const sourceParentId = read.node(sourceRootId)
      ? readFigJamParentId(read, sourceRootId)
      : null
    const parentId = sourceParentId && read.node(sourceParentId)
      ? sourceParentId
      : fallbackParentId
    const siblings = parentId === null ? read.roots() : read.children(parentId)
    const added = rootsByParent.get(parentId) ?? 0

    if (!appendClone(sourceRootId, parentId, siblings.length + added)) {
      return null
    }

    rootsByParent.set(parentId, added + 1)
  }

  return {
    changes,
    selection: clipboard.roots.flatMap((nodeId) => {
      const nextId = idMap.get(nodeId)
      return nextId ? [nextId] : []
    }),
  }
}

export function planFigJamRemoveSelection(
  read: DesignDocumentRead,
  nodeIds: readonly DesignNodeId[],
): FigJamDocumentPlan {
  const selected = readTopmostSelection(read, nodeIds)
  const removingNodes: DesignNode[] = []
  const documentNodes: DesignNode[] = []

  for (const nodeId of selected) {
    visitSubtree(read, nodeId, removingNodes)
  }

  for (const root of read.roots()) {
    visitSubtree(read, root.id, documentNodes)
  }

  const removingNodeIds = removingNodes.map(({ id }) => id)

  return {
    changes: [
      ...planFigJamReferenceRepairs({
        nodes: documentNodes,
        read,
        removingNodeIds,
      }),
      ...selected.map((nodeId) => ({ type: 'remove' as const, nodeId })),
    ],
    selection: [],
  }
}

export function readTopmostSelection(
  read: DesignDocumentRead,
  nodeIds: readonly DesignNodeId[],
) {
  const unique = [...new Set(nodeIds)].filter((nodeId) =>
    read.node(nodeId) !== null)
  const selected = new Set(unique)

  return unique.filter((nodeId) =>
    !read.ancestry(nodeId).slice(0, -1).some(({ id }) => selected.has(id)))
}

function orderByPlacement(
  read: DesignDocumentRead,
  nodeIds: readonly DesignNodeId[],
) {
  return [...nodeIds].sort((left, right) =>
    readFigJamPlacementIndex(read, left) - readFigJamPlacementIndex(read, right))
}

function visitSubtree(
  read: DesignDocumentRead,
  nodeId: DesignNodeId,
  nodes: DesignNode[],
) {
  const node = read.node(nodeId)

  if (!node) {
    return
  }

  nodes.push(node)

  for (const child of read.children(nodeId)) {
    visitSubtree(read, child.id, nodes)
  }
}

function offsetFigJamLayout(
  layout: DesignNode['layout'],
  offset: number,
) {
  const x = typeof layout.x === 'number' ? layout.x + offset : layout.x
  const y = typeof layout.y === 'number' ? layout.y + offset : layout.y

  return { ...layout, x, y }
}

function createFigJamReparentValues(
  node: DesignNode,
  x: number,
  y: number,
) {
  const currentX = typeof node.layout.x === 'number' ? node.layout.x : x
  const currentY = typeof node.layout.y === 'number' ? node.layout.y : y
  const translated = translateFigJamNodeReferenceGeometry(
    node,
    x - currentX,
    y - currentY,
  )

  return {
    layout: { ...node.layout, x, y },
    ...(translated === node ? {} : { props: translated.props }),
  }
}
