import type {
  Bounds,
  CanvasItemId,
} from '../../core'

export type CanvasItemBase = Bounds & {
  id: CanvasItemId
  locked?: boolean
}
