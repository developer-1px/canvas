import type {
  DesignDocumentChange,
  DesignDocumentRead,
  DesignNode,
  DesignNodeId,
} from '@interactive-os/canvas/react-design'

import {
  FIGJAM_COMMENT_DEFINITION_ID,
  parseFigJamCommentProps,
} from './FigJamCommentDefinition'
import {
  FIGJAM_CONNECTOR_DEFINITION_ID,
  parseFigJamConnectorProps,
} from './FigJamConnectorDefinition'
import {
  getFigJamNodeAnchorPoint,
  getFigJamNodeWorldBounds,
} from './FigJamNodeGeometry'
import {
  cloneDesignProps,
  isFiniteNumber,
  isPositiveFiniteNumber,
} from './FigJamWidgetPrimitives'

export function getFigJamNodeReferenceIds(node: DesignNode) {
  const refs = readFigJamNodeReferences(node)
  return refs ? [...new Set(refs.ids)] : []
}

export function remapFigJamNodeReferences(
  node: DesignNode,
  idMap: ReadonlyMap<DesignNodeId, DesignNodeId>,
) {
  const refs = readFigJamNodeReferences(node)

  if (!refs) {
    return node
  }

  return refs.update((nodeId) => nodeId ? idMap.get(nodeId) ?? nodeId : null)
}

/**
 * Keeps reference-owned local geometry aligned when a cloned node and its
 * remapped target receive the same root translation.
 */
export function translateFigJamNodeReferenceGeometry(
  node: DesignNode,
  dx: number,
  dy: number,
) {
  if (
    !isFiniteNumber(dx) ||
    !isFiniteNumber(dy) ||
    node.definition.kind !== 'widget' ||
    node.definition.id !== FIGJAM_COMMENT_DEFINITION_ID
  ) {
    return node
  }

  const parsed = parseFigJamCommentProps(node.props)

  if (
    !parsed.ok ||
    !parsed.value.attachedNodeId ||
    (dx === 0 && dy === 0)
  ) {
    return node
  }

  return {
    ...node,
    props: cloneDesignProps({
      ...parsed.value,
      attachmentOrigin: {
        x: parsed.value.attachmentOrigin.x + dx,
        y: parsed.value.attachmentOrigin.y + dy,
      },
    }),
  }
}

export function detachFigJamNodeReferences(
  node: DesignNode,
  removingNodeIds: ReadonlySet<DesignNodeId>,
  read: DesignDocumentRead,
) {
  const removing = expandRemovingNodeIds(read, removingNodeIds)
  const refs = readFigJamNodeReferences(node)

  if (!refs || !refs.ids.some((nodeId) => removing.has(nodeId))) {
    return node
  }

  const materialized = materializeFigJamReferenceFallback(
    node,
    read,
    removing,
  )
  const materializedRefs = readFigJamNodeReferences(materialized)

  return materializedRefs?.update((nodeId) =>
    nodeId && removing.has(nodeId) ? null : nodeId)
    ?? materialized
}

export function planFigJamReferenceRepairs({
  nodes,
  read,
  removingNodeIds,
}: {
  readonly nodes: readonly DesignNode[]
  readonly read: DesignDocumentRead
  readonly removingNodeIds: readonly DesignNodeId[]
}): readonly DesignDocumentChange[] {
  const removing = expandRemovingNodeIds(read, new Set(removingNodeIds))
  const changes: DesignDocumentChange[] = []

  for (const node of nodes) {
    if (removing.has(node.id)) {
      continue
    }

    const refs = readFigJamNodeReferences(node)

    if (!refs || !refs.ids.some((nodeId) => removing.has(nodeId))) {
      continue
    }

    const repaired = detachFigJamNodeReferences(node, removing, read)

    if (repaired !== node) {
      const values = {
        props: repaired.props,
        ...(repaired.layout === node.layout
          ? {} : { layout: repaired.layout }),
      }

      changes.push({
        type: 'update',
        nodeId: node.id,
        values,
      })
    }
  }

  return changes
}

function expandRemovingNodeIds(
  read: DesignDocumentRead,
  rootIds: ReadonlySet<DesignNodeId>,
) {
  const removing = new Set<DesignNodeId>()

  const visit = (nodeId: DesignNodeId) => {
    if (removing.has(nodeId) || !read.node(nodeId)) {
      return
    }

    removing.add(nodeId)

    for (const child of read.children(nodeId)) {
      visit(child.id)
    }
  }

  for (const nodeId of rootIds) {
    visit(nodeId)
  }

  return removing
}

export function materializeFigJamConnectorFallback(
  node: DesignNode,
  read: DesignDocumentRead,
) {
  return materializeFigJamConnectorFallbackForTargets(node, read)
}

export function materializeFigJamCommentFallback(
  node: DesignNode,
  read: DesignDocumentRead,
) {
  return materializeFigJamCommentFallbackForTargets(node, read)
}

