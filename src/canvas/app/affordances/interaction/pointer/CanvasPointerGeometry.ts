import type {
  Point,
  Viewport
} from '../../../../core'
import {
  getCanvasViewportWorldPoint,
} from '../../../../core'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'

export function screenPoint(
  stageElement: CanvasAppStageElement,
  event: { clientX: number; clientY: number },
) {
  return stageElement.getScreenPoint(event)
}

export function screenToWorld(point: Point, viewport: Viewport) {
  return getCanvasViewportWorldPoint(viewport, point)
}

export function capturePointer(
  stageElement: CanvasAppStageElement,
  pointerId: number,
) {
  stageElement.capturePointer(pointerId)
}

export function releasePointer(
  stageElement: CanvasAppStageElement,
  pointerId: number,
) {
  stageElement.releasePointer(pointerId)
}
