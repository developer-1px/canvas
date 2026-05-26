import type { Point } from '../../../entities'
import type { CanvasSceneAdapter } from '../../../engine'
import {
  isCanvasStrokeDrawingItem,
  type CanvasStrokeDrawingItem,
} from '../../../host'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'

const CANVAS_ERASER_RADIUS = 14

export function getCanvasEraserHitItemIds({
  itemReadModel,
  points,
  radius = CANVAS_ERASER_RADIUS,
  scene,
  targetItemId,
}: {
  itemReadModel: CanvasAppItemReadModel
  points: Point[]
  radius?: number
  scene: CanvasSceneAdapter
  targetItemId?: string
}) {
  const sceneIds = new Set(scene.entries.map((entry) => entry.id))
  const targetItem = targetItemId ? itemReadModel.findItem(targetItemId) : null
  const targetIds =
    targetItem &&
    sceneIds.has(targetItem.id) &&
    isCanvasStrokeDrawingItem(targetItem)
      ? [targetItem.id]
      : []

  return getCanvasMergedEraserHitIds(
    targetIds,
    itemReadModel
      .getAllItems()
      .filter(
        (item): item is CanvasStrokeDrawingItem =>
          sceneIds.has(item.id) && isCanvasStrokeDrawingItem(item),
      )
      .flatMap((item) =>
        isCanvasEraserHittingStroke({
          item,
          points,
          radius,
        })
          ? [item.id]
          : [],
      ),
  )
}

export function getCanvasMergedEraserHitIds(
  left: readonly string[],
  right: readonly string[],
) {
  return Array.from(new Set([...left, ...right]))
}

function isCanvasEraserHittingStroke({
  item,
  points,
  radius,
}: {
  item: CanvasStrokeDrawingItem
  points: Point[]
  radius: number
}) {
  return points.some((point) =>
    isCanvasPointNearStroke({
      point,
      radius: radius + item.strokeWidth / 2,
      strokePoints: item.points,
    }),
  )
}

function isCanvasPointNearStroke({
  point,
  radius,
  strokePoints,
}: {
  point: Point
  radius: number
  strokePoints: Point[]
}) {
  const [first, second, ...rest] = strokePoints

  if (!first) {
    return false
  }

  if (!second) {
    return getCanvasPointDistance(point, first) <= radius
  }

  return [second, ...rest].some((end, index) => {
    const start = strokePoints[index]

    return getCanvasPointToSegmentDistance(point, start, end) <= radius
  })
}

function getCanvasPointToSegmentDistance(
  point: Point,
  start: Point,
  end: Point,
) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return getCanvasPointDistance(point, start)
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
    ),
  )

  return getCanvasPointDistance(point, {
    x: start.x + t * dx,
    y: start.y + t * dy,
  })
}

function getCanvasPointDistance(left: Point, right: Point) {
  return Math.hypot(left.x - right.x, left.y - right.y)
}
