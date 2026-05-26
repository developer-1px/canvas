import type { CanvasItemBase } from './CanvasItemBase'

export type CanvasImageItem = CanvasItemBase & {
  type: 'image'
  alt?: string
  mimeType: string
  name?: string
  naturalHeight?: number
  naturalWidth?: number
  src: string
}
