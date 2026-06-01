import type { CanvasItem } from '../canvas'

export type CanvasPresentationFrame = {
  h: number
  id: string
  title: string
  w: number
  x: number
  y: number
}

export function getCanvasPresentationFrames(
  items: readonly CanvasItem[],
): CanvasPresentationFrame[] {
  // Presentation order is top-to-bottom, then left-to-right, with id tie-breaks.
  return items
    .filter(isCanvasPresentationFrameItem)
    .map((item) => ({
      h: item.h,
      id: item.id,
      title: item.title,
      w: item.w,
      x: item.x,
      y: item.y,
    }))
    .sort(compareCanvasPresentationFrames)
}

export function getNextCanvasPresentationFrameIndex({
  current,
  direction,
  length,
}: {
  current: number
  direction: -1 | 1
  length: number
}) {
  if (length <= 0) {
    return 0
  }

  return (current + direction + length) % length
}

function isCanvasPresentationFrameItem(
  item: CanvasItem,
): item is Extract<CanvasItem, { type: 'component' }> {
  return item.type === 'component' && item.component === 'section'
}

function compareCanvasPresentationFrames(
  a: CanvasPresentationFrame,
  b: CanvasPresentationFrame,
) {
  return a.y - b.y || a.x - b.x || a.id.localeCompare(b.id)
}
