import {
  assertCanvasStableIdRecordKeys,
  isCanvasStableId,
} from '../../core'
import type {
  CanvasCustomItem,
  CanvasItem,
} from '../model'
import { isCanvasGroupItem } from '../tree/CanvasTree'

export type CanvasCustomItemValidator = (item: CanvasCustomItem) => boolean

export type CanvasCustomItemValidators = Readonly<
  Record<string, CanvasCustomItemValidator>
>

export function assertCanvasCustomItemValidators(
  validators: CanvasCustomItemValidators,
) {
  assertCanvasStableIdRecordKeys({
    entries: validators,
    label: 'custom item validator',
  })
}

export function isCanvasCustomItem(
  item: CanvasItem,
): item is CanvasCustomItem {
  return item.type === 'custom'
}

export function isCanvasCustomItemStorageEnvelope(
  value: Record<string, unknown>,
): value is CanvasCustomItem {
  return (
    value.type === 'custom' &&
    typeof value.kind === 'string' &&
    isCanvasStableId(value.kind) &&
    typeof value.presentation === 'string' &&
    isCanvasStableId(value.presentation) &&
    typeof value.title === 'string' &&
    isJsonRecord(value.data)
  )
}

export function assertCustomCanvasItems(
  items: CanvasItem[],
  validators: CanvasCustomItemValidators,
) {
  assertCanvasCustomItemValidators(validators)

  for (const item of items) {
    if (isCanvasGroupItem(item)) {
      assertCustomCanvasItems(item.children, validators)
      continue
    }

    if (item.type !== 'custom') {
      continue
    }

    const validate = validators[item.kind]

    if (validate && !validate(item)) {
      throw new Error(`Invalid custom canvas item: ${item.kind}`)
    }
  }
}

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    Object.values(value).every(isJsonValue)
  )
}

function isJsonValue(value: unknown): boolean {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return true
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue)
  }

  return isJsonRecord(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
