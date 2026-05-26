import {
  isCanvasStableId,
  type Point,
} from '../../core'
import {
  type CanvasDrawingItem,
} from './CanvasDrawingItemGeometry'
import { isCanvasArrowRouting } from './CanvasArrowRouting'

export function isCanvasDrawingItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasDrawingItem {
  return (
    isCanvasStrokeDrawingItemStorageShape(value) ||
    isCanvasArrowDrawingItemStorageShape(value)
  )
}

function isCanvasStrokeDrawingItemStorageShape(
  value: Record<string, unknown>,
) {
  return (
    (value.type === 'marker' || value.type === 'highlight') &&
    isDrawingPointArray(value.points) &&
    typeof value.stroke === 'string' &&
    isPositiveFiniteNumber(value.strokeWidth) &&
    isOpacity(value.opacity)
  )
}

function isCanvasArrowDrawingItemStorageShape(
  value: Record<string, unknown>,
) {
  return (
    value.type === 'arrow' &&
    isPoint(value.start) &&
    isPoint(value.end) &&
    !isSamePoint(value.start, value.end) &&
    isOptionalArrowRouting(value.routing) &&
    isOptionalStableItemId(value.startAttachedTo) &&
    isOptionalStableItemId(value.endAttachedTo) &&
    typeof value.stroke === 'string' &&
    isPositiveFiniteNumber(value.strokeWidth) &&
    (value.text === undefined || typeof value.text === 'string')
  )
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

function isOptionalStableItemId(value: unknown) {
  return value === undefined ||
    (typeof value === 'string' && isCanvasStableId(value))
}

function isOptionalArrowRouting(value: unknown) {
  return value === undefined || isCanvasArrowRouting(value)
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
