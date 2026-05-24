import type {
  CanvasShapeKind,
  RectItem,
} from '../model'

export const CANVAS_DEFAULT_SHAPE_KIND: CanvasShapeKind = 'rect'

const CANVAS_SHAPE_KINDS = Object.freeze([
  'ellipse',
  'rect',
] as const satisfies readonly CanvasShapeKind[])

export function getCanvasShapeKind(item: Pick<RectItem, 'shape'>) {
  return item.shape ?? CANVAS_DEFAULT_SHAPE_KIND
}

export function isCanvasShapeKind(value: unknown): value is CanvasShapeKind {
  return typeof value === 'string' &&
    CANVAS_SHAPE_KINDS.includes(value as CanvasShapeKind)
}
