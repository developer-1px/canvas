import type {
  Bounds,
  Point,
  Viewport,
} from '../../../entities'
import {
  clamp,
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
  scale: number
  size: CanvasMinimapSize
  viewportRect: Bounds
  viewportWorldBounds: Bounds
  worldBounds: Bounds
}

export const CANVAS_MINIMAP_READ_MODEL = 'canvas-minimap-read-model'
export const CANVAS_MINIMAP_KEYBOARD_MODEL =
  'canvas-minimap-keyboard-navigation'

export const CANVAS_MINIMAP_DEFAULT_SIZE = Object.freeze({
  h: 112,
  w: 176,
} as const satisfies CanvasMinimapSize)

const CANVAS_MINIMAP_PADDING = 8
const CANVAS_MINIMAP_MIN_WORLD_SIZE = 120
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
  const scale = getCanvasMinimapScale(worldBounds, displayBounds)

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
    scale,
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
