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
  stroke: string
  text?: string
}

export type TextItem = CanvasItemBase & {
  type: 'text'
  text: string
}

export type CanvasEditableTextItem = RectItem | TextItem

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
  start: Point
  stroke: string
  strokeWidth: number
}

export type GroupItem = CanvasItemBase & {
  type: 'group'
  children: CanvasItem[]
}

export type CanvasComponentKind = string

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
