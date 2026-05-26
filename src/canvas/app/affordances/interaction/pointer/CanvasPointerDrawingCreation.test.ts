import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import {
  createCanvasAffordanceConfig,
  type CanvasCreationAdapter,
} from '../../../../engine'
import { createCanvasDrawingStrokeStyleSet } from '../../../../host'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  commitCanvasPointerDrawingCreation,
  previewCanvasPointerDrawingCreation,
  startCanvasPointerDrawingCreation,
} from './CanvasPointerDrawingCreation'

describe('CanvasPointerDrawingCreation', () => {
  const drawingStyles = createCanvasDrawingStrokeStyleSet({
    marker: { stroke: '#111827', strokeWidth: 8 },
  })

  it('starts marker and highlighter gestures from the same drawing contract', () => {
    const marker = startCanvasPointerDrawingCreation({
      drawingStyles,
      input: createPointerInput(),
      pointerGesture: 'draw-marker',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
    })
    const highlight = startCanvasPointerDrawingCreation({
      drawingStyles,
      input: createPointerInput(),
      pointerGesture: 'draw-highlight',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
    })

    expect(marker).toMatchObject({
      draftStroke: {
        kind: 'marker',
        points: [{ x: 80, y: 120 }],
        stroke: '#111827',
        strokeWidth: 8,
      },
      gesture: 'draw-marker',
      interaction: {
        kind: 'draw-marker',
        points: [{ x: 80, y: 120 }],
      },
      kind: 'interaction',
    })
    expect(highlight).toMatchObject({
      draftStroke: { kind: 'highlight' },
      gesture: 'draw-highlight',
      interaction: { kind: 'draw-highlight' },
    })
  })

  it('previews enabled drawing gestures and contains disabled gestures', () => {
    const preview = previewCanvasPointerDrawingCreation({
      config: createCanvasAffordanceConfig(),
      currentScreen: { x: 40, y: 20 },
      currentWorld: { x: 40, y: 20 },
      input: createPointerInput({ shiftKey: true }),
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'draw-highlight',
        moved: false,
        pointerId: 1,
        points: [{ x: 0, y: 0 }],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        style: drawingStyles.highlight,
      },
    })
    const disabled = previewCanvasPointerDrawingCreation({
      config: createCanvasAffordanceConfig({
        gestures: { drawMarker: false },
      }),
      currentScreen: { x: 40, y: 20 },
      currentWorld: { x: 40, y: 20 },
      input: createPointerInput(),
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'draw-marker',
        moved: false,
        pointerId: 1,
        points: [{ x: 0, y: 0 }],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        style: drawingStyles.marker,
      },
    })

    expect(preview).toMatchObject({
      draftStroke: {
        kind: 'highlight',
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
        stroke: '#fde047',
      },
      interaction: {
        kind: 'draw-highlight',
        moved: true,
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
      },
      kind: 'preview',
    })
    expect(disabled).toEqual({ kind: 'none' })
  })

  it('commits drawing interactions without stealing the current selection', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    commitCanvasPointerDrawingCreation({
      commitItemsChange,
      creationAdapter,
      createId: (prefix) => `${prefix}-1`,
      interaction: {
        currentWorld: { x: 40, y: 50 },
        kind: 'draw-marker',
        moved: true,
        pointerId: 1,
        points: [{ x: 10, y: 20 }, { x: 40, y: 50 }],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
        style: drawingStyles.marker,
      },
      selection: ['selected-1'],
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          expect.objectContaining({
            id: 'marker-1',
            stroke: '#111827',
            strokeWidth: 8,
            type: 'marker',
          }),
        ],
      },
      { before: ['selected-1'], after: ['selected-1'] },
    )
  })
})

function createPointerInput(
  overrides: Partial<CanvasAppPointerInput> = {},
): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
    ...overrides,
  }
}

const creationAdapter: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({ end, id, start }) => ({
    end,
    h: Math.abs(end.y - start.y),
    id,
    opacity: 1,
    start,
    stroke: '#111827',
    strokeWidth: 2,
    type: 'arrow',
    w: Math.abs(end.x - start.x),
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
  }),
  createHighlight: ({ id, points, style }) => ({
    h: 0,
    id,
    opacity: 0.4,
    points,
    stroke: '#fde047',
    strokeWidth: 10,
    type: 'highlight',
    w: 0,
    x: 0,
    y: 0,
    ...style,
  }),
  createMarker: ({ id, points, style }) => ({
    h: 0,
    id,
    opacity: 1,
    points,
    stroke: '#475569',
    strokeWidth: 3,
    type: 'marker',
    w: 0,
    x: 0,
    y: 0,
    ...style,
  }),
  createRect: ({ bounds, id }) => ({
    fill: '#ffffff',
    id,
    stroke: '#111827',
    type: 'rect',
    ...bounds,
  }),
  createText: ({ id, point }) => ({
    editValue: 'Text',
    item: {
      h: 40,
      id,
      text: 'Text',
      type: 'text',
      w: 120,
      x: point.x,
      y: point.y,
    },
  }),
}
