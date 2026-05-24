export type CanvasItemId = string

export type CanvasBuiltinTool =
  | 'select'
  | 'pan'
  | 'sticky'
  | 'section'
  | 'rect'
  | 'ellipse'
  | 'diamond'
  | 'text'
  | 'comment'
  | 'marker'
  | 'highlight'
  | 'eraser'
  | 'laser'
  | 'arrow'

export const CANVAS_BUILTIN_SHAPE_TOOLS = Object.freeze([
  'diamond',
  'ellipse',
  'rect',
] as const satisfies readonly CanvasBuiltinTool[])

export type CanvasBuiltinShapeTool =
  (typeof CANVAS_BUILTIN_SHAPE_TOOLS)[number]

export type CanvasCustomToolId = `custom:${string}`

export type Tool = CanvasBuiltinTool | CanvasCustomToolId

export type CanvasInteractionKind =
  | 'none'
  | 'pan'
  | 'move'
  | 'marquee'
  | 'create-section'
  | 'create-shape'
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

export function isCanvasBuiltinShapeTool(
  tool: Tool,
): tool is CanvasBuiltinShapeTool {
  return CANVAS_BUILTIN_SHAPE_TOOLS.includes(tool as CanvasBuiltinShapeTool)
}
