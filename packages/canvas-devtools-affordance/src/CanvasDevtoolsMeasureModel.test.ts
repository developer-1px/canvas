import { describe, expect, it } from 'vitest'
import type {
  CanvasItem,
  Viewport,
} from '@interactive-os/canvas'
import {
  createCanvasDevtoolsMeasureSnapshot,
} from './CanvasDevtoolsMeasureModel'

const VIEWPORT: Viewport = {
  scale: 1.5,
  x: 20,
  y: 40,
}

describe('CanvasDevtoolsMeasureModel', () => {
  it('returns an empty snapshot with no selected items', () => {
    const snapshot = createCanvasDevtoolsMeasureSnapshot({
      items: [createRect('rect-1', { h: 80, w: 120, x: 10, y: 20 })],
      selectedItemIds: [],
      viewport: VIEWPORT,
    })

    expect(snapshot.selectedBounds).toBeNull()
    expect(snapshot.selectedItems).toEqual([])
    expect(snapshot.distances).toEqual([])
  })

  it('measures one selected item', () => {
    const snapshot = createCanvasDevtoolsMeasureSnapshot({
      items: [createRect('rect-1', { h: 80, w: 120, x: 10, y: 20 })],
      selectedItemIds: ['rect-1'],
      viewport: VIEWPORT,
    })

    expect(snapshot.selectedItems).toEqual([{
      bounds: { h: 80, w: 120, x: 10, y: 20 },
      id: 'rect-1',
      type: 'rect',
    }])
    expect(snapshot.selectedBounds).toEqual({ h: 80, w: 120, x: 10, y: 20 })
    expect(snapshot.distances).toEqual([])
  })

  it('measures combined bounds and nearest axis distances for multiple selected items', () => {
    const snapshot = createCanvasDevtoolsMeasureSnapshot({
      items: [
        createRect('left', { h: 60, w: 100, x: 10, y: 20 }),
        createRect('right', { h: 50, w: 80, x: 160, y: 30 }),
        createRect('bottom', { h: 40, w: 90, x: 20, y: 120 }),
      ],
      selectedItemIds: ['left', 'right', 'bottom'],
      viewport: VIEWPORT,
    })

    expect(snapshot.selectedBounds).toEqual({
      h: 140,
      w: 230,
      x: 10,
      y: 20,
    })
    expect(snapshot.distances).toEqual([
      {
        axis: 'x',
        end: { x: 160, y: 55 },
        fromItemId: 'left',
        gap: 50,
        start: { x: 110, y: 55 },
        toItemId: 'right',
      },
      {
        axis: 'y',
        end: { x: 65, y: 120 },
        fromItemId: 'left',
        gap: 40,
        start: { x: 65, y: 80 },
        toItemId: 'bottom',
      },
    ])
  })

  it('ignores stale selection ids', () => {
    const snapshot = createCanvasDevtoolsMeasureSnapshot({
      items: [createRect('rect-1', { h: 80, w: 120, x: 10, y: 20 })],
      selectedItemIds: ['missing', 'rect-1'],
      viewport: VIEWPORT,
    })

    expect(snapshot.selectedItems.map((item) => item.id)).toEqual(['rect-1'])
    expect(snapshot.selectedBounds).toEqual({ h: 80, w: 120, x: 10, y: 20 })
  })

  it('preserves viewport in the snapshot', () => {
    const snapshot = createCanvasDevtoolsMeasureSnapshot({
      items: [createRect('rect-1', { h: 80, w: 120, x: 10, y: 20 })],
      selectedItemIds: ['rect-1'],
      viewport: VIEWPORT,
    })

    expect(snapshot.viewport).toBe(VIEWPORT)
  })
})

function createRect(
  id: string,
  bounds: {
    h: number
    w: number
    x: number
    y: number
  },
): CanvasItem {
  return {
    fill: '#ffffff',
    id,
    stroke: '#111111',
    type: 'rect',
    ...bounds,
  }
}
