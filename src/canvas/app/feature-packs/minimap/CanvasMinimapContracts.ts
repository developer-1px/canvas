import type {
  Bounds,
  Viewport,
} from '../../../entities'

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

export type CanvasMinimapViewportInput = {
  current: Viewport
  stageRect: {
    height: number
    width: number
  }
}

export const CANVAS_MINIMAP_READ_MODEL = 'canvas-minimap-read-model'
export const CANVAS_MINIMAP_KEYBOARD_MODEL =
  'canvas-minimap-keyboard-navigation'

export const CANVAS_MINIMAP_DEFAULT_SIZE = Object.freeze({
  h: 112,
  w: 176,
} as const satisfies CanvasMinimapSize)
