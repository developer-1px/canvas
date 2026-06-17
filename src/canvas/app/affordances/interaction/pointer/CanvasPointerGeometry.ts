import type {
  Point,
  Viewport,
} from '../../../../core'
import {
  getCanvasViewportWorldPoint,
} from '../../../../core'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'

export type CanvasPointerClientPosition = {
  clientX: number
  clientY: number
}

export type CanvasPointerLocalTarget = {
  getBoundingClientRect?: () => {
    height: number
    left: number
    top: number
    width: number
  }
}

export type CanvasPointerLocalRect = {
  height: number
  left: number
  top: number
  width: number
}

export type CanvasPointerLocalGeometry = {
  point: Point
  rect: CanvasPointerLocalRect
}

export type CanvasPointerLocalGeometryInput = {
  event: CanvasPointerClientPosition
  target?: CanvasPointerLocalTarget | null
}

export function screenPoint(
  stageElement: CanvasAppStageElement,
  event: CanvasPointerClientPosition,
) {
  return stageElement.getScreenPoint(event)
}

export function getCanvasPointerLocalGeometry({
  event,
  target,
}: CanvasPointerLocalGeometryInput): CanvasPointerLocalGeometry | null {
  const rect = target?.getBoundingClientRect?.()

  if (!rect) {
    return null
  }

  return {
    point: {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    },
    rect: {
      height: rect.height,
      left: rect.left,
      top: rect.top,
      width: rect.width,
    },
  }
}

export function getCanvasPointerLocalPoint(
  input: CanvasPointerLocalGeometryInput,
): Point | null {
  return getCanvasPointerLocalGeometry(input)?.point ?? null
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
