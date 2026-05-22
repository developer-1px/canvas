import type {
  Bounds,
} from '../engine/CanvasPrimitives'

export {
  clamp,
  DRAG_THRESHOLD,
  fitBoundsIntoViewport,
  handlePoint,
  INITIAL_VIEWPORT,
  MAX_SCALE,
  MIN_ITEM_SIZE,
  MIN_SCALE,
  normalizeBounds,
  pointDistance,
  RESIZE_HANDLES,
  resizeBounds,
  scaleItemBounds,
  unique,
  zoomViewport,
} from '../engine/CanvasPrimitives'
export type {
  Bounds,
  CanvasInteractionKind,
  Point,
  ResizeHandle,
  Tool,
  Viewport,
} from '../engine/CanvasPrimitives'

export type RectItem = Bounds & {
  id: string
  type: 'rect'
  fill: string
  stroke: string
  text?: string
}

export type TextItem = Bounds & {
  id: string
  type: 'text'
  text: string
}

export type GroupItem = Bounds & {
  id: string
  type: 'group'
  children: CanvasItem[]
}

export type CanvasComponentKind =
  | 'card'
  | 'checklist'
  | 'connector'
  | 'image'
  | 'kanban'
  | 'label'
  | 'section'
  | 'sticky'
  | 'table'
  | 'vote'

export type CanvasComponentItem = Bounds & {
  id: string
  type: 'component'
  accent: string
  body?: string
  columns?: string[]
  component: CanvasComponentKind
  fill: string
  items?: string[]
  stroke: string
  title: string
}

export type CanvasItem = RectItem | TextItem | GroupItem | CanvasComponentItem

export type EditingText = {
  id: string
  value: string
}
