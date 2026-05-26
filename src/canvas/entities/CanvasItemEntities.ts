import type {
  Bounds,
  CanvasItemId,
  Point,
} from '../core'

export type CanvasItemBase = Bounds & {
  id: CanvasItemId
  locked?: boolean
}

export type RectItem = CanvasItemBase & {
  type: 'rect'
  fill: string
  shape?: CanvasShapeKind
  stroke: string
  text?: string
}

export type CanvasShapeKind = 'diamond' | 'ellipse' | 'rect'

export type TextItem = CanvasItemBase & {
  type: 'text'
  text: string
}

export type CanvasImageItem = CanvasItemBase & {
  type: 'image'
  alt?: string
  mimeType: string
  name?: string
  naturalHeight?: number
  naturalWidth?: number
  src: string
}

export type CanvasCommentItem = CanvasItemBase & {
  type: 'comment'
  attachedTo?: CanvasItemId
  body: string
  resolved?: boolean
}

export type CanvasStampKind = string

export type CanvasStampItem = CanvasItemBase & {
  type: 'stamp'
  label: string
  stamp: CanvasStampKind
}

export type CanvasDrawingItemBase = CanvasItemBase & {
  opacity: number
  points: Point[]
  stroke: string
  strokeWidth: number
}

export type MarkerItem = CanvasDrawingItemBase & {
  type: 'marker'
}

export type HighlightItem = CanvasDrawingItemBase & {
  type: 'highlight'
}

export type ArrowItem = CanvasItemBase & {
  type: 'arrow'
  end: Point
  endAttachedTo?: CanvasItemId
  routing?: CanvasArrowRouting
  start: Point
  startAttachedTo?: CanvasItemId
  stroke: string
  strokeWidth: number
  text?: string
}

export type CanvasArrowEndpoint = 'end' | 'start'
export type CanvasArrowRouting = 'elbow' | 'straight'

export type GroupItem = CanvasItemBase & {
  type: 'group'
  children: CanvasItem[]
}

export type CanvasComponentKind = string

export type CanvasComponentItem = CanvasItemBase & {
  type: 'component'
  accent: string
  body?: string
  checkedItems?: number[]
  columns?: string[]
  component: CanvasComponentKind
  fill: string
  items?: string[]
  orientation?: 'horizontal' | 'vertical'
  stroke: string
  title: string
  url?: string
}

export type CanvasEditableTextItem =
  | ArrowItem
  | CanvasCommentItem
  | RectItem
  | TextItem
  | CanvasComponentItem

export type CanvasJsonValue =
  | null
  | boolean
  | number
  | string
  | CanvasJsonValue[]
  | { [key: string]: CanvasJsonValue }

export type CanvasJsonObject = { [key: string]: CanvasJsonValue }

export type CanvasCustomItem = CanvasItemBase & {
  type: 'custom'
  data: CanvasJsonObject
  kind: string
  presentation: string
  title: string
}

export type CanvasItem =
  | RectItem
  | TextItem
  | CanvasImageItem
  | CanvasCommentItem
  | CanvasStampItem
  | MarkerItem
  | HighlightItem
  | ArrowItem
  | GroupItem
  | CanvasComponentItem
  | CanvasCustomItem

export type EditingText = {
  id: CanvasItemId
  value: string
}
