import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import {
  CANVAS_STAMP_ITEM_SIZE,
  isCanvasStampItem,
} from '../../host'
import { flattenCanvasAppSectionItems } from './CanvasAppSelectionSections'

const CANVAS_SELECTION_STAMP_GAP = 6

export function canStampCanvasAppSelection(
  selectedItems: readonly CanvasItem[],
) {
  return selectedItems.length > 0 && !selectedItems.every(isCanvasStampItem)
}

export function getCanvasAppSelectionStampPlacement({
  bounds,
  items,
}: {
  bounds: Bounds
  items: CanvasItem[]
}) {
  const x = bounds.x + bounds.w - CANVAS_STAMP_ITEM_SIZE / 2
  const y = bounds.y - CANVAS_STAMP_ITEM_SIZE / 2
  const sameRowStampCount = flattenCanvasAppSectionItems(items).filter((entry) =>
    isCanvasStampItem(entry.item) &&
    Math.abs(entry.item.y - y) < 0.5 &&
    entry.item.x >= x - 0.5,
  ).length

  return {
    x: x + sameRowStampCount *
      (CANVAS_STAMP_ITEM_SIZE + CANVAS_SELECTION_STAMP_GAP),
    y,
  }
}
