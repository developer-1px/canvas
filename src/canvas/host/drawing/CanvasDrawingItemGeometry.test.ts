import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../model'
import {
  getCanvasArrowLabelBounds,
  getCanvasDrawingItemBounds,
  isCanvasDrawingItem,
  scaleCanvasDrawingItem,
  translateCanvasArrowAttachedEndpoints,
  translateCanvasDrawingItem,
} from './CanvasDrawingItemGeometry'
import {
  normalizeCanvasArrowRouting,
  replaceCanvasArrowRoutings,
  setCanvasArrowRouting,
} from './CanvasArrowRouting'

const arrow: CanvasItem = {
  end: { x: 100, y: 90 },
  h: 74,
  id: 'arrow-1',
  start: { x: 20, y: 40 },
  stroke: '#334155',
  strokeWidth: 3,
  type: 'arrow',
  w: 104,
  x: 8,
  y: 28,
}

const marker: CanvasItem = {
  h: 44,
  id: 'marker-1',
  opacity: 1,
  points: [{ x: 20, y: 40 }, { x: 100, y: 80 }],
  stroke: '#475569',
  strokeWidth: 4,
  type: 'marker',
  w: 84,
  x: 18,
  y: 38,
}

describe('CanvasDrawingItemGeometry', () => {
  it('recognizes built-in drawing items', () => {
    expect(isCanvasDrawingItem(arrow)).toBe(true)
    expect(isCanvasDrawingItem(marker)).toBe(true)
    expect(isCanvasDrawingItem({
      fill: '#ffffff',
      h: 60,
      id: 'rect-1',
      stroke: '#111827',
      type: 'rect',
      w: 80,
      x: 0,
      y: 0,
    })).toBe(false)
  })

  it('computes drawing geometry bounds from points and endpoints', () => {
    expect(getCanvasDrawingItemBounds(marker)).toEqual({
      h: 44,
      w: 84,
      x: 18,
      y: 38,
    })
    expect(getCanvasDrawingItemBounds(arrow)).toEqual({
      h: 74,
      w: 104,
      x: 8,
      y: 28,
    })
  })

  it('normalizes connector routing values', () => {
    expect(normalizeCanvasArrowRouting('straight')).toBe('straight')
    expect(normalizeCanvasArrowRouting('elbow')).toBe('elbow')
    expect(normalizeCanvasArrowRouting(undefined)).toBe('elbow')
  })

  it('sets selected connector routing without changing geometry', () => {
    expect(setCanvasArrowRouting(arrow, 'straight')).toEqual({
      ...arrow,
      routing: 'straight',
    })
    expect(replaceCanvasArrowRoutings(
      [
        arrow,
        {
          ...marker,
          id: 'marker-2',
        },
      ],
      ['arrow-1'],
      'elbow',
    )).toEqual([
      {
        ...arrow,
        routing: 'elbow',
      },
      {
        ...marker,
        id: 'marker-2',
      },
    ])
  })

  it('includes visible connector labels in arrow bounds', () => {
    const labeledArrow = {
      ...arrow,
      end: { x: 240, y: 120 },
      start: { x: 80, y: 120 },
      text: 'A long connector label',
    }

    expect(getCanvasArrowLabelBounds(labeledArrow)).toEqual({
      h: 32,
      w: 182,
      x: 69,
      y: 104,
    })
    expect(getCanvasDrawingItemBounds(labeledArrow)).toEqual({
      h: 32,
      w: 184,
      x: 68,
      y: 104,
    })
  })

  it('places elbow connector labels away from the routed line', () => {
    const labeledArrow = {
      ...arrow,
      end: { x: 240, y: 120 },
      routing: 'elbow' as const,
      start: { x: 80, y: 120 },
      text: 'A long connector label',
    }

    expect(getCanvasArrowLabelBounds(labeledArrow)).toEqual({
      h: 32,
      w: 182,
      x: 29,
      y: 80,
    })
  })

  it('translates drawing geometry and syncs cached bounds', () => {
    expect(translateCanvasDrawingItem({
      dx: 10,
      dy: -5,
      item: marker,
    })).toEqual({
      ...marker,
      points: [{ x: 30, y: 35 }, { x: 110, y: 75 }],
      x: 28,
      y: 33,
    })
    expect(translateCanvasDrawingItem({
      dx: 10,
      dy: -5,
      item: arrow,
    })).toEqual({
      ...arrow,
      end: { x: 110, y: 85 },
      start: { x: 30, y: 35 },
      x: 18,
      y: 23,
    })
  })

  it('translates only arrow endpoints attached to moved items', () => {
    expect(translateCanvasArrowAttachedEndpoints({
      attachedIds: new Set(['component-start']),
      dx: 20,
      dy: 10,
      item: {
        ...arrow,
        endAttachedTo: 'component-end',
        startAttachedTo: 'component-start',
      },
    })).toEqual({
      ...arrow,
      endAttachedTo: 'component-end',
      h: 64,
      start: { x: 40, y: 50 },
      startAttachedTo: 'component-start',
      w: 84,
      x: 28,
      y: 38,
    })
  })

  it('scales drawing geometry and syncs cached bounds', () => {
    expect(scaleCanvasDrawingItem({
      from: { h: 80, w: 120, x: 0, y: 20 },
      item: marker,
      to: { h: 160, w: 240, x: 0, y: 20 },
    })).toEqual({
      ...marker,
      h: 88,
      points: [{ x: 38, y: 58 }, { x: 202, y: 142 }],
      w: 168,
      x: 36,
      y: 56,
    })
    expect(scaleCanvasDrawingItem({
      from: { h: 80, w: 120, x: 0, y: 20 },
      item: arrow,
      to: { h: 160, w: 240, x: 0, y: 20 },
    })).toEqual({
      ...arrow,
      end: { x: 212, y: 172 },
      h: 148,
      start: { x: 28, y: 48 },
      w: 208,
      x: 16,
      y: 36,
    })
  })
})
