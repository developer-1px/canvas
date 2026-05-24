import type {
  CanvasEditableTextItem,
  CanvasItem,
  TextItem,
} from '../model'
import type { Bounds } from '../../core'
import {
  CANVAS_SECTION_COMPONENT_KIND,
  isCanvasSectionComponentItem,
} from '../component/CanvasSectionComponent'
import { isCanvasStickyComponentItem } from '../component/CanvasStickyComponent'
import {
  getCanvasArrowLabelBounds,
  isCanvasArrowDrawingItem,
} from '../drawing/CanvasDrawingItemGeometry'
import { isCanvasDrawingItemStorageShape } from '../drawing/CanvasDrawingItemValidation'

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
    isCanvasArrowDrawingItem(item) ||
    isCanvasSectionComponentItem(item) ||
    isCanvasStickyComponentItem(item)
  )
}

export function isCanvasEditableTextItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasEditableTextItem {
  return (
    isCanvasRectItemStorageShape(value) ||
    isCanvasTextItemStorageShape(value) ||
    isCanvasArrowTextItemStorageShape(value)
  )
}

export function getCanvasEditableTextValue(
  item: CanvasEditableTextItem,
) {
  if (item.type === 'component') {
    return item.component === CANVAS_SECTION_COMPONENT_KIND
      ? item.title
      : item.body ?? ''
  }

  return item.text ?? ''
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
  if (item.type === 'component') {
    return item.component === CANVAS_SECTION_COMPONENT_KIND ? 'title' : 'body'
  }

  return 'text'
}

export function getCanvasEditableTextBounds(
  item: CanvasEditableTextItem,
): Bounds {
  if (isCanvasArrowDrawingItem(item)) {
    return getCanvasArrowLabelBounds(item)
  }

  if (isCanvasSectionComponentItem(item)) {
    return {
      h: 32,
      w: Math.max(80, item.w - 24),
      x: item.x + 12,
      y: item.y + 8,
    }
  }

  return {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }
}

export function shouldCommitCanvasEditableTextOnEnter(
  item: CanvasEditableTextItem,
) {
  return !isCanvasArrowDrawingItem(item)
}

function isCanvasEditableTextPatchFieldMissing(
  item: CanvasEditableTextItem,
) {
  return (
    (item.type === 'rect' && item.text === undefined) ||
    (item.type === 'component' &&
      item.component !== CANVAS_SECTION_COMPONENT_KIND &&
      item.body === undefined) ||
    (item.type === 'arrow' && item.text === undefined)
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

function isCanvasArrowTextItemStorageShape(
  value: Record<string, unknown>,
) {
  return value.type === 'arrow' && isCanvasDrawingItemStorageShape(value)
}
