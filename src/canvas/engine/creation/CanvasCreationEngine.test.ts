import { describe, expect, test } from 'vitest'
import {
  createCanvasArrow,
  createCanvasHighlight,
  createCanvasMarker,
  createCanvasPath,
  createCanvasRect,
  createCanvasShape,
  getCanvasCreatedArrowEnd,
  getCanvasCreatedDrawingPoints,
  getCanvasCreatedPathSegments,
  getCanvasCreatedRectBounds,
  type CanvasCreationAdapter,
} from './CanvasCreationEngine'

type CreatedItem =
  | {
      id: string
      points: Array<{ x: number; y: number }>
      style?: {
        opacity: number
        stroke: string
        strokeWidth: number
      }
      type: 'highlight' | 'marker'
    }
  | {
      id: string
      segments: ReturnType<typeof getCanvasCreatedPathSegments>
      style?: {
        opacity: number
        stroke: string
        strokeWidth: number
      }
      type: 'path'
    }
  | {
      end: { x: number; y: number }
      id: string
      routing?: 'elbow' | 'straight'
      start: { x: number; y: number }
      type: 'arrow'
    }
  | {
      id: string
      shape?: 'diamond' | 'ellipse' | 'rect'
      shapeType?: 'diamond' | 'ellipse' | 'rect'
      type: 'rect' | 'shape' | 'text'
    }

const adapter: CanvasCreationAdapter<CreatedItem> = {
  createArrow: ({ end, id, routing, start }) => ({
    end,
    id,
    routing,
    start,
    type: 'arrow',
  }),
  createHighlight: ({ id, points, style }) => ({
    id,
    points,
    style,
    type: 'highlight',
  }),
  createMarker: ({ id, points, style }) => ({
    id,
    points,
    style,
    type: 'marker',
  }),
  createPath: ({ id, segments, style }) => ({
    id,
    segments,
    style,
    type: 'path',
  }),
  createShape: ({ id, shapeType }) => ({ id, shapeType, type: 'shape' }),
  createText: ({ id }) => ({
    editValue: 'Text',
    item: { id, type: 'text' },
  }),
}

describe('CanvasCreationEngine drawing tools', () => {
  test('keeps drawing points from a drag gesture', () => {
    expect(
      getCanvasCreatedDrawingPoints({
        points: [{ x: 10, y: 20 }, { x: 40, y: 50 }],
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual([{ x: 10, y: 20 }, { x: 40, y: 50 }])
  })

  test('creates a default highlighter stroke when the pointer barely moves', () => {
    expect(
      createCanvasHighlight({
        adapter,
        createId: () => 'highlight-1',
        points: [{ x: 10, y: 20 }],
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      id: 'highlight-1',
      points: [{ x: 10, y: 20 }, { x: 90, y: 20 }],
      type: 'highlight',
    })
  })

  test('creates marker strokes with the FigJam marker flow', () => {
    expect(
      createCanvasMarker({
        adapter,
        createId: () => 'marker-1',
        points: [{ x: 10, y: 20 }, { x: 16, y: 22 }],
        startWorld: { x: 10, y: 20 },
        style: {
          opacity: 1,
          stroke: '#111827',
          strokeWidth: 8,
        },
      }),
    ).toEqual({
      id: 'marker-1',
      points: [{ x: 10, y: 20 }, { x: 16, y: 22 }],
      style: {
        opacity: 1,
        stroke: '#111827',
        strokeWidth: 8,
      },
      type: 'marker',
    })
  })

  test('creates typed cubic path segments for pen paths', () => {
    expect(
      getCanvasCreatedPathSegments({
        points: [
          { x: 10, y: 20 },
          { x: 40, y: 5 },
          { x: 70, y: 55 },
          { x: 100, y: 40 },
        ],
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual([
      { point: { x: 10, y: 20 }, type: 'move' },
      {
        control1: { x: 40, y: 5 },
        control2: { x: 70, y: 55 },
        point: { x: 100, y: 40 },
        type: 'cubic',
      },
    ])
    expect(
      createCanvasPath({
        adapter,
        createId: () => 'path-1',
        points: [{ x: 10, y: 20 }, { x: 40, y: 50 }],
        startWorld: { x: 10, y: 20 },
        style: {
          opacity: 1,
          stroke: '#334155',
          strokeWidth: 3,
        },
      }),
    ).toEqual({
      id: 'path-1',
      segments: [
        { point: { x: 10, y: 20 }, type: 'move' },
        { point: { x: 40, y: 50 }, type: 'line' },
      ],
      style: {
        opacity: 1,
        stroke: '#334155',
        strokeWidth: 3,
      },
      type: 'path',
    })
  })

  test('creates an arrow from start to end points', () => {
    expect(
      createCanvasArrow({
        adapter,
        createId: () => 'arrow-1',
        currentWorld: { x: 80, y: 90 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      end: { x: 80, y: 90 },
      id: 'arrow-1',
      routing: 'elbow',
      start: { x: 10, y: 20 },
      type: 'arrow',
    })
  })

  test('creates a default arrow when the pointer barely moves', () => {
    expect(
      getCanvasCreatedArrowEnd({
        currentWorld: { x: 12, y: 22 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({ x: 154, y: 20 })
  })

  test('creates ellipse shapes through the shape creation adapter seam', () => {
    expect(
      createCanvasShape({
        adapter,
        createId: (prefix) => `${prefix}-1`,
        currentWorld: { x: 90, y: 100 },
        shapeType: 'ellipse',
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      id: 'ellipse-1',
      shapeType: 'ellipse',
      type: 'shape',
    })
  })

  test('uses the default rect size when the pointer barely moves', () => {
    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 12, y: 22 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 112,
      w: 168,
      x: 10,
      y: 20,
    })
  })

  test('accepts host-provided default rect size and drag threshold', () => {
    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 13, y: 23 },
        defaultSize: { h: 120, w: 360 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 120,
      w: 360,
      x: 10,
      y: 20,
    })

    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 18, y: 29 },
        dragThreshold: 12,
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 112,
      w: 168,
      x: 10,
      y: 20,
    })

    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 18, y: 29 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 9,
      w: 8,
      x: 10,
      y: 20,
    })
  })

  test('keeps createCanvasRect as a compatibility wrapper', () => {
    expect(
      createCanvasRect({
        adapter,
        createId: (prefix) => `${prefix}-1`,
        currentWorld: { x: 90, y: 100 },
        shape: 'diamond',
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      id: 'diamond-1',
      shapeType: 'diamond',
      type: 'shape',
    })
  })
})
