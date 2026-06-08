import { describe, expect, test } from 'vitest'
import { createCanvasSceneAdapter } from './CanvasSceneAdapter'
import {
  getCanvasMoveSnap,
  type CanvasMoveSnapConfig,
} from './CanvasSnapEngine'

const snapOnlyConfig = createCanvasSnapConfig({
  gestures: {
    snapToGrid: false,
    snapToSpacing: false,
  },
})

const gridOnlyConfig = createCanvasSnapConfig({
  gestures: {
    snapToAlignment: false,
    snapToSpacing: false,
  },
})

const spacingOnlyConfig = createCanvasSnapConfig({
  gestures: {
    snapToAlignment: false,
    snapToGrid: false,
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

  test('does not snap a direct-selected child to its parent group bounds', () => {
    const scene = createCanvasSceneAdapter([
      {
        id: 'group',
        bounds: { x: 0, y: 0, w: 200, h: 120 },
        isGroup: true,
        parentId: null,
        path: [0],
      },
      {
        id: 'child',
        bounds: { x: 20, y: 20, w: 40, h: 40 },
        isGroup: false,
        parentId: 'group',
        path: [0, 0],
      },
    ])

    const snap = getCanvasMoveSnap({
      bounds: { x: 20, y: 20, w: 40, h: 40 },
      config: snapOnlyConfig,
      dx: -17,
      dy: 0,
      scene,
      selection: ['child'],
      viewport: { x: 0, y: 0, scale: 1 },
    })

    expect(snap.dx).toBe(-17)
    expect(snap.alignmentGuides).toEqual([])
  })
})

describe('CanvasSnapEngine grid and spacing', () => {
  test('uses grid snap when no object snap owns the axis', () => {
    const scene = createCanvasSceneAdapter([])

    const snap = getCanvasMoveSnap({
      bounds: { x: 0, y: 0, w: 100, h: 100 },
      config: gridOnlyConfig,
      dx: 37,
      dy: 0,
      scene,
      selection: ['selected'],
      viewport: { x: 0, y: 0, scale: 1 },
    })

    expect(snap.dx).toBe(40)
    expect(snap.dy).toBe(0)
    expect(snap.alignmentGuides).toEqual([])
    expect(snap.spacingGuides).toEqual([])
  })

  test('uses spacing snap and emits the matching guide', () => {
    const scene = createCanvasSceneAdapter([
      {
        id: 'left',
        bounds: { x: 0, y: 0, w: 100, h: 100 },
        isGroup: false,
        parentId: null,
        path: [0],
      },
      {
        id: 'right',
        bounds: { x: 300, y: 0, w: 100, h: 100 },
        isGroup: false,
        parentId: null,
        path: [1],
      },
    ])

    const snap = getCanvasMoveSnap({
      bounds: { x: 150, y: 0, w: 80, h: 100 },
      config: spacingOnlyConfig,
      dx: 6,
      dy: 0,
      scene,
      selection: ['selected'],
      viewport: { x: 0, y: 0, scale: 1 },
    })

    expect(snap.dx).toBe(10)
    expect(snap.spacingGuides).toEqual([
      {
        gap: 60,
        orientation: 'horizontal',
        segments: [
          {
            start: { x: 100, y: 50 },
            end: { x: 160, y: 50 },
          },
          {
            start: { x: 240, y: 50 },
            end: { x: 300, y: 50 },
          },
        ],
      },
    ])
  })
})

function createCanvasSnapConfig({
  gestures = {},
}: {
  gestures?: Partial<CanvasMoveSnapConfig['gestures']>
} = {}): CanvasMoveSnapConfig {
  return {
    gestures: {
      snapToAlignment: true,
      snapToGrid: true,
      snapToSpacing: true,
      ...gestures,
    },
  }
}
