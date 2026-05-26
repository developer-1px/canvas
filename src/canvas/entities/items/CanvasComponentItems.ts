import type { CanvasItemBase } from './CanvasItemBase'

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
