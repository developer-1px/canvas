import {
  CANVAS_COMMAND_INSERT_OFFSET,
  type CanvasCommandOffset,
} from '../../../engine'
import type {
  Bounds,
  CanvasItem,
  Point,
} from '../../../entities'
import { getCanvasItemsBounds } from '../../../host'

export type CanvasPastePositionMemory = {
  key: string
  pasteIndex: number
}

export const CANVAS_PASTE_POSITION_MODEL = 'canvas-paste-position'

export type CanvasPastePositionSession = {
  key: string
  nextMemory: CanvasPastePositionMemory
  pasteIndex: number
}

export type CanvasPastePositionKeySegment = string | readonly string[]

export type CanvasPastePositionKeyInput = {
  segments: readonly CanvasPastePositionKeySegment[]
}

export function createCanvasPastePositionKey({
  segments,
}: CanvasPastePositionKeyInput) {
  return JSON.stringify(segments.map((segment) =>
    Array.isArray(segment) ? [...segment] : segment))
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
  return getCanvasPasteOffsetForBounds({
    clipboardBounds: getCanvasItemsBounds(clipboard),
    pasteIndex,
    viewportCenter,
  })
}

export function getCanvasPasteOffsetForBounds({
  clipboardBounds,
  pasteIndex,
  viewportCenter,
}: {
  clipboardBounds: Bounds | null
  pasteIndex: number
  viewportCenter: Point | null
}): CanvasCommandOffset {
  if (pasteIndex > 0 || !viewportCenter) {
    return CANVAS_COMMAND_INSERT_OFFSET
  }

  if (!clipboardBounds) {
    return CANVAS_COMMAND_INSERT_OFFSET
  }

  return {
    x: viewportCenter.x - (clipboardBounds.x + clipboardBounds.w / 2),
    y: viewportCenter.y - (clipboardBounds.y + clipboardBounds.h / 2),
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
