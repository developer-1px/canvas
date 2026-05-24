import type {
  Point,
} from '../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasAffordanceConfig,
  type CanvasPointerGesture,
  type CanvasSceneAdapter,
} from '../../engine'
import {
  isCanvasStrokeDrawingItem,
  type CanvasStrokeDrawingItem,
} from '../../host'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

const CANVAS_ERASER_RADIUS = 14
const CANVAS_ERASER_POINT_DISTANCE = 4

export type CanvasPointerEraserInteraction = Extract<
  Interaction,
  { kind: 'erase' }
>

export type CanvasPointerEraserStartResult =
  | null
  | { kind: 'none' }
  | {
      capturePointer: true
      gesture: 'erase'
      interaction: CanvasPointerEraserInteraction
      kind: 'interaction'
    }

export type CanvasPointerEraserPreviewResult =
  | { kind: 'none' }
  | {
      interaction: CanvasPointerEraserInteraction
      kind: 'preview'
      snapGuides: typeof EMPTY_CANVAS_SNAP_GUIDES
    }

export function isCanvasPointerEraserGesture(
  gesture: CanvasPointerGesture,
): gesture is 'erase' {
  return gesture === 'erase'
}

export function isCanvasPointerEraserInteraction(
  interaction: Interaction,
): interaction is CanvasPointerEraserInteraction {
  return interaction.kind === 'erase'
}

export function startCanvasPointerEraserInteraction({
  config,
  input,
  itemReadModel,
  pointerGesture,
  scene,
  startScreen,
  startWorld,
  targetItemId,
}: {
  config: CanvasAffordanceConfig
  input: CanvasAppPointerInput
  itemReadModel: CanvasAppItemReadModel
  pointerGesture: CanvasPointerGesture
  scene: CanvasSceneAdapter
  startScreen: Point
  startWorld: Point
  targetItemId?: string
}): CanvasPointerEraserStartResult {
  if (!isCanvasPointerEraserGesture(pointerGesture)) {
    return null
  }

  if (!config.gestures.eraseDrawing) {
    return { kind: 'none' }
  }

  const points = [startWorld]
  const erasedIds = getCanvasEraserHitItemIds({
    itemReadModel,
    points,
    scene,
    targetItemId,
  })

  return {
    capturePointer: true,
    gesture: 'erase',
    interaction: {
      currentWorld: startWorld,
      erasedIds,
      kind: 'erase',
      moved: false,
      pointerId: input.pointerId,
      points,
      startScreen,
      startWorld,
    },
    kind: 'interaction',
  }
}

export function previewCanvasPointerEraserInteraction({
  config,
  currentScreen,
  currentWorld,
  interaction,
  itemReadModel,
  scene,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  interaction: Interaction
  itemReadModel: CanvasAppItemReadModel
  scene: CanvasSceneAdapter
}): CanvasPointerEraserPreviewResult | null {
  if (!isCanvasPointerEraserInteraction(interaction)) {
    return null
  }

  if (!config.gestures.eraseDrawing) {
    return { kind: 'none' }
  }

  const moved = hasCanvasInteractionMoved({
    currentScreen,
    interaction,
  })
  const points = getNextCanvasEraserPoints({
    currentWorld,
    points: interaction.points,
  })
  const erasedIds = getCanvasMergedEraserHitIds(
    interaction.erasedIds,
    getCanvasEraserHitItemIds({
      itemReadModel,
      points,
      scene,
    }),
  )

  return {
    interaction: {
      ...interaction,
      currentWorld,
      erasedIds,
      moved,
      points,
    },
    kind: 'preview',
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

export function commitCanvasPointerEraserInteraction({
  commitItemsChange,
  interaction,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  interaction: CanvasPointerEraserInteraction
  selection: string[]
}) {
  if (interaction.erasedIds.length === 0) {
    return
  }

  const erased = new Set(interaction.erasedIds)

  commitItemsChange(
    {
      selection: interaction.erasedIds,
      type: 'remove-selection',
    },
    {
      before: selection,
      after: selection.filter((id) => !erased.has(id)),
    },
  )
}

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

function getNextCanvasEraserPoints({
  currentWorld,
  points,
}: {
  currentWorld: Point
  points: Point[]
}) {
  const lastPoint = points[points.length - 1]

  if (!lastPoint) {
    return [currentWorld]
  }

  const distance = getCanvasPointDistance(lastPoint, currentWorld)

  if (distance < CANVAS_ERASER_POINT_DISTANCE) {
    return points
  }

  const nextPoints = [...points]

  for (
    let offset = CANVAS_ERASER_POINT_DISTANCE;
    offset < distance;
    offset += CANVAS_ERASER_POINT_DISTANCE
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

function getCanvasMergedEraserHitIds(
  left: readonly string[],
  right: readonly string[],
) {
  return Array.from(new Set([...left, ...right]))
}
