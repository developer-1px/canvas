import { pointDistance } from '../../../../core'
import type { Point } from '../../../../entities'

export const CANVAS_POINTER_CLICK_MEMORY_MODEL =
  'canvas-pointer-click-memory'

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

export type CanvasResizeHandleDoubleClickIntent<THandle extends string = string> = {
  handle: THandle
  kind: 'auto-size-selection'
}

export type CanvasResizeHandleDoubleClickIntentInput<
  THandle extends string = string,
> = {
  handle: THandle
  handleId: string
  lastClick: CanvasPointerClickMemory
  point: Point
  time: number
}

export type CanvasResizeHandleDoubleClickIntentResult<
  THandle extends string = string,
> = {
  intent: CanvasResizeHandleDoubleClickIntent<THandle> | null
  isDoubleClick: boolean
  nextClick: NonNullable<CanvasPointerClickMemory>
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

export function getCanvasResizeHandleDoubleClickIntent<
  THandle extends string = string,
>({
  handle,
  handleId,
  lastClick,
  point,
  time,
}: CanvasResizeHandleDoubleClickIntentInput<THandle>): CanvasResizeHandleDoubleClickIntentResult<THandle> {
  const clickMemory = recordCanvasItemPointerClick({
    itemId: handleId,
    lastClick,
    point,
    time,
  })

  return {
    intent: clickMemory.isDoubleClick
      ? {
          handle,
          kind: 'auto-size-selection',
        }
      : null,
    isDoubleClick: clickMemory.isDoubleClick,
    nextClick: clickMemory.nextClick,
  }
}
