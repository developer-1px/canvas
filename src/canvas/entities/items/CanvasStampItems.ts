import type { CanvasItemBase } from './CanvasItemBase'

export type CanvasStampKind = string

export type CanvasStampItem = CanvasItemBase & {
  type: 'stamp'
  label: string
  stamp: CanvasStampKind
}