function materializeFigJamReferenceFallback(
  node: DesignNode,
  read: DesignDocumentRead,
  targetNodeIds: ReadonlySet<DesignNodeId>,
) {
  const connector = materializeFigJamConnectorFallbackForTargets(
    node,
    read,
    targetNodeIds,
  )

  return connector === node
    ? materializeFigJamCommentFallbackForTargets(node, read, targetNodeIds)
    : connector
}

function materializeFigJamConnectorFallbackForTargets(
  node: DesignNode,
  read: DesignDocumentRead,
  targetNodeIds?: ReadonlySet<DesignNodeId>,
) {
  if (
    node.definition.kind !== 'widget' ||
    node.definition.id !== FIGJAM_CONNECTOR_DEFINITION_ID
  ) {
    return node
  }

  const parsed = parseFigJamConnectorProps(node.props)
  const connectorBounds = getFigJamNodeWorldBounds(read, node.id)

  if (!parsed.ok || !connectorBounds) {
    return node
  }

  let changed = false
  const width = isPositiveFiniteNumber(node.layout.w)
    ? node.layout.w
    : parsed.value.coordinateWidth
  const height = isPositiveFiniteNumber(node.layout.h)
    ? node.layout.h
    : parsed.value.coordinateHeight
  const materialize = (endpoint: typeof parsed.value.start) => {
    if (
      !endpoint.attachedNodeId ||
      targetNodeIds && !targetNodeIds.has(endpoint.attachedNodeId)
    ) {
      return endpoint
    }

    const targetBounds = getFigJamNodeWorldBounds(read, endpoint.attachedNodeId)

    if (!targetBounds) {
      return endpoint
    }

    const point = getFigJamNodeAnchorPoint(targetBounds, endpoint.anchor)
    changed = true

    return {
      ...endpoint,
      point: {
        x: (point.x - connectorBounds.x) *
          parsed.value.coordinateWidth / width,
        y: (point.y - connectorBounds.y) *
          parsed.value.coordinateHeight / height,
      },
    }
  }
  const props = {
    ...parsed.value,
    start: materialize(parsed.value.start),
    end: materialize(parsed.value.end),
  }

  return changed ? { ...node, props: cloneDesignProps(props) } : node
}

function materializeFigJamCommentFallbackForTargets(
  node: DesignNode,
  read: DesignDocumentRead,
  targetNodeIds?: ReadonlySet<DesignNodeId>,
) {
  if (
    node.definition.kind !== 'widget' ||
    node.definition.id !== FIGJAM_COMMENT_DEFINITION_ID
  ) {
    return node
  }

  const parsed = parseFigJamCommentProps(node.props)

  if (
    !parsed.ok ||
    !parsed.value.attachedNodeId ||
    targetNodeIds && !targetNodeIds.has(parsed.value.attachedNodeId)
  ) {
    return node
  }

  const commentBounds = getFigJamNodeWorldBounds(read, node.id)
  const targetBounds = getFigJamNodeWorldBounds(
    read,
    parsed.value.attachedNodeId,
  )

  if (!commentBounds || !targetBounds) {
    return node
  }

  const localX = typeof node.layout.x === 'number' ? node.layout.x : 0
  const localY = typeof node.layout.y === 'number' ? node.layout.y : 0
  const parentX = commentBounds.x - localX
  const parentY = commentBounds.y - localY

  return {
    ...node,
    layout: {
      ...node.layout,
      x: targetBounds.x + targetBounds.width - parentX +
        parsed.value.attachmentOffset.x +
        localX - parsed.value.attachmentOrigin.x,
      y: targetBounds.y - parentY + parsed.value.attachmentOffset.y +
        localY - parsed.value.attachmentOrigin.y,
    },
  }
}

function readFigJamNodeReferences(node: DesignNode): {
  readonly ids: readonly DesignNodeId[]
  update(map: (nodeId: DesignNodeId | null) => DesignNodeId | null): DesignNode
} | null {
  if (
    node.definition.kind === 'widget' &&
    node.definition.id === FIGJAM_CONNECTOR_DEFINITION_ID
  ) {
    const parsed = parseFigJamConnectorProps(node.props)

    if (!parsed.ok) {
      return null
    }

    return {
      ids: [
        parsed.value.start.attachedNodeId,
        parsed.value.end.attachedNodeId,
      ].filter((id): id is string => id !== null),
      update: (map) => ({
        ...node,
        props: cloneDesignProps({
          ...parsed.value,
          start: {
            ...parsed.value.start,
            attachedNodeId: map(parsed.value.start.attachedNodeId),
          },
          end: {
            ...parsed.value.end,
            attachedNodeId: map(parsed.value.end.attachedNodeId),
          },
        }),
      }),
    }
  }

  if (
    node.definition.kind === 'widget' &&
    node.definition.id === FIGJAM_COMMENT_DEFINITION_ID
  ) {
    const parsed = parseFigJamCommentProps(node.props)

    if (!parsed.ok) {
      return null
    }

    return {
      ids: parsed.value.attachedNodeId
        ? [parsed.value.attachedNodeId]
        : [],
      update: (map) => ({
        ...node,
        props: cloneDesignProps({
          ...parsed.value,
          attachedNodeId: map(parsed.value.attachedNodeId),
        }),
      }),
    }
  }

  return null
}
