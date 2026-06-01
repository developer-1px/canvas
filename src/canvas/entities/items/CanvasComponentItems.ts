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
  fontSize?: number
  items?: string[]
  opacity?: number
  orientation?: 'horizontal' | 'vertical'
  stroke: string
  textAlign?: 'center' | 'left' | 'right'
  title: string
  url?: string
}
