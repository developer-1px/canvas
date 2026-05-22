export type CanvasItemId = string

export type Tool = 'select' | 'pan' | 'rect' | 'text'

export type CanvasInteractionKind =
  | 'none'
  | 'pan'
  | 'move'
  | 'marquee'
  | 'create-rect'
  | 'resize'

export type Point = {
  x: number
  y: number
}

export type Viewport = Point & {
  scale: number
}

export type Bounds = Point & {
  w: number
  h: number
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export type CanvasSelectionIds = CanvasItemId[]
