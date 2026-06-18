import type { Point } from '../../../../entities'
import type { CanvasSceneAdapter } from '../../../../engine'
import {
  isCanvasStrokeDrawingItem,
  type CanvasStrokeDrawingItem,
} from '../../../../host'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'

const CANVAS_ERASER_RADIUS = 14
const CANVAS_ERASER_POINT_DISTANCE = 4

export type CanvasEraserStrokeHitTestStroke<
  TId extends string = string,
> = Readonly<{
  id: TId
  locked?: boolean
  points: readonly Point[]
  strokeWidth: number
  visible?: boolean
}>

export type CanvasEraserStrokeHitTestInput<
  TId extends string = string,
> = Readonly<{
  points: readonly Point[]
  radius?: number
  strokes: readonly CanvasEraserStrokeHitTestStroke<TId>[]
  targetStrokeId?: TId
}>

export type CanvasNextEraserPointsInput = Readonly<{
  currentWorld: Point
  pointDistance?: number
  points: readonly Point[]
}>

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

  return getCanvasEraserHitStrokeIds({
    points,
    radius,
    strokes: itemReadModel
      .getAllItems()
      .flatMap((item) =>
        sceneIds.has(item.id) && isCanvasStrokeDrawingItem(item)
          ? [toCanvasEraserStrokeHitTestStroke(item)]
          : []),
    targetStrokeId: targetItemId,
  })
}

export function getCanvasMergedEraserHitIds<TId extends string = string>(
  left: readonly TId[],
  right: readonly TId[],
) {
  return Array.from(new Set([...left, ...right]))
}

export function getCanvasEraserHitStrokeIds<TId extends string = string>({
  points,
  radius = CANVAS_ERASER_RADIUS,
  strokes,
  targetStrokeId,
}: CanvasEraserStrokeHitTestInput<TId>): TId[] {
  const hitTestableStrokes = strokes.filter(isCanvasEraserStrokeHitTestable)
  const targetIds: TId[] = targetStrokeId &&
    hitTestableStrokes.some((stroke) => stroke.id === targetStrokeId)
    ? [targetStrokeId]
    : []
  const hitIds = hitTestableStrokes.flatMap((stroke) =>
    isCanvasEraserHittingStroke({
      points,
      radius,
      stroke,
    })
      ? [stroke.id]
      : [])

  return getCanvasMergedEraserHitIds(targetIds, hitIds)
}

export function getNextCanvasEraserPoints({
  currentWorld,
  pointDistance = CANVAS_ERASER_POINT_DISTANCE,
  points,
}: CanvasNextEraserPointsInput): Point[] {
  const lastPoint = points[points.length - 1]

  if (!lastPoint) {
    return [currentWorld]
  }

  const distance = getCanvasPointDistance(lastPoint, currentWorld)

  if (distance < pointDistance) {
    return [...points]
  }

  const nextPoints = [...points]

  for (
    let offset = pointDistance;
    offset < distance;
    offset += pointDistance
  ) {
    const ratio = offset / distance

    nextPoints.push({
      x: lastPoint.x + (currentWorld.x - lastPoint.x) * ratio,
      y: lastPoint.y + (currentWorld.y - lastPoint.y) * ratio,
    })
  }

  nextPoints.push(currentWorld)

  return nextPoints
}

function isCanvasEraserHittingStroke({
  stroke,
  points,
  radius,
}: {
  points: readonly Point[]
  radius: number
  stroke: CanvasEraserStrokeHitTestStroke
}) {
  return points.some((point) =>
    isCanvasPointNearStroke({
      point,
      radius: radius + stroke.strokeWidth / 2,
      strokePoints: stroke.points,
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
  strokePoints: readonly Point[]
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

function isCanvasEraserStrokeHitTestable<TId extends string>(
  stroke: CanvasEraserStrokeHitTestStroke<TId>,
) {
  return stroke.visible !== false && stroke.locked !== true
}

function toCanvasEraserStrokeHitTestStroke(
  item: CanvasStrokeDrawingItem,
): CanvasEraserStrokeHitTestStroke {
  return {
    id: item.id,
    locked: item.locked,
    points: item.points,
    strokeWidth: item.strokeWidth,
  }
}
