import * as z from 'zod'
import type { CanvasItem } from '../../entities'
import { syncCanvasItems } from '../tree/CanvasTree'

export const CanvasItemsSchema = z.array(z.custom<CanvasItem>(isCanvasItem))

export function validateCanvasItems(items: CanvasItem[]) {
  const parsed = CanvasItemsSchema.safeParse(syncCanvasItems(items))

  if (!parsed.success) {
    throw parsed.error
  }

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

  if (value.type === 'group') {
    return Array.isArray(value.children) && value.children.every(isCanvasItem)
  }

  if (value.type === 'component') {
    return (
      typeof value.component === 'string' &&
      typeof value.title === 'string' &&
      typeof value.fill === 'string' &&
      typeof value.stroke === 'string' &&
      typeof value.accent === 'string' &&
      (value.body === undefined || typeof value.body === 'string') &&
      (value.items === undefined || isStringArray(value.items)) &&
      (value.columns === undefined || isStringArray(value.columns))
    )
  }

  return false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}
