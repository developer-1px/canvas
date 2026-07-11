import type {
  DesignDocumentChange,
  DesignDocumentRead,
  DesignNode,
  DesignNodeId,
} from '@interactive-os/canvas/react-design'
import {
  FIGJAM_DRAWING_DEFINITION_ID,
  parseFigJamDrawingProps,
} from '@interactive-os/figjam-pack'

import {
  intersectsFigJamBounds,
  readFigJamNodeWorldBounds,
  type FigJamDocumentBounds,
} from './FigJamDocumentGeometry'

export type FigJamWorldPoint = {
  readonly x: number
  readonly y: number
}

export type FigJamDrawingPlacement = FigJamDocumentBounds & {
  readonly points: readonly FigJamWorldPoint[]
}

export function updateFigJamSelection({
  additive,
  current,
  nodeId,
}: {
  readonly additive: boolean
  readonly current: readonly DesignNodeId[]
  readonly nodeId: DesignNodeId
}) {
  if (!additive) {
    return [nodeId]
  }

  const next = current.filter((currentId) => currentId !== nodeId)

  return next.length === current.length ? [...current, nodeId] : next
}

export function createFigJamMarqueeBounds(
  start: FigJamWorldPoint,
  end: FigJamWorldPoint,
): FigJamDocumentBounds {
  return {
    h: Math.abs(end.y - start.y),
    w: Math.abs(end.x - start.x),
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
  }
}

export function readFigJamMarqueeSelection({
  excludedNodeIds,
  marquee,
  read,
}: {
  readonly excludedNodeIds: ReadonlySet<DesignNodeId>
  readonly marquee: FigJamDocumentBounds
  readonly read: DesignDocumentRead
}) {
  return read.roots().flatMap((root) => readFigJamSubtreeIds(read, root.id))
    .filter((nodeId) => !excludedNodeIds.has(nodeId))
    .filter((nodeId) => {
      const bounds = readFigJamNodeWorldBounds(read, nodeId)
      const node = read.node(nodeId)

      if (!bounds || !node) {
        return false
      }

      return node.definition.kind === 'component'
        ? containsFigJamBounds(marquee, bounds)
        : intersectsFigJamBounds(bounds, marquee)
    })
    .filter((nodeId, _index, selected) => {
      const selectedIds = new Set(selected)

      return !read.ancestry(nodeId).slice(0, -1)
        .some(({ id }) => selectedIds.has(id))
    })
}

function containsFigJamBounds(
  outer: FigJamDocumentBounds,
  inner: FigJamDocumentBounds,
) {
  return inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
}

export function localizeFigJamDrawing(
  points: readonly FigJamWorldPoint[],
): FigJamDrawingPlacement | null {
  const finitePoints = points.filter(({ x, y }) =>
    Number.isFinite(x) && Number.isFinite(y))

  if (finitePoints.length < 2) {
    return null
  }

  const x = Math.min(...finitePoints.map((point) => point.x))
  const y = Math.min(...finitePoints.map((point) => point.y))
  const maxX = Math.max(...finitePoints.map((point) => point.x))
  const maxY = Math.max(...finitePoints.map((point) => point.y))

  return {
    h: Math.max(1, maxY - y),
    w: Math.max(1, maxX - x),
    x,
    y,
    points: finitePoints.map((point) => ({
      x: point.x - x,
      y: point.y - y,
    })),
  }
}

export function planFigJamNudgeSelection({
  delta,
  nodeIds,
  read,
}: {
  readonly delta: FigJamWorldPoint
  readonly nodeIds: readonly DesignNodeId[]
  readonly read: DesignDocumentRead
}): readonly DesignDocumentChange[] {
  if (!Number.isFinite(delta.x) || !Number.isFinite(delta.y)) {
    return []
  }

  return nodeIds.flatMap((nodeId) => {
    const node = read.node(nodeId)
    const x = node?.layout.x
    const y = node?.layout.y

    if (
      !node ||
      typeof x !== 'number' ||
      !Number.isFinite(x) ||
      typeof y !== 'number' ||
      !Number.isFinite(y)
    ) {
      return []
    }

    return [{
      type: 'update' as const,
      nodeId,
      values: {
        layout: {
          ...node.layout,
          x: x + delta.x,
          y: y + delta.y,
        },
      },
    }]
  })
}

export function readFigJamSelectableHit(
  hitPath: readonly DesignNodeId[],
  excludedNodeIds: ReadonlySet<DesignNodeId>,
) {
  return hitPath.find((nodeId) => !excludedNodeIds.has(nodeId)) ?? null
}

export function isFigJamErasableDrawing(
  node: DesignNode | null | undefined,
) {
  if (
    !node ||
    node.definition.kind !== 'widget' ||
    node.definition.id !== FIGJAM_DRAWING_DEFINITION_ID
  ) {
    return false
  }

  const parsed = parseFigJamDrawingProps(node.props)

  return parsed.ok && (
    parsed.value.variant === 'marker' ||
    parsed.value.variant === 'highlight'
  )
}

function readFigJamSubtreeIds(
  read: DesignDocumentRead,
  nodeId: DesignNodeId,
): readonly DesignNodeId[] {
  return [
    nodeId,
    ...read.children(nodeId).flatMap((child) =>
      readFigJamSubtreeIds(read, child.id)),
  ]
}
