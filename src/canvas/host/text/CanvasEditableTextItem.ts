import type {
  CanvasEditableTextItem,
  CanvasItem,
  TextItem,
} from '../model'
import { isCanvasStickyComponentItem } from '../component/CanvasStickyComponent'

export type { CanvasEditableTextItem } from '../model'

export function isCanvasTextItem(item: CanvasItem): item is TextItem {
  return item.type === 'text'
}

export function isCanvasEditableTextItem(
  item: CanvasItem,
): item is CanvasEditableTextItem {
  return (
    item.type === 'rect' ||
    isCanvasTextItem(item) ||
    isCanvasStickyComponentItem(item)
  )
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
  if (item.type === 'component') {
    return item.body ?? ''
  }

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
  return isCanvasEditableTextPatchFieldMissing(item)
    ? 'add'
    : 'replace'
}

export function getCanvasEditableTextPatchField(
  item: CanvasEditableTextItem,
) {
  return item.type === 'component' ? 'body' : 'text'
}

function isCanvasEditableTextPatchFieldMissing(
  item: CanvasEditableTextItem,
) {
  return (
    (item.type === 'rect' && item.text === undefined) ||
    (item.type === 'component' && item.body === undefined)
  )
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
