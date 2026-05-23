import type { CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../model'
import {
  commitCanvasItemsPatch,
  type CanvasItemsDocument,
} from './CanvasDocument'
import type { CanvasItemValidationOptions } from './CanvasItemSchema'
import {
  createCanvasItemsChangePatch,
  type CanvasItemsChange,
} from './CanvasDocumentChangePatch'

export type { CanvasItemsChange } from './CanvasDocumentChangePatch'

export function commitCanvasItemsChange({
  change,
  currentItems,
  document,
  selection,
  validation,
}: {
  change: CanvasItemsChange
  currentItems: CanvasItem[]
  document: CanvasItemsDocument
  validation?: CanvasItemValidationOptions
  selection?: {
    after: CanvasSelectionIds
    before: CanvasSelectionIds
  }
}) {
  return commitCanvasItemsPatch({
    document,
    patch: createCanvasItemsChangePatch(currentItems, change),
    selection,
    validation,
  })
}
