export type CanvasItemId = string

export type CanvasBuiltinTool =
  | 'select'
  | 'pan'
  | 'sticky'
  | 'section'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'comment'
  | 'marker'
  | 'highlight'
  | 'eraser'
  | 'laser'
  | 'arrow'

export type CanvasCustomToolId = `custom:${string}`

export type Tool = CanvasBuiltinTool | CanvasCustomToolId

export type CanvasInteractionKind =
  | 'none'
  | 'pan'
  | 'move'
  | 'marquee'
  | 'create-section'
  | 'create-rect'
  | 'create-ellipse'
  | 'create-arrow'
  | 'create-custom'
  | 'draw-marker'
  | 'draw-highlight'
  | 'erase'
  | 'laser'
  | 'arrow-endpoint'
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

export type CanvasSide = 'bottom' | 'left' | 'right' | 'top'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export type CanvasSelectionIds = CanvasItemId[]

export function isCanvasCustomToolId(tool: Tool): tool is CanvasCustomToolId {
  return tool.startsWith('custom:')
}
