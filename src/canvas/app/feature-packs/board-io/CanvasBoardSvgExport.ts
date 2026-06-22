import type {
  Bounds,
  CanvasItem,
} from '../../../entities'
import {
  getCanvasItemsBounds,
  getCanvasValidSelection,
} from '../../../host'
import {
  createCanvasItemsImageExport,
  type CanvasImageExportPayload,
} from '../image-io'
import {
  DEFAULT_BOARD_SVG_FILENAME,
  DEFAULT_SELECTION_SVG_FILENAME,
  type CanvasBoardSvgExportInput,
} from './CanvasBoardIoContracts'

const EMPTY_BOARD_BOUNDS: Bounds = {
  h: 0,
  w: 0,
  x: 0,
  y: 0,
}

export function createCanvasBoardSvgExport({
  filename,
  items,
  scope = 'board',
  selection = [],
}: CanvasBoardSvgExportInput): CanvasImageExportPayload | null {
  const targetItems =
    scope === 'selection'
      ? getSelectedCanvasBoardItems(items, selection)
      : items

  if (scope === 'selection' && targetItems.length === 0) {
    return null
  }

  const bounds = getCanvasItemsBounds(targetItems) ?? EMPTY_BOARD_BOUNDS
  const exportPayload = createCanvasItemsImageExport({
    bounds,
    items: targetItems,
  })

  return {
    ...exportPayload,
    filename:
      filename ??
      (scope === 'selection'
        ? DEFAULT_SELECTION_SVG_FILENAME
        : DEFAULT_BOARD_SVG_FILENAME),
  }
}

function getSelectedCanvasBoardItems(
  items: CanvasItem[],
  selection: string[],
) {
  const selected = new Set(getCanvasValidSelection(items, selection))

  return collectSelectedCanvasBoardItems(items, selected)
}

function collectSelectedCanvasBoardItems(
  items: CanvasItem[],
  selected: Set<string>,
): CanvasItem[] {
  return items.flatMap((item) => {
    if (selected.has(item.id)) {
      return [item]
    }

    if (item.type === 'group') {
      return collectSelectedCanvasBoardItems(item.children, selected)
    }

    return []
  })
}
