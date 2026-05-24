import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import { isCanvasDrawingItemStorageShape } from './CanvasDrawingItemValidation'

const markerItem: CanvasItem = {
  h: 24,
  id: 'marker-1',
  opacity: 1,
  points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
  stroke: '#475569',
  strokeWidth: 4,
  type: 'marker',
  w: 24,
  x: 8,
  y: 18,
}

const arrowItem: CanvasItem = {
  end: { x: 240, y: 140 },
  h: 44,
  id: 'arrow-1',
  start: { x: 100, y: 120 },
  stroke: '#334155',
  strokeWidth: 3,
  type: 'arrow',
  w: 164,
  x: 88,
  y: 108,
}

describe('CanvasDrawingItemValidation', () => {
  it('accepts built-in drawing item storage shapes', () => {
    expect(isCanvasDrawingItemStorageShape(markerItem)).toBe(true)
    expect(isCanvasDrawingItemStorageShape({
      ...markerItem,
      type: 'highlight',
    })).toBe(true)
    expect(isCanvasDrawingItemStorageShape(arrowItem)).toBe(true)
  })

  it('rejects drawing strokes without visible point geometry', () => {
    expect(isCanvasDrawingItemStorageShape({
      ...markerItem,
      points: [{ x: 10, y: 20 }],
    })).toBe(false)
  })

  it('rejects arrows without visible endpoint geometry', () => {
    expect(isCanvasDrawingItemStorageShape({
      ...arrowItem,
      end: arrowItem.start,
    })).toBe(false)
  })

  it('accepts stable arrow endpoint attachment ids', () => {
    expect(isCanvasDrawingItemStorageShape({
      ...arrowItem,
      endAttachedTo: 'component-end',
      startAttachedTo: 'component-start',
    })).toBe(true)
    expect(isCanvasDrawingItemStorageShape({
      ...arrowItem,
      startAttachedTo: 'Component Start',
    })).toBe(false)
  })

  it('rejects drawing styles that cannot render predictably', () => {
    expect(isCanvasDrawingItemStorageShape({
      ...markerItem,
      strokeWidth: 0,
    })).toBe(false)
    expect(isCanvasDrawingItemStorageShape({
      ...markerItem,
      opacity: 0,
    })).toBe(false)
    expect(isCanvasDrawingItemStorageShape({
      ...markerItem,
      opacity: 2,
    })).toBe(false)
  })
})
