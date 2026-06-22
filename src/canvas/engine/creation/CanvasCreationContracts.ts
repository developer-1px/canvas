import type {
  Bounds,
  Point,
} from '../../core'
import type {
  CanvasPathSegment,
  CanvasShapeKind,
} from '../../entities'

export type CanvasCreationItem = {
  id: string
}

export type CanvasCreatedText<TItem extends CanvasCreationItem> = {
  item: TItem
  editValue: string
}

export type CanvasCreatedArrowRouting = 'elbow' | 'straight'

export type CanvasCreatedShapeKind = CanvasShapeKind

export type CanvasCreatedDrawingStyle = Readonly<{
  opacity: number
  stroke: string
  strokeWidth: number
}>

export type CanvasCreatedPathSegment = CanvasPathSegment

export type CanvasCreationAdapter<TItem extends CanvasCreationItem> = {
  createArrow: (input: {
    end: Point
    endAttachedTo?: string
    id: string
    routing?: CanvasCreatedArrowRouting
    start: Point
    startAttachedTo?: string
  }) => TItem
  createHighlight: (input: {
    id: string
    points: Point[]
    style?: CanvasCreatedDrawingStyle
  }) => TItem
  createMarker: (input: {
    id: string
    points: Point[]
    style?: CanvasCreatedDrawingStyle
  }) => TItem
  createPath?: (input: {
    id: string
    segments: CanvasCreatedPathSegment[]
    style?: CanvasCreatedDrawingStyle
  }) => TItem
  createShape?: (input: {
    bounds: Bounds
    id: string
    shapeType: CanvasCreatedShapeKind
  }) => TItem
  createRect?: (input: {
    bounds: Bounds
    id: string
    shape?: CanvasCreatedShapeKind
  }) => TItem
  createText: (input: { id: string; point: Point }) => CanvasCreatedText<TItem>
}
