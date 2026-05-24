import type {
  CanvasShapeKind,
  RectItem,
} from '../model'
import {
  CANVAS_BUILTIN_SHAPE_TOOLS,
  type CanvasBuiltinShapeTool,
  type Tool,
} from '../../core'

export const CANVAS_DEFAULT_SHAPE_KIND: CanvasShapeKind = 'rect'

const CANVAS_SHAPE_KINDS = Object.freeze([
  ...CANVAS_BUILTIN_SHAPE_TOOLS,
] as const satisfies readonly CanvasShapeKind[])

const CANVAS_TOOL_SHAPE_KINDS = Object.freeze(
  Object.fromEntries(
    CANVAS_BUILTIN_SHAPE_TOOLS.map((tool) => [tool, tool] as const),
  ),
) as Readonly<Record<CanvasBuiltinShapeTool, CanvasShapeKind>>

export type CanvasShapeTool = CanvasBuiltinShapeTool

export function getCanvasShapeKind(item: Pick<RectItem, 'shape'>) {
  return item.shape ?? CANVAS_DEFAULT_SHAPE_KIND
}

export function getCanvasToolShapeKind(tool: Tool): CanvasShapeKind | null {
  return isCanvasShapeTool(tool) ? CANVAS_TOOL_SHAPE_KINDS[tool] : null
}

export function isCanvasShapeTool(tool: Tool): tool is CanvasShapeTool {
  return Object.prototype.hasOwnProperty.call(CANVAS_TOOL_SHAPE_KINDS, tool)
}

export function isCanvasShapeKind(value: unknown): value is CanvasShapeKind {
  return typeof value === 'string' &&
    CANVAS_SHAPE_KINDS.includes(value as CanvasShapeKind)
}
