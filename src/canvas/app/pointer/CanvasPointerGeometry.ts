import type {
  Point,
  Viewport
} from '../../core'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'

export function screenPoint(
  stageElement: CanvasAppStageElement,
  event: { clientX: number; clientY: number },
) {
  return stageElement.getScreenPoint(event)
}

export function screenToWorld(point: Point, viewport: Viewport) {
  return {
    x: (point.x - viewport.x) / viewport.scale,
    y: (point.y - viewport.y) / viewport.scale,
  }
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
