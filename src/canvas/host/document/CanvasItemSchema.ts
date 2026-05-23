import * as z from 'zod'
import {
  isCanvasStableId,
  type Point,
} from '../../core'
import type { CanvasItem } from '../model'
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

  if (value.type === 'rect') {
    return (
      typeof value.fill === 'string' &&
      typeof value.stroke === 'string' &&
      (value.text === undefined || typeof value.text === 'string')
    )
  }

  if (value.type === 'text') {
    return typeof value.text === 'string'
  }

  if (value.type === 'marker' || value.type === 'highlight') {
    return (
      isDrawingPointArray(value.points) &&
      typeof value.stroke === 'string' &&
      isPositiveFiniteNumber(value.strokeWidth) &&
      isOpacity(value.opacity)
    )
  }

  if (value.type === 'arrow') {
    return (
      isPoint(value.start) &&
      isPoint(value.end) &&
      !isSamePoint(value.start, value.end) &&
      typeof value.stroke === 'string' &&
      isPositiveFiniteNumber(value.strokeWidth)
    )
  }

  if (value.type === 'group') {
    return Array.isArray(value.children) && value.children.every(isCanvasItem)
  }

  if (value.type === 'component') {
    return (
      typeof value.component === 'string' &&
      isCanvasStableId(value.component) &&
      typeof value.title === 'string' &&
      typeof value.fill === 'string' &&
      typeof value.stroke === 'string' &&
      typeof value.accent === 'string' &&
      (value.body === undefined || typeof value.body === 'string') &&
      (value.items === undefined || isStringArray(value.items)) &&
      (value.columns === undefined || isStringArray(value.columns))
    )
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

function isPositiveFiniteNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

function isOpacity(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0 && value <= 1
}

function isPoint(value: unknown): value is Point {
  return (
    isRecord(value) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y)
  )
}

function isPointArray(value: unknown): value is Point[] {
  return Array.isArray(value) && value.every(isPoint)
}

function isDrawingPointArray(value: unknown): value is Point[] {
  return isPointArray(value) && value.length >= 2
}

function isSamePoint(left: Point, right: Point) {
  return left.x === right.x && left.y === right.y
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}
