import * as z from 'zod'
import { applyPatch, type JSONPatchOperation } from 'zod-crud'
import type { CanvasItem } from './CanvasModel'
import { syncCanvasItems } from './CanvasTree'

export const CanvasItemsSchema = z.array(z.custom<CanvasItem>(isCanvasItem))

export function replaceCanvasItems(
  current: CanvasItem[],
  next: CanvasItem[],
) {
  const result = applyPatch(CanvasItemsSchema as never, current as never, [
    { op: 'replace', path: '', value: syncCanvasItems(next) },
  ])

  if (!result.result.ok) {
    throw new Error(result.result.reason ?? result.result.code)
  }

  return result.state as CanvasItem[]
}

export function applyCanvasItemsPatch(
  current: CanvasItem[],
  patch: JSONPatchOperation[],
) {
  const result = applyPatch(
    CanvasItemsSchema as never,
    current as never,
    patch,
  )

  if (!result.result.ok) {
    throw new Error(result.result.reason ?? result.result.code)
  }

  return syncCanvasItems(result.state as CanvasItem[])
}

export function canvasItemsEqual(a: CanvasItem[], b: CanvasItem[]) {
  return JSON.stringify(a) === JSON.stringify(b)
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
    isFiniteNumber(value.h)

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

  return false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
}
