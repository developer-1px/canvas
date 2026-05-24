import { isCanvasStableId } from '../../core'
import type { CanvasComponentItem } from '../model'
import { isCanvasLinkPreviewUrl } from './CanvasLinkPreviewComponent'

export function isCanvasComponentItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasComponentItem {
  return (
    value.type === 'component' &&
    typeof value.component === 'string' &&
    isCanvasStableId(value.component) &&
    typeof value.title === 'string' &&
    typeof value.fill === 'string' &&
    typeof value.stroke === 'string' &&
    typeof value.accent === 'string' &&
    (value.body === undefined || typeof value.body === 'string') &&
    (value.items === undefined || isStringArray(value.items)) &&
    (value.columns === undefined || isStringArray(value.columns)) &&
    (value.url === undefined ||
      (typeof value.url === 'string' && isCanvasLinkPreviewUrl(value.url)))
  )
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}
