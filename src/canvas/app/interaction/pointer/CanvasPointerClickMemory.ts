import { pointDistance } from '../../../core'
import type { Point } from '../../../entities'

export type CanvasPointerClickMemory = {
  id: string
  point: Point
  time: number
} | null

type RecordCanvasItemPointerClickArgs = {
  itemId: string
  lastClick: CanvasPointerClickMemory
  point: Point
  time: number
}

const CANVAS_POINTER_DOUBLE_CLICK_MAX_DELAY_MS = 360
const CANVAS_POINTER_DOUBLE_CLICK_MAX_DISTANCE = 6

export function recordCanvasItemPointerClick({
  itemId,
  lastClick,
  point,
  time,
}: RecordCanvasItemPointerClickArgs) {
  return {
    isDoubleClick:
      lastClick?.id === itemId &&
      time - lastClick.time < CANVAS_POINTER_DOUBLE_CLICK_MAX_DELAY_MS &&
      pointDistance(point, lastClick.point) <
        CANVAS_POINTER_DOUBLE_CLICK_MAX_DISTANCE,
    nextClick: {
      id: itemId,
      point,
      time,
    },
  }
}
