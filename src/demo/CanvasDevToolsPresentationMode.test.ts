import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../canvas'
import {
  getCanvasPresentationFrames,
  getNextCanvasPresentationFrameIndex,
} from './CanvasDevToolsPresentationMode'

describe('CanvasDevToolsPresentationMode', () => {
  it('derives a deterministic top-to-bottom section path', () => {
    expect(getCanvasPresentationFrames([
      section({ id: 'b', x: 120, y: 80 }),
      shape('shape'),
      section({ id: 'c', x: 40, y: 80 }),
      section({ id: 'a', x: 0, y: 20 }),
    ]).map((frame) => frame.id)).toEqual(['a', 'c', 'b'])
  })

  it('has a stable no-section fallback and wraps navigation', () => {
    expect(getCanvasPresentationFrames([shape('shape')])).toEqual([])
    expect(getNextCanvasPresentationFrameIndex({
      current: 0,
      direction: 1,
      length: 0,
    })).toBe(0)
    expect(getNextCanvasPresentationFrameIndex({
      current: 0,
      direction: -1,
      length: 3,
    })).toBe(2)
    expect(getNextCanvasPresentationFrameIndex({
      current: 2,
      direction: 1,
      length: 3,
    })).toBe(0)
  })
})

function section({
  id,
  x,
  y,
}: {
  id: string
  x: number
  y: number
}): CanvasItem {
  return {
    accent: '#2563eb',
    body: '',
    component: 'section',
    fill: '#f8fafc',
    h: 100,
    id,
    stroke: '#94a3b8',
    title: id,
    type: 'component',
    w: 200,
    x,
    y,
  }
}

function shape(id: string): CanvasItem {
  return {
    fill: '#fff',
    h: 40,
    id,
    shapeType: 'rect',
    stroke: '#111',
    text: id,
    type: 'shape',
    w: 80,
    x: 0,
    y: 0,
  }
}
