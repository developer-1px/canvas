import { describe, expect, test } from 'vitest'
import type { CanvasItem } from '../model'
import {
  canFlipCanvasSelection,
  flipCanvasSelection,
} from './CanvasItemFlipOperations'

describe('CanvasItemFlipOperations', () => {
  test('mirrors selected item positions horizontally within the selection bounds', () => {
    const items: CanvasItem[] = [
      rect('rect-1', 0, 0, 100, 40),
      rect('rect-2', 160, 0, 20, 20),
    ]

    const flipped = flipCanvasSelection(items, ['rect-1', 'rect-2'], 'horizontal')

    // selection bounds x 0..180, pivotX 90 → boxes swap sides, y untouched.
    expect(pick(flipped, 'rect-1')).toMatchObject({ x: 80, y: 0 })
    expect(pick(flipped, 'rect-2')).toMatchObject({ x: 0, y: 0 })
  })

  test('mirrors selected item positions vertically within the selection bounds', () => {
    const items: CanvasItem[] = [
      rect('rect-1', 0, 0, 40, 100),
      rect('rect-2', 0, 160, 20, 20),
    ]

    const flipped = flipCanvasSelection(items, ['rect-1', 'rect-2'], 'vertical')

    expect(pick(flipped, 'rect-1')).toMatchObject({ x: 0, y: 80 })
    expect(pick(flipped, 'rect-2')).toMatchObject({ x: 0, y: 0 })
  })

  test('reflects drawing endpoints so an arrow visibly mirrors', () => {
    const items: CanvasItem[] = [
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

    const flipped = flipCanvasSelection(items, ['arrow-1'], 'horizontal')
    const arrow = pick(flipped, 'arrow-1') as Extract<
      CanvasItem,
      { type: 'arrow' }
    >

    expect(arrow.start).toEqual({ x: 120, y: 0 })
    expect(arrow.end).toEqual({ x: 0, y: 0 })
  })

  test('reflects path segments so a vector path visibly mirrors', () => {
    const items: CanvasItem[] = [
      {
        h: 74,
        id: 'path-1',
        opacity: 1,
        segments: [
          { point: { x: 20, y: 40 }, type: 'move' },
          {
            control1: { x: 50, y: 20 },
            control2: { x: 70, y: 90 },
            point: { x: 110, y: 60 },
            type: 'cubic',
          },
        ],
        stroke: '#334155',
        strokeWidth: 4,
        type: 'path',
        w: 94,
        x: 18,
        y: 18,
      },
    ]

    const flipped = flipCanvasSelection(items, ['path-1'], 'horizontal')
    const path = pick(flipped, 'path-1') as Extract<
      CanvasItem,
      { type: 'path' }
    >

    expect(path.segments).toEqual([
      { point: { x: 110, y: 40 }, type: 'move' },
      {
        control1: { x: 80, y: 20 },
        control2: { x: 60, y: 90 },
        point: { x: 20, y: 60 },
        type: 'cubic',
      },
    ])
    expect(path).toMatchObject({ x: 18, y: 18, w: 94, h: 74 })
  })

  test('negates rotation when flipping a rotated item', () => {
    const items: CanvasItem[] = [
      { ...rect('rect-1', 0, 0, 100, 40), rotation: 30 },
    ]

    const horizontal = pick(
      flipCanvasSelection(items, ['rect-1'], 'horizontal'),
      'rect-1',
    )
    const vertical = pick(
      flipCanvasSelection(items, ['rect-1'], 'vertical'),
      'rect-1',
    )

    // horizontal: 180 − 30 = 150, vertical: −30 → 330
    expect(horizontal).toMatchObject({ rotation: 150 })
    expect(vertical).toMatchObject({ rotation: 330 })
  })

  test('blocks flipping when nothing is selectable or a target is locked', () => {
    const items: CanvasItem[] = [
      { ...rect('rect-1', 0, 0, 100, 40), locked: true },
      rect('rect-2', 160, 0, 20, 20),
    ]

    expect(canFlipCanvasSelection(items, [])).toBe(false)
    expect(canFlipCanvasSelection(items, ['rect-1'])).toBe(false)
    expect(canFlipCanvasSelection(items, ['rect-2'])).toBe(true)
    // a locked target leaves the document untouched
    expect(flipCanvasSelection(items, ['rect-1'], 'horizontal')).toEqual(items)
  })
})

function pick(items: CanvasItem[], id: string) {
  const found = items.find((item) => item.id === id)

  if (!found) {
    throw new Error(`missing ${id}`)
  }

  return found
}

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
