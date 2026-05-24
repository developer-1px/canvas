import { isCanvasStableId } from '../../core'
import type {
  CanvasStampItem,
  CanvasStampKind,
} from '../model'

export const CANVAS_STAMP_ITEM_SIZE = 44

export type CreateCanvasStampItemInput = {
  id: string
  label: string
  stamp: CanvasStampKind
  x: number
  y: number
}

export function createCanvasStampItem({
  id,
  label,
  stamp,
  x,
  y,
}: CreateCanvasStampItemInput): CanvasStampItem {
  return {
    h: CANVAS_STAMP_ITEM_SIZE,
    id,
    label,
    stamp,
    type: 'stamp',
    w: CANVAS_STAMP_ITEM_SIZE,
    x,
    y,
  }
}

export function isCanvasStampItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasStampItem {
  return (
    value.type === 'stamp' &&
    isCanvasStableId(value.stamp) &&
    typeof value.label === 'string' &&
    value.label.trim().length > 0 &&
    value.label.length <= 16 &&
    isPositiveFiniteNumber(value.w) &&
    isPositiveFiniteNumber(value.h)
  )
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
