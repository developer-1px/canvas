import {
  CANVAS_COMMAND_INSERT_OFFSET,
  type CanvasCommandOffset,
} from '../../../engine'
import type {
  CanvasItem,
  Point,
} from '../../../entities'
import { getCanvasItemsBounds } from '../../../host'

export type CanvasPastePositionMemory = {
  key: string
  pasteIndex: number
}

export type CanvasPastePositionSession = {
  key: string
  nextMemory: CanvasPastePositionMemory
  pasteIndex: number
}

export function getCanvasPasteOffset({
  clipboard,
  pasteIndex,
  viewportCenter,
}: {
  clipboard: CanvasItem[]
  pasteIndex: number
  viewportCenter: Point | null
}): CanvasCommandOffset {
  if (pasteIndex > 0 || !viewportCenter) {
    return CANVAS_COMMAND_INSERT_OFFSET
  }

  const bounds = getCanvasItemsBounds(clipboard)

  if (!bounds) {
    return CANVAS_COMMAND_INSERT_OFFSET
  }

  return {
    x: viewportCenter.x - (bounds.x + bounds.w / 2),
    y: viewportCenter.y - (bounds.y + bounds.h / 2),
  }
}

export function getCanvasPastePositionSession({
  key,
  memory,
}: {
  key: string
  memory: CanvasPastePositionMemory | null | undefined
}): CanvasPastePositionSession {
  const pasteIndex = memory?.key === key ? memory.pasteIndex : 0

  return {
    key,
    nextMemory: {
      key,
      pasteIndex: pasteIndex + 1,
    },
    pasteIndex,
  }
}
