import type {
  DesignDocumentRead,
  DesignNode,
  DesignNodeId,
} from '@interactive-os/canvas/react-design'
import {
  getFigJamResolvedCommentBounds,
  getFigJamResolvedConnectorBounds,
} from '@interactive-os/figjam-pack'

export type FigJamDocumentBounds = {
  readonly h: number
  readonly w: number
  readonly x: number
  readonly y: number
}

export function readFigJamNodeWorldBounds(
  read: DesignDocumentRead,
  nodeId: DesignNodeId,
): FigJamDocumentBounds | null {
  const connectorBounds = getFigJamResolvedConnectorBounds(read, nodeId)

  if (connectorBounds) {
    return connectorBounds
  }

  const commentBounds = getFigJamResolvedCommentBounds(read, nodeId)

  if (commentBounds) {
    return commentBounds
  }

  const node = read.node(nodeId)

  if (!node) {
    return null
  }

  const origin = readFigJamNodeWorldOrigin(read, nodeId)
  const local = readFigJamNodeLocalBounds(node)

  return origin && local
    ? { ...origin, h: local.h, w: local.w }
    : null
}

export function readFigJamNodeWorldOrigin(
  read: DesignDocumentRead,
  nodeId: DesignNodeId,
) {
  const ancestry = read.ancestry(nodeId)

  if (ancestry.length === 0) {
    return null
  }

  return ancestry.reduce((point, node) => {
    const local = readFigJamNodeLocalBounds(node)

    return local
      ? { x: point.x + local.x, y: point.y + local.y }
      : point
  }, { x: 0, y: 0 })
}

export function readFigJamParentId(
  read: DesignDocumentRead,
  nodeId: DesignNodeId,
): DesignNodeId | null {
  return read.ancestry(nodeId).at(-2)?.id ?? null
}

export function readFigJamPlacementIndex(
  read: DesignDocumentRead,
  nodeId: DesignNodeId,
) {
  const parentId = readFigJamParentId(read, nodeId)
  const siblings = parentId === null ? read.roots() : read.children(parentId)

  return siblings.findIndex((node) => node.id === nodeId)
}

export function readFigJamNodeLocalBounds(
  node: DesignNode,
): FigJamDocumentBounds | null {
  if (node.frame) {
    return {
      h: node.frame.height,
      w: node.frame.width,
      x: node.frame.x,
      y: node.frame.y,
    }
  }

  const x = readFiniteNumber(node.layout.x)
  const y = readFiniteNumber(node.layout.y)
  const w = readFiniteNumber(node.layout.w)
  const h = readFiniteNumber(node.layout.h)

  return x === null || y === null || w === null || h === null
    ? null
    : { h, w, x, y }
}

export function unionFigJamBounds(
  bounds: readonly FigJamDocumentBounds[],
): FigJamDocumentBounds | null {
  if (bounds.length === 0) {
    return null
  }

  const minX = Math.min(...bounds.map(({ x }) => x))
  const minY = Math.min(...bounds.map(({ y }) => y))
  const maxX = Math.max(...bounds.map(({ w, x }) => x + w))
  const maxY = Math.max(...bounds.map(({ h, y }) => y + h))

  return { h: maxY - minY, w: maxX - minX, x: minX, y: minY }
}

export function intersectsFigJamBounds(
  left: FigJamDocumentBounds,
  right: FigJamDocumentBounds,
) {
  return left.x < right.x + right.w &&
    left.x + left.w > right.x &&
    left.y < right.y + right.h &&
    left.y + left.h > right.y
}

function readFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}
