import type {
  Bounds,
  CanvasItemId,
} from '../../core'

export type CanvasItemBase = Bounds & {
  hidden?: boolean
  id: CanvasItemId
  locked?: boolean
  rotation?: number
}
