import { describe, expect, test } from 'vitest'
import {
  createCanvasArrow,
  createCanvasHighlight,
  getCanvasCreatedArrowEnd,
  getCanvasCreatedHighlightBounds,
  type CanvasCreationAdapter,
} from './CanvasCreationEngine'

type CreatedItem =
  | {
      bounds: { h: number; w: number; x: number; y: number }
      id: string
      type: 'highlight'
    }
  | {
      end: { x: number; y: number }
      id: string
      start: { x: number; y: number }
      type: 'arrow'
    }
  | { id: string; type: 'rect' | 'text' }

const adapter: CanvasCreationAdapter<CreatedItem> = {
  createArrow: ({ end, id, start }) => ({
    end,
    id,
    start,
    type: 'arrow',
  }),
  createHighlight: ({ bounds, id }) => ({
    bounds,
    id,
    type: 'highlight',
  }),
  createRect: ({ id }) => ({ id, type: 'rect' }),
  createText: ({ id }) => ({
    editValue: 'Text',
    item: { id, type: 'text' },
  }),
}

describe('CanvasCreationEngine drawing tools', () => {
  test('creates highlighter bounds from a drag gesture', () => {
    expect(
      getCanvasCreatedHighlightBounds({
        currentWorld: { x: 40, y: 50 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({ x: 10, y: 20, w: 30, h: 30 })
  })

  test('creates a default highlighter when the pointer barely moves', () => {
    expect(
      createCanvasHighlight({
        adapter,
        createId: () => 'highlight-1',
        currentWorld: { x: 12, y: 22 },
        startWorld: { x: 10, y: 20 },
      }),
    ).toEqual({
      bounds: { x: 10, y: 20, w: 220, h: 42 },
      id: 'highlight-1',
      type: 'highlight',
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
})
