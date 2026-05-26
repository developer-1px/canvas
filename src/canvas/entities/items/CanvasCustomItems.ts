import type { CanvasItemBase } from './CanvasItemBase'

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
