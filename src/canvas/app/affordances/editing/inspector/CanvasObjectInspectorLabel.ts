import type { CanvasItem } from '../../../../entities'
import { isCanvasShapeItem } from '../../../../host'

export function getCanvasObjectInspectorLabel({
  selectedItems,
  selectionLength,
}: {
  selectedItems: readonly CanvasItem[]
  selectionLength: number
}) {
  if (selectionLength === 0) {
    return null
  }

  if (selectionLength > 1) {
    return `${selectionLength} selected`
  }

  const [item] = selectedItems

  if (!item) {
    return null
  }

  return getCanvasObjectInspectorItemLabel(item)
}

function getCanvasObjectInspectorItemLabel(item: CanvasItem) {
  if ('title' in item && item.title.trim().length > 0) {
    return item.title
  }

  if (isCanvasShapeItem(item)) {
    return 'Shape'
  }

  return capitalizeCanvasObjectInspectorLabel(item.type)
}

function capitalizeCanvasObjectInspectorLabel(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`
}
