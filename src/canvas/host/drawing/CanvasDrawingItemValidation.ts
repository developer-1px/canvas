import {
  isCanvasStableId,
  type Point,
} from '../../core'
import {
  type CanvasDrawingItem,
} from './CanvasDrawingItemGeometry'
import type { CanvasPathSegment } from '../model'
import { isCanvasArrowRouting } from './CanvasArrowRouting'
import {
  isOptionalCanvasItemFontSize,
  isOptionalCanvasItemOpacity,
  isOptionalCanvasItemTextAlign,
  isCanvasItemOpacity,
  isCanvasItemStrokeWidth,
} from '../style/CanvasItemStyleValidation'

export function isCanvasDrawingItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasDrawingItem {
  return (
    isCanvasStrokeDrawingItemStorageShape(value) ||
    isCanvasPathDrawingItemStorageShape(value) ||
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
    isStrokeWidth(value.strokeWidth) &&
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
    isOptionalArrowhead(value.arrowhead) &&
    isOptionalArrowRouting(value.routing) &&
    isOptionalStableItemId(value.startAttachedTo) &&
    isOptionalStableItemId(value.endAttachedTo) &&
    isOptionalCanvasItemFontSize(value.fontSize) &&
    isOptionalCanvasItemOpacity(value.opacity) &&
    typeof value.stroke === 'string' &&
    isStrokeWidth(value.strokeWidth) &&
    (value.text === undefined || typeof value.text === 'string') &&
    isOptionalCanvasItemTextAlign(value.textAlign)
  )
}

function isCanvasPathDrawingItemStorageShape(
  value: Record<string, unknown>,
) {
  return (
    value.type === 'path' &&
    isDrawingPathSegmentArray(value.segments) &&
    typeof value.stroke === 'string' &&
    isStrokeWidth(value.strokeWidth) &&
    isOpacity(value.opacity) &&
    (value.fill === undefined || typeof value.fill === 'string')
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isStrokeWidth(value: unknown): value is number {
  return isCanvasItemStrokeWidth(value)
}

function isOpacity(value: unknown): value is number {
  return isCanvasItemOpacity(value)
}

function isOptionalStableItemId(value: unknown) {
  return value === undefined ||
    (typeof value === 'string' && isCanvasStableId(value))
}

function isOptionalArrowRouting(value: unknown) {
  return value === undefined || isCanvasArrowRouting(value)
}

function isOptionalArrowhead(value: unknown) {
  return value === undefined || value === 'end' || value === 'none'
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

function isDrawingPathSegmentArray(
  value: unknown,
): value is CanvasPathSegment[] {
  if (!Array.isArray(value) || value.length < 2) {
    return false
  }

  const [first] = value

  return (
    isCanvasPathMoveSegment(first) &&
    value.every(isCanvasPathSegment) &&
    hasVisiblePathGeometry(value)
  )
}

function isCanvasPathSegment(value: unknown): value is CanvasPathSegment {
  return (
    isCanvasPathMoveSegment(value) ||
    isCanvasPathLineSegment(value) ||
    isCanvasPathCubicSegment(value)
  )
}

function isCanvasPathMoveSegment(
  value: unknown,
): value is Extract<CanvasPathSegment, { type: 'move' }> {
  return (
    isRecord(value) &&
    value.type === 'move' &&
    isPoint(value.point)
  )
}

function isCanvasPathLineSegment(
  value: unknown,
): value is Extract<CanvasPathSegment, { type: 'line' }> {
  return (
    isRecord(value) &&
    value.type === 'line' &&
    isPoint(value.point)
  )
}

function isCanvasPathCubicSegment(
  value: unknown,
): value is Extract<CanvasPathSegment, { type: 'cubic' }> {
  return (
    isRecord(value) &&
    value.type === 'cubic' &&
    isPoint(value.control1) &&
    isPoint(value.control2) &&
    isPoint(value.point)
  )
}

function hasVisiblePathGeometry(
  segments: readonly CanvasPathSegment[],
) {
  const [first] = segments

  if (!isCanvasPathMoveSegment(first)) {
    return false
  }

  return segments.slice(1).some((segment) => {
    if (!isCanvasPathSegment(segment)) {
      return false
    }

    if (!isSamePoint(segment.point, first.point)) {
      return true
    }

    return segment.type === 'cubic' &&
      (!isSamePoint(segment.control1, first.point) ||
        !isSamePoint(segment.control2, first.point))
  })
}

function isSamePoint(left: Point, right: Point) {
  return left.x === right.x && left.y === right.y
}
