import type {
  Bounds,
  Point,
} from '../../../entities'
import {
  clamp,
} from '../../../core'
import type {
  CanvasMinimapReadModel,
} from './CanvasMinimapContracts'

const CANVAS_MINIMAP_KEYBOARD_STEP_RATIO = 0.5

export type CanvasMinimapKeyboardNavigationIntentInput = {
  key: string
  model: CanvasMinimapReadModel
  stepRatio?: number
}

export type CanvasMinimapKeyboardNavigationIntent =
  | {
      kind: 'navigate'
      preventDefault: true
      stopPropagation: true
      worldPoint: Point
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }

export type CanvasMinimapKeyboardNavigationEvent = {
  key: string
  preventDefault: () => void
  stopPropagation: () => void
}

export type RunCanvasMinimapKeyboardNavigationIntentInput = {
  event: CanvasMinimapKeyboardNavigationEvent
  model: CanvasMinimapReadModel
  onNavigateToWorldPoint: (point: Point) => void
  stepRatio?: number
}

export function getCanvasMinimapKeyboardNavigationIntent({
  key,
  model,
  stepRatio = CANVAS_MINIMAP_KEYBOARD_STEP_RATIO,
}: CanvasMinimapKeyboardNavigationIntentInput):
  CanvasMinimapKeyboardNavigationIntent {
  const currentCenter = getCanvasMinimapViewportWorldCenter(model)
  const stepX = model.viewportWorldBounds.w * stepRatio
  const stepY = model.viewportWorldBounds.h * stepRatio
  let worldPoint: Point | null = null

  if (key === 'ArrowRight') {
    worldPoint = { x: currentCenter.x + stepX, y: currentCenter.y }
  } else if (key === 'ArrowLeft') {
    worldPoint = { x: currentCenter.x - stepX, y: currentCenter.y }
  } else if (key === 'ArrowDown') {
    worldPoint = { x: currentCenter.x, y: currentCenter.y + stepY }
  } else if (key === 'ArrowUp') {
    worldPoint = { x: currentCenter.x, y: currentCenter.y - stepY }
  } else if (key === 'Home') {
    worldPoint = { x: model.worldBounds.x, y: model.worldBounds.y }
  } else if (key === 'End') {
    worldPoint = {
      x: model.worldBounds.x + model.worldBounds.w,
      y: model.worldBounds.y + model.worldBounds.h,
    }
  }

  if (!worldPoint) {
    return {
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    }
  }

  return {
    kind: 'navigate',
    preventDefault: true,
    stopPropagation: true,
    worldPoint: clampCanvasMinimapWorldPoint({
      point: worldPoint,
      worldBounds: model.worldBounds,
    }),
  }
}

export function runCanvasMinimapKeyboardNavigationIntent({
  event,
  model,
  onNavigateToWorldPoint,
  stepRatio,
}: RunCanvasMinimapKeyboardNavigationIntentInput) {
  const intent = getCanvasMinimapKeyboardNavigationIntent({
    key: event.key,
    model,
    stepRatio,
  })

  if (intent.kind === 'none') {
    return false
  }

  if (intent.preventDefault) {
    event.preventDefault()
  }
  if (intent.stopPropagation) {
    event.stopPropagation()
  }

  onNavigateToWorldPoint(intent.worldPoint)
  return true
}

function getCanvasMinimapViewportWorldCenter(
  model: CanvasMinimapReadModel,
): Point {
  return {
    x: model.viewportWorldBounds.x + model.viewportWorldBounds.w / 2,
    y: model.viewportWorldBounds.y + model.viewportWorldBounds.h / 2,
  }
}

function clampCanvasMinimapWorldPoint({
  point,
  worldBounds,
}: {
  point: Point
  worldBounds: Bounds
}): Point {
  return {
    x: clamp(point.x, worldBounds.x, worldBounds.x + worldBounds.w),
    y: clamp(point.y, worldBounds.y, worldBounds.y + worldBounds.h),
  }
}
