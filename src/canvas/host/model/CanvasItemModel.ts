import type { Bounds, CanvasItemId } from '../../core'

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

export type CanvasItem = RectItem | TextItem | GroupItem | CanvasComponentItem

export type EditingText = {
  id: CanvasItemId
  value: string
}
