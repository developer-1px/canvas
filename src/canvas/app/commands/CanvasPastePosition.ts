import {
  CANVAS_COMMAND_INSERT_OFFSET,
  type CanvasCommandOffset,
} from '../../engine/command/CanvasCommandEngine'
import type { Point } from '../../core'
import type { CanvasItem } from '../../host/model'
import { getItemsBounds } from '../../host'

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

  const bounds = getItemsBounds(clipboard)

  if (!bounds) {
    return CANVAS_COMMAND_INSERT_OFFSET
  }

  return {
    x: viewportCenter.x - (bounds.x + bounds.w / 2),
    y: viewportCenter.y - (bounds.y + bounds.h / 2),
  }
}
