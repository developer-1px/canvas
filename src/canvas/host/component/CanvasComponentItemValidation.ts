import { isCanvasStableId } from '../../core'
import type { CanvasComponentItem } from '../model'
import {
  isCanvasLinkPreviewOrientation,
  isCanvasLinkPreviewUrl,
} from './CanvasLinkPreviewComponent'
import {
  isOptionalCanvasItemFontSize,
  isOptionalCanvasItemOpacity,
  isOptionalCanvasItemTextAlign,
} from '../style/CanvasItemStyleValidation'

export function isCanvasComponentItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasComponentItem {
  return (
    value.type === 'component' &&
    typeof value.component === 'string' &&
    isCanvasStableId(value.component) &&
    typeof value.title === 'string' &&
    typeof value.fill === 'string' &&
    isOptionalCanvasItemFontSize(value.fontSize) &&
    isOptionalCanvasItemOpacity(value.opacity) &&
    typeof value.stroke === 'string' &&
    isOptionalCanvasItemTextAlign(value.textAlign) &&
    typeof value.accent === 'string' &&
    (value.body === undefined || typeof value.body === 'string') &&
    (value.checkedItems === undefined ||
      isCanvasComponentCheckedItemArray(value.checkedItems)) &&
    (value.items === undefined || isStringArray(value.items)) &&
    (value.columns === undefined || isStringArray(value.columns)) &&
    (value.orientation === undefined ||
      isCanvasLinkPreviewOrientation(value.orientation)) &&
    (value.url === undefined ||
      (typeof value.url === 'string' && isCanvasLinkPreviewUrl(value.url)))
  )
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

function isCanvasComponentCheckedItemArray(value: unknown) {
  return Array.isArray(value) &&
    value.every((entry) =>
      typeof entry === 'number' && Number.isInteger(entry) && entry >= 0,
    )
}
