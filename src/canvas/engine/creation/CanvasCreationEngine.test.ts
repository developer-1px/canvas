import { describe, expect, test } from 'vitest'
import {
  createCanvasArrow,
  createCanvasHighlight,
  createCanvasMarker,
  createCanvasPath,
  createCanvasRect,
  createCanvasShape,
  getCanvasAngleConstrainedLineEndPoint,
  getCanvasAspectLockedCreationPoint,
  getCanvasCenterOutCreationPoints,
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
      bounds?: { h: number; w: number; x: number; y: number }
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
  createShape: ({ bounds, id, shapeType }) => ({
    bounds,
    id,
    shapeType,
    type: 'shape',
  }),
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

  test('constrains created arrow endpoints to 45 degree increments', () => {
    const horizontal = getCanvasAngleConstrainedLineEndPoint({
      currentWorld: { x: 92, y: 51 },
      startWorld: { x: 10, y: 20 },
    })

    expect(horizontal.x).toBeGreaterThan(97)
    expect(horizontal.y).toBeCloseTo(20)

    const diagonal = getCanvasAngleConstrainedLineEndPoint({
      currentWorld: { x: 40, y: 60 },
      startWorld: { x: 10, y: 20 },
    })

    expect(diagonal.x).toBeCloseTo(45.35533905932738)
    expect(diagonal.y).toBeCloseTo(55.35533905932738)

    const vertical = getCanvasAngleConstrainedLineEndPoint({
      currentWorld: { x: 30, y: 80 },
      startWorld: { x: 10, y: 20 },
    })

    expect(vertical.x).toBeCloseTo(10)
    expect(vertical.y).toBeCloseTo(83.24555320336759)
  })

  test('applies angle constraint to arrow creation only after drag threshold', () => {
    const constrained = getCanvasCreatedArrowEnd({
      constrainAngle: true,
      currentWorld: { x: 92, y: 51 },
      startWorld: { x: 10, y: 20 },
    })

    expect(constrained.x).toBeCloseTo(97.66413177340314)
    expect(constrained.y).toBeCloseTo(20)

    expect(
      getCanvasCreatedArrowEnd({
        constrainAngle: true,
        currentWorld: { x: 12, y: 22 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({ x: 154, y: 20 })

    const arrow = createCanvasArrow({
      adapter,
      constrainAngle: true,
      createId: () => 'arrow-1',
      currentWorld: { x: 92, y: 51 },
      startWorld: { x: 10, y: 20 },
    })

    expect(arrow).toMatchObject({
      id: 'arrow-1',
      routing: 'elbow',
      start: { x: 10, y: 20 },
      type: 'arrow',
    })
    expect(arrow.end.x).toBeCloseTo(97.66413177340314)
    expect(arrow.end.y).toBeCloseTo(20)
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
      bounds: {
        h: 80,
        w: 80,
        x: 10,
        y: 20,
      },
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

  test('preserves aspect ratio for dragged rect creation only', () => {
    expect(
      getCanvasAspectLockedCreationPoint({
        currentWorld: { x: 38, y: 29 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      x: 38,
      y: 48,
    })

    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 38, y: 29 },
        preserveAspectRatio: true,
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 28,
      w: 28,
      x: 10,
      y: 20,
    })

    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 12, y: 22 },
        preserveAspectRatio: true,
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 112,
      w: 168,
      x: 10,
      y: 20,
    })
  })

  test('preserves aspect ratio across negative creation directions', () => {
    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 12, y: 21 },
        preserveAspectRatio: true,
        startWorld: { x: 30, y: 40 },
      }),
    ).toEqual({
      h: 19,
      w: 19,
      x: 11,
      y: 21,
    })
  })

  test('creates rect bounds from the pointer start as center', () => {
    expect(
      getCanvasCenterOutCreationPoints({
        currentWorld: { x: 38, y: 29 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      current: { x: 38, y: 29 },
      start: { x: -18, y: 11 },
    })

    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 38, y: 29 },
        resizeFromCenter: true,
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 18,
      w: 56,
      x: -18,
      y: 11,
    })

    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 12, y: 21 },
        resizeFromCenter: true,
        startWorld: { x: 30, y: 40 },
      }),
    ).toEqual({
      h: 38,
      w: 36,
      x: 12,
      y: 21,
    })
  })

  test('centers default rect bounds when center creation barely moves', () => {
    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 12, y: 22 },
        resizeFromCenter: true,
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 112,
      w: 168,
      x: -74,
      y: -36,
    })
  })

  test('combines aspect-locked and center-out rect creation', () => {
    expect(
      getCanvasCreatedRectBounds({
        currentWorld: { x: 38, y: 29 },
        preserveAspectRatio: true,
        resizeFromCenter: true,
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      h: 56,
      w: 56,
      x: -18,
      y: -8,
    })

    expect(
      createCanvasShape({
        adapter,
        createId: (prefix) => `${prefix}-1`,
        currentWorld: { x: 38, y: 29 },
        preserveAspectRatio: true,
        resizeFromCenter: true,
        shapeType: 'ellipse',
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      bounds: {
        h: 56,
        w: 56,
        x: -18,
        y: -8,
      },
      id: 'ellipse-1',
      shapeType: 'ellipse',
      type: 'shape',
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
      bounds: {
        h: 80,
        w: 80,
        x: 10,
        y: 20,
      },
      id: 'diamond-1',
      shapeType: 'diamond',
      type: 'shape',
    })
  })
})
