import type {
  Point,
  Viewport,
} from '../../../entities'
import type { CanvasAppStageRect } from '../../rendering/stage/CanvasAppStageElement'
import type {
  CanvasMinimapReadModel,
  CanvasMinimapSize,
} from './CanvasMinimapContracts'

export function getCanvasMinimapViewportForWorldCenter({
  current,
  stageRect,
  worldCenter,
}: {
  current: Viewport
  stageRect: CanvasAppStageRect
  worldCenter: Point
}): Viewport {
  return {
    scale: current.scale,
    x: stageRect.width / 2 - worldCenter.x * current.scale,
    y: stageRect.height / 2 - worldCenter.y * current.scale,
  }
}

export function getCanvasMinimapWorldPoint({
  model,
  point,
}: {
  model: CanvasMinimapReadModel
  point: Point
}): Point {
  return {
    x: model.worldBounds.x + (point.x - model.displayBounds.x) / model.scale,
    y: model.worldBounds.y + (point.y - model.displayBounds.y) / model.scale,
  }
}

export function getCanvasMinimapPointFromViewportOffset({
  model,
  offset,
  viewportSize,
}: {
  model: CanvasMinimapReadModel
  offset: Point
  viewportSize: CanvasMinimapSize
}): Point | null {
  if (viewportSize.w <= 0 || viewportSize.h <= 0) {
    return null
  }

  return {
    x: offset.x * model.size.w / viewportSize.w,
    y: offset.y * model.size.h / viewportSize.h,
  }
}
