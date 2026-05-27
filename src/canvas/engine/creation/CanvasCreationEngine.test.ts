import { describe, expect, test } from 'vitest'
import {
  createCanvasArrow,
  createCanvasHighlight,
  createCanvasMarker,
  createCanvasRect,
  createCanvasShape,
  getCanvasCreatedArrowEnd,
  getCanvasCreatedDrawingPoints,
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
