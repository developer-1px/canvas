import type {
  Bounds,
} from '../../engine/primitives/CanvasPrimitives'

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
} from '../../engine/primitives/CanvasPrimitives'
export type {
  Bounds,
  CanvasInteractionKind,
  Point,
  ResizeHandle,
  Tool,
  Viewport,
} from '../../engine/primitives/CanvasPrimitives'

type CanvasItemBase = Bounds & {
  id: string
  locked?: boolean
}

export type RectItem = CanvasItemBase & {
  type: 'rect'
  fill: string
  stroke: string
  text?: string
}

export type TextItem = CanvasItemBase & {
  type: 'text'
  text: string
}

export type GroupItem = CanvasItemBase & {
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

export type CanvasComponentItem = CanvasItemBase & {
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
