import { describe, expect, test } from 'vitest'
import { createCanvasAffordanceConfig } from './CanvasAffordances'
import { createCanvasSceneAdapter } from './CanvasSceneAdapter'
import { getCanvasMoveSnap } from './CanvasSnapEngine'

const snapOnlyConfig = createCanvasAffordanceConfig({
  gestures: {
    snapToGrid: false,
    snapToSpacing: false,
  },
})

describe('CanvasSnapEngine alignment', () => {
  test('snaps same-kind anchors', () => {
    const scene = createCanvasSceneAdapter([
      {
        id: 'candidate',
        bounds: { x: 320, y: 48, w: 100, h: 100 },
        isGroup: false,
        parentId: null,
        path: [0],
      },
    ])

    const snap = getCanvasMoveSnap({
      bounds: { x: 0, y: 0, w: 100, h: 100 },
      config: snapOnlyConfig,
      dx: 0,
      dy: 45,
      scene,
      selection: ['selected'],
      viewport: { x: 0, y: 0, scale: 1 },
    })

    expect(snap.dy).toBe(48)
    expect(snap.alignmentGuides).toEqual([
      {
        orientation: 'horizontal',
        position: 48,
        start: 0,
        end: 420,
      },
    ])
  })

  test('does not snap cross-kind anchors', () => {
    const scene = createCanvasSceneAdapter([
      {
        id: 'candidate',
        bounds: { x: 320, y: 148, w: 100, h: 100 },
        isGroup: false,
        parentId: null,
        path: [0],
      },
    ])

    const snap = getCanvasMoveSnap({
      bounds: { x: 0, y: 0, w: 100, h: 100 },
      config: snapOnlyConfig,
      dx: 0,
      dy: 45,
      scene,
      selection: ['selected'],
      viewport: { x: 0, y: 0, scale: 1 },
    })

    expect(snap.dy).toBe(45)
    expect(snap.alignmentGuides).toEqual([])
  })
})
