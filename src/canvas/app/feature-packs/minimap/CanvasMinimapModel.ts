import type {
  Bounds,
  Point,
  Viewport,
} from '../../../entities'
import {
  getCanvasViewportWorldBounds,
} from '../../../core'
import {
  unionCanvasRectList,
  unionCanvasRects,
} from '../../../foundation'
import type { CanvasAppStageRect } from '../../rendering/stage/CanvasAppStageElement'

export type CanvasMinimapSize = {
  h: number
  w: number
}

export type CanvasMinimapItemBounds = {
  bounds: Bounds
  id: string
}

export type CanvasMinimapItemRect = {
  id: string
  rect: Bounds
}

export type CanvasMinimapReadModel = {
  contentBounds: Bounds | null
  displayBounds: Bounds
  isEmpty: boolean
  itemRects: readonly CanvasMinimapItemRect[]
  size: CanvasMinimapSize
  viewportRect: Bounds
  viewportWorldBounds: Bounds
  worldBounds: Bounds
}

export const CANVAS_MINIMAP_DEFAULT_SIZE = Object.freeze({
  h: 112,
  w: 176,
} as const satisfies CanvasMinimapSize)

const CANVAS_MINIMAP_PADDING = 8
const CANVAS_MINIMAP_MIN_WORLD_SIZE = 120

export function getCanvasMinimapReadModel({
  items,
  size = CANVAS_MINIMAP_DEFAULT_SIZE,
  stageRect,
  viewport,
}: {
  items: readonly CanvasMinimapItemBounds[]
  size?: CanvasMinimapSize
  stageRect: CanvasAppStageRect
  viewport: Viewport
}): CanvasMinimapReadModel {
  const viewportWorldBounds = getCanvasMinimapViewportWorldBounds({
    stageRect,
    viewport,
  })
  const contentBounds = getCanvasMinimapContentBounds(items)
  const worldBounds = expandCanvasMinimapWorldBounds(
    getCanvasMinimapWorldBounds({
      contentBounds,
      viewportWorldBounds,
    }),
  )
  const displayBounds = getCanvasMinimapDisplayBounds({
    size,
    worldBounds,
  })

  return {
    contentBounds,
    displayBounds,
    isEmpty: items.length === 0,
    itemRects: items.map((item) => ({
      id: item.id,
      rect: worldBoundsToMinimapRect({
        displayBounds,
        rect: item.bounds,
        worldBounds,
      }),
    })),
    size,
    viewportRect: worldBoundsToMinimapRect({
      displayBounds,
      rect: viewportWorldBounds,
      worldBounds,
    }),
    viewportWorldBounds,
    worldBounds,
  }
}

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
  const scale = getCanvasMinimapScale(model.worldBounds, model.displayBounds)

  return {
    x: model.worldBounds.x + (point.x - model.displayBounds.x) / scale,
    y: model.worldBounds.y + (point.y - model.displayBounds.y) / scale,
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

function getCanvasMinimapViewportWorldBounds({
  stageRect,
  viewport,
}: {
  stageRect: CanvasAppStageRect
  viewport: Viewport
}): Bounds {
  return getCanvasViewportWorldBounds(viewport, stageRect)
}

function getCanvasMinimapContentBounds(
  items: readonly CanvasMinimapItemBounds[],
): Bounds | null {
  return unionCanvasRectList(items.map((item) => item.bounds))
}

function getCanvasMinimapWorldBounds({
  contentBounds,
  viewportWorldBounds,
}: {
  contentBounds: Bounds | null
  viewportWorldBounds: Bounds
}) {
  return contentBounds
    ? unionCanvasRects(contentBounds, viewportWorldBounds)
    : viewportWorldBounds
}

function expandCanvasMinimapWorldBounds(bounds: Bounds): Bounds {
  const width = Math.max(bounds.w, CANVAS_MINIMAP_MIN_WORLD_SIZE)
  const height = Math.max(bounds.h, CANVAS_MINIMAP_MIN_WORLD_SIZE)
  const centerX = bounds.x + bounds.w / 2
  const centerY = bounds.y + bounds.h / 2

  return {
    h: height,
    w: width,
    x: centerX - width / 2,
    y: centerY - height / 2,
  }
}

function getCanvasMinimapDisplayBounds({
  size,
  worldBounds,
}: {
  size: CanvasMinimapSize
  worldBounds: Bounds
}): Bounds {
  const availableWidth = Math.max(1, size.w - CANVAS_MINIMAP_PADDING * 2)
  const availableHeight = Math.max(1, size.h - CANVAS_MINIMAP_PADDING * 2)
  const scale = Math.min(
    availableWidth / Math.max(1, worldBounds.w),
    availableHeight / Math.max(1, worldBounds.h),
  )
  const width = worldBounds.w * scale
  const height = worldBounds.h * scale

  return {
    h: height,
    w: width,
    x: (size.w - width) / 2,
    y: (size.h - height) / 2,
  }
}

function worldBoundsToMinimapRect({
  displayBounds,
  rect,
  worldBounds,
}: {
  displayBounds: Bounds
  rect: Bounds
  worldBounds: Bounds
}): Bounds {
  const scale = getCanvasMinimapScale(worldBounds, displayBounds)

  return {
    h: Math.max(1, rect.h * scale),
    w: Math.max(1, rect.w * scale),
    x: displayBounds.x + (rect.x - worldBounds.x) * scale,
    y: displayBounds.y + (rect.y - worldBounds.y) * scale,
  }
}

function getCanvasMinimapScale(worldBounds: Bounds, displayBounds: Bounds) {
  return Math.min(
    displayBounds.w / Math.max(1, worldBounds.w),
    displayBounds.h / Math.max(1, worldBounds.h),
  )
}
