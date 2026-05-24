import type {
  Bounds,
  Point,
} from '../../entities'
import type { CanvasSceneAdapter } from '../../engine'

export type CanvasArrowEndpointResolution = {
  end: Point
  endAttachedTo?: string
  start: Point
  startAttachedTo?: string
}

export function resolveCanvasArrowEndpoints({
  end,
  endAttachedTo,
  scene,
  start,
  startAttachedTo,
}: CanvasArrowEndpointResolution & {
  scene: CanvasSceneAdapter
}): CanvasArrowEndpointResolution {
  const startBounds = getCanvasSceneTargetBounds({
    id: startAttachedTo,
    scene,
  })
  const endBounds = getCanvasSceneTargetBounds({
    id: endAttachedTo,
    scene,
  })
  const startTarget = startBounds ? getCanvasBoundsCenter(startBounds) : start
  const endTarget = endBounds ? getCanvasBoundsCenter(endBounds) : end

  return {
    end: endBounds
      ? getCanvasBoundsAnchorPoint({
          bounds: endBounds,
          toward: startTarget,
        })
      : end,
    endAttachedTo,
    start: startBounds
      ? getCanvasBoundsAnchorPoint({
          bounds: startBounds,
          toward: endTarget,
        })
      : start,
    startAttachedTo,
  }
}

export function findCanvasSceneTargetAtPoint({
  excludeIds = [],
  point,
  scene,
}: {
  excludeIds?: readonly string[]
  point: Point
  scene: CanvasSceneAdapter
}) {
  const excluded = new Set(excludeIds)

  return [...scene.entries]
    .reverse()
    .find((entry) =>
      !excluded.has(entry.id) &&
      point.x >= entry.bounds.x &&
      point.x <= entry.bounds.x + entry.bounds.w &&
      point.y >= entry.bounds.y &&
      point.y <= entry.bounds.y + entry.bounds.h,
    )?.id
}

function getCanvasSceneTargetBounds({
  id,
  scene,
}: {
  id?: string
  scene: CanvasSceneAdapter
}) {
  if (!id) {
    return null
  }

  return scene.getBounds([id]) ??
    scene.entries.find((entry) => entry.id === id)?.bounds ??
    null
}

function getCanvasBoundsCenter(bounds: Bounds): Point {
  return {
    x: bounds.x + bounds.w / 2,
    y: bounds.y + bounds.h / 2,
  }
}

function getCanvasBoundsAnchorPoint({
  bounds,
  toward,
}: {
  bounds: Bounds
  toward: Point
}): Point {
  const center = getCanvasBoundsCenter(bounds)
  const dx = toward.x - center.x
  const dy = toward.y - center.y

  if (dx === 0 && dy === 0) {
    return center
  }

  const scaleX = dx === 0
    ? Number.POSITIVE_INFINITY
    : (bounds.w / 2) / Math.abs(dx)
  const scaleY = dy === 0
    ? Number.POSITIVE_INFINITY
    : (bounds.h / 2) / Math.abs(dy)
  const scale = Math.min(scaleX, scaleY)

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  }
}
