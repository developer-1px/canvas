import type {
  CanvasShapeItem,
  CanvasShapeKind,
  CanvasShapeLikeItem,
  CanvasShapeType,
  RectItem,
} from '../model'
import {
  CANVAS_BUILTIN_SHAPE_TOOLS,
  type CanvasBuiltinShapeTool,
  type Tool,
} from '../../core'
import {
  isOptionalCanvasItemFontSize,
  isOptionalCanvasItemOpacity,
  isOptionalCanvasItemStrokeWidth,
  isOptionalCanvasItemTextAlign,
} from '../style/CanvasItemStyleValidation'

export const CANVAS_DEFAULT_SHAPE_TYPE: CanvasShapeType = 'rect'
export const CANVAS_DEFAULT_SHAPE_KIND: CanvasShapeKind =
  CANVAS_DEFAULT_SHAPE_TYPE

const CANVAS_SHAPE_KINDS = Object.freeze([
  ...CANVAS_BUILTIN_SHAPE_TOOLS,
] as const satisfies readonly CanvasShapeKind[])

const CANVAS_TOOL_SHAPE_KINDS = Object.freeze(
  Object.fromEntries(
    CANVAS_BUILTIN_SHAPE_TOOLS.map((tool) => [tool, tool] as const),
  ),
) as Readonly<Record<CanvasBuiltinShapeTool, CanvasShapeKind>>

export type CanvasShapeTool = CanvasBuiltinShapeTool

export function getCanvasShapeType(item: Pick<CanvasShapeItem, 'shapeType'>) {
  return item.shapeType
}

export function getCanvasShapeKind(
  item: Partial<Pick<CanvasShapeItem, 'shapeType'>> &
    Partial<Pick<RectItem, 'shape'>>,
) {
  return item.shapeType ?? item.shape ?? CANVAS_DEFAULT_SHAPE_TYPE
}

export function getCanvasLegacyShapeKind(item: Pick<RectItem, 'shape'>) {
  return item.shape ?? CANVAS_DEFAULT_SHAPE_KIND
}

export function setCanvasShapeKind<TItem extends CanvasShapeLikeItem>(
  item: TItem,
  shapeType: CanvasShapeType,
): TItem {
  return item.type === 'shape'
    ? { ...item, shapeType } as TItem
    : { ...item, shape: shapeType } as TItem
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

export function isCanvasShapeItem(
  item: { type: string },
): item is CanvasShapeLikeItem {
  return item.type === 'shape' || item.type === 'rect'
}

export function isCanvasShapeItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasShapeLikeItem {
  return isCanvasShapeStorageShape(value) ||
    isLegacyCanvasRectStorageShape(value)
}

function isCanvasShapeStorageShape(
  value: Record<string, unknown>,
): value is CanvasShapeItem {
  return (
    value.type === 'shape' &&
    typeof value.fill === 'string' &&
    isOptionalCanvasItemFontSize(value.fontSize) &&
    isOptionalCanvasItemOpacity(value.opacity) &&
    typeof value.stroke === 'string' &&
    isOptionalCanvasItemStrokeWidth(value.strokeWidth) &&
    isCanvasShapeKind(value.shapeType) &&
    (value.text === undefined || typeof value.text === 'string') &&
    isOptionalCanvasItemTextAlign(value.textAlign)
  )
}

function isLegacyCanvasRectStorageShape(
  value: Record<string, unknown>,
): value is RectItem {
  return (
    value.type === 'rect' &&
    typeof value.fill === 'string' &&
    isOptionalCanvasItemFontSize(value.fontSize) &&
    isOptionalCanvasItemOpacity(value.opacity) &&
    typeof value.stroke === 'string' &&
    isOptionalCanvasItemStrokeWidth(value.strokeWidth) &&
    (value.shape === undefined || isCanvasShapeKind(value.shape)) &&
    (value.text === undefined || typeof value.text === 'string') &&
    isOptionalCanvasItemTextAlign(value.textAlign)
  )
}
