import { describe, expect, it } from 'vitest'
import type {
  CanvasShapeItem,
  RectItem,
} from '../model'
import {
  getCanvasShapeKind,
  setCanvasShapeKind,
} from './CanvasShapeItem'

describe('CanvasShapeItem', () => {
  it('replaces shape item variants through one host helper', () => {
    const item: CanvasShapeItem = {
      fill: '#ffffff',
      h: 80,
      id: 'shape-1',
      shapeType: 'rect',
      stroke: '#111111',
      type: 'shape',
      w: 120,
      x: 10,
      y: 20,
    }

    const next = setCanvasShapeKind(item, 'diamond')

    expect(next).toEqual({
      ...item,
      shapeType: 'diamond',
    })
    expect(getCanvasShapeKind(next)).toBe('diamond')
  })

  it('preserves legacy rect storage while replacing variants', () => {
    const item: RectItem = {
      fill: '#ffffff',
      h: 80,
      id: 'rect-1',
      stroke: '#111111',
      type: 'rect',
      w: 120,
      x: 10,
      y: 20,
    }

    const next = setCanvasShapeKind(item, 'ellipse')

    expect(next).toEqual({
      ...item,
      shape: 'ellipse',
    })
    expect(getCanvasShapeKind(next)).toBe('ellipse')
  })
})
