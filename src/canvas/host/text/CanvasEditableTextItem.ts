import type {
  CanvasItem,
  RectItem,
  TextItem,
} from '../model'

export type CanvasEditableTextItem = RectItem | TextItem

export function isCanvasTextItem(item: CanvasItem): item is TextItem {
  return item.type === 'text'
}

export function isCanvasEditableTextItem(
  item: CanvasItem,
): item is CanvasEditableTextItem {
  return item.type === 'rect' || isCanvasTextItem(item)
}

export function isCanvasEditableTextItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasEditableTextItem {
  return (
    isCanvasRectItemStorageShape(value) ||
    isCanvasTextItemStorageShape(value)
  )
}

export function getCanvasEditableTextValue(
  item: CanvasEditableTextItem,
) {
  return item.type === 'rect' ? item.text ?? '' : item.text
}

export function getCommittedCanvasEditableTextValue({
  item,
  value,
}: {
  item: CanvasEditableTextItem
  value: string
}) {
  return isCanvasTextItem(item) && !value.trim()
    ? 'Text'
    : value
}

export function getCanvasEditableTextPatchOperation(
  item: CanvasEditableTextItem,
) {
  return item.type === 'rect' && item.text === undefined
    ? 'add'
    : 'replace'
}

function isCanvasRectItemStorageShape(
  value: Record<string, unknown>,
) {
  return (
    value.type === 'rect' &&
    typeof value.fill === 'string' &&
    typeof value.stroke === 'string' &&
    (value.text === undefined || typeof value.text === 'string')
  )
}

function isCanvasTextItemStorageShape(
  value: Record<string, unknown>,
) {
  return value.type === 'text' && typeof value.text === 'string'
}
