import * as z from 'zod'
import { isCanvasCommentItemStorageShape } from '../comment/CanvasCommentItem'
import { isCanvasComponentItemStorageShape } from '../component/CanvasComponentItemValidation'
import { isCanvasDrawingItemStorageShape } from '../drawing/CanvasDrawingItemValidation'
import { isCanvasImageItemStorageShape } from '../image/CanvasImageItem'
import type { CanvasItem } from '../model'
import { isCanvasStampItemStorageShape } from '../stamp/CanvasStampItem'
import { isCanvasEditableTextItemStorageShape } from '../text/CanvasEditableTextItem'
import { isCanvasGroupItemStorageShape } from '../tree/CanvasGroupItem'
import { syncCanvasItems } from '../tree/CanvasTree'
import {
  assertCanvasCustomItemValidators,
  assertCustomCanvasItems,
  isCanvasCustomItemStorageEnvelope,
  type CanvasCustomItemValidators,
} from './CanvasCustomItemValidation'

export const CanvasItemsSchema = z.array(z.custom<CanvasItem>(isCanvasItem))

export type {
  CanvasCustomItemValidator,
  CanvasCustomItemValidators,
} from './CanvasCustomItemValidation'

export type CanvasItemValidationOptions = {
  customItemValidators?: CanvasCustomItemValidators
}

export function validateCanvasItems(
  items: CanvasItem[],
  options: CanvasItemValidationOptions = {},
) {
  const customItemValidators = options.customItemValidators ?? {}

  assertCanvasCustomItemValidators(customItemValidators)

  const syncedItems = syncCanvasItems(items)
  const parsed = CanvasItemsSchema.safeParse(syncedItems)

  if (!parsed.success) {
    throw parsed.error
  }

  assertCustomCanvasItems(parsed.data, customItemValidators)

  return parsed.data
}

function isCanvasItem(value: unknown): value is CanvasItem {
  if (!isRecord(value)) {
    return false
  }

  const base =
    typeof value.id === 'string' &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.w) &&
    isFiniteNumber(value.h) &&
    (value.locked === undefined || typeof value.locked === 'boolean')

  if (!base) {
    return false
  }

  if (isCanvasEditableTextItemStorageShape(value)) {
    return true
  }

  if (isCanvasImageItemStorageShape(value)) {
    return true
  }

  if (isCanvasCommentItemStorageShape(value)) {
    return true
  }

  if (isCanvasStampItemStorageShape(value)) {
    return true
  }

  if (isCanvasDrawingItemStorageShape(value)) {
    return true
  }

  if (isCanvasGroupItemStorageShape(value, isCanvasItem)) {
    return true
  }

  if (isCanvasComponentItemStorageShape(value)) {
    return true
  }

  if (value.type === 'custom') {
    return isCanvasCustomItemStorageEnvelope(value)
  }

  return false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
