import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import {
  canResizeCanvasItem,
  canRotateCanvasSelection,
  getCanvasRotatedBounds,
  normalizeCanvasItemRotation,
  resetCanvasSelectionRotation,
  rotateCanvasSelection,
} from './CanvasItemRotationOperations'

describe('CanvasItemRotationOperations', () => {
  test('normalizes rotation degrees into the storage range', () => {
    expect(normalizeCanvasItemRotation(375)).toBe(15)
    expect(normalizeCanvasItemRotation(-15)).toBe(345)
    expect(normalizeCanvasItemRotation(Number.NaN)).toBe(0)
  })

  test('computes visual bounds from local bounds and rotation', () => {
    expect(
      getCanvasRotatedBounds({ x: 0, y: 0, w: 100, h: 40 }, 90),
    ).toEqual({
      h: 100,
      w: 40,
      x: 30,
      y: -30,
    })
  })

  test('rotates selected bounded leaf items and syncs parent group bounds', () => {
    const items: CanvasItem[] = [
      {
        children: [
          rect('rect-1', 0, 0, 100, 40),
          rect('rect-2', 160, 0, 20, 20),
        ],
        h: 40,
        id: 'group-1',
        type: 'group',
        w: 180,
        x: 0,
        y: 0,
      },
    ]

    expect(canRotateCanvasSelection(items, ['rect-1'])).toBe(true)
    expect(rotateCanvasSelection(items, ['rect-1'], 90)).toEqual([
      {
        children: [
          {
            ...rect('rect-1', 0, 0, 100, 40),
            rotation: 90,
          },
          rect('rect-2', 160, 0, 20, 20),
        ],
        h: 100,
        id: 'group-1',
        type: 'group',
        w: 150,
        x: 30,
        y: -30,
      },
    ])
  })

  test('excludes unsupported items and rotated selections from transform scopes', () => {
    const items: CanvasItem[] = [
      rect('rect-1', 0, 0, 100, 40),
      {
        end: { x: 120, y: 0 },
        h: 1,
        id: 'arrow-1',
        start: { x: 0, y: 0 },
        stroke: '#111827',
        strokeWidth: 2,
        type: 'arrow',
        w: 120,
        x: 0,
        y: 0,
      },
    ]
    const rotated = rotateCanvasSelection(items, ['rect-1'], 15)

    expect(canRotateCanvasSelection(items, ['arrow-1'])).toBe(false)
    expect(canResizeCanvasItem(rotated[0])).toBe(false)
    expect(resetCanvasSelectionRotation(rotated, ['rect-1'])[0])
      .not.toHaveProperty('rotation')
  })
})

function rect(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h,
    id,
    stroke: '#111827',
    type: 'rect',
    w,
    x,
    y,
  }
}
