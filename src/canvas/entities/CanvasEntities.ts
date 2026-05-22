export type CanvasItemId = string

export type Tool = 'select' | 'pan' | 'rect' | 'text'

export type CanvasInteractionKind =
  | 'none'
  | 'pan'
  | 'move'
  | 'marquee'
  | 'create-rect'
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

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

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

export type CanvasSelectionIds = CanvasItemId[]

export type EditingText = {
  id: CanvasItemId
  value: string
}
