import type { CanvasSelectionIds } from '../../core'
import type { CanvasItem } from '../model'
import {
  commitCanvasItemsPatch,
  type CanvasItemsDocument,
} from './CanvasDocument'
import type { CanvasItemValidationOptions } from './CanvasItemSchema'
import type { CanvasItemTextTarget } from '../text/CanvasWhiteboardTextTarget'
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
  textTarget,
  validation,
}: {
  change: CanvasItemsChange
  currentItems: CanvasItem[]
  document: CanvasItemsDocument
  textTarget?: CanvasItemTextTarget
  validation?: CanvasItemValidationOptions
  selection?: {
    after: CanvasSelectionIds
    before: CanvasSelectionIds
  }
}) {
  return commitCanvasItemsPatch({
    document,
    patch: createCanvasItemsChangePatch(currentItems, change, textTarget),
    selection,
    validation,
  })
}
