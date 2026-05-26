import { pointDistance } from '../../../core'
import type { Point } from '../../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasAffordanceConfig,
  type CanvasLaserTrailOverlay,
  type CanvasPointerGesture,
} from '../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

const CANVAS_LASER_POINT_DISTANCE = 3
const CANVAS_LASER_TRAIL_MAX_POINTS = 80

export type CanvasPointerLaserInteraction = Extract<
  Interaction,
  { kind: 'laser' }
>

export type CanvasPointerLaserStartResult =
  | null
  | { kind: 'none' }
  | {
      capturePointer: true
      gesture: 'laser'
      interaction: CanvasPointerLaserInteraction
      kind: 'interaction'
      laserTrail: CanvasLaserTrailOverlay
    }

export type CanvasPointerLaserPreviewResult =
  | { kind: 'none' }
  | {
      interaction: CanvasPointerLaserInteraction
      kind: 'preview'
      laserTrail: CanvasLaserTrailOverlay
      snapGuides: typeof EMPTY_CANVAS_SNAP_GUIDES
    }

export function isCanvasPointerLaserGesture(
  gesture: CanvasPointerGesture,
): gesture is 'laser' {
  return gesture === 'laser'
}

export function isCanvasPointerLaserInteraction(
  interaction: Interaction,
): interaction is CanvasPointerLaserInteraction {
  return interaction.kind === 'laser'
}

export function startCanvasPointerLaserInteraction({
  config,
  input,
  pointerGesture,
  startScreen,
  startWorld,
}: {
  config: CanvasAffordanceConfig
  input: CanvasAppPointerInput
  pointerGesture: CanvasPointerGesture
  startScreen: Point
  startWorld: Point
}): CanvasPointerLaserStartResult {
  if (!isCanvasPointerLaserGesture(pointerGesture)) {
    return null
  }

  if (!config.gestures.laserPointer) {
    return { kind: 'none' }
  }

  const points = [startWorld]
  const laserTrail = createCanvasLaserTrailOverlay(points)

  return {
    capturePointer: true,
    gesture: 'laser',
    interaction: {
      currentWorld: startWorld,
      kind: 'laser',
      moved: false,
      pointerId: input.pointerId,
      points,
      startScreen,
      startWorld,
    },
    kind: 'interaction',
    laserTrail,
  }
}

export function previewCanvasPointerLaserInteraction({
  config,
  currentScreen,
  currentWorld,
  interaction,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  interaction: Interaction
}): CanvasPointerLaserPreviewResult | null {
  if (!isCanvasPointerLaserInteraction(interaction)) {
    return null
  }

  if (!config.gestures.laserPointer) {
    return { kind: 'none' }
  }

  const moved = hasCanvasInteractionMoved({
    currentScreen,
    interaction,
  })
  const points = getNextCanvasLaserTrailPoints({
    currentWorld,
    points: interaction.points,
  })

  return {
    interaction: {
      ...interaction,
      currentWorld,
      moved,
      points,
    },
    kind: 'preview',
    laserTrail: createCanvasLaserTrailOverlay(points),
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

function createCanvasLaserTrailOverlay(
  points: Point[],
): CanvasLaserTrailOverlay {
  return {
    points,
  }
}

function getNextCanvasLaserTrailPoints({
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

  if (pointDistance(lastPoint, currentWorld) < CANVAS_LASER_POINT_DISTANCE) {
    return points
  }

  return [...points, currentWorld].slice(-CANVAS_LASER_TRAIL_MAX_POINTS)
}
