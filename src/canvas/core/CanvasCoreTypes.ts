export type CanvasItemId = string

export type CanvasBuiltinTool =
  | 'select'
  | 'pan'
  | 'sticky'
  | 'rect'
  | 'text'
  | 'comment'
  | 'marker'
  | 'highlight'
  | 'arrow'

export type CanvasCustomToolId = `custom:${string}`

export type Tool = CanvasBuiltinTool | CanvasCustomToolId

export type CanvasInteractionKind =
  | 'none'
  | 'pan'
  | 'move'
  | 'marquee'
  | 'create-rect'
  | 'create-arrow'
  | 'create-custom'
  | 'draw-marker'
  | 'draw-highlight'
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

export function isCanvasCustomToolId(tool: Tool): tool is CanvasCustomToolId {
  return tool.startsWith('custom:')
}
