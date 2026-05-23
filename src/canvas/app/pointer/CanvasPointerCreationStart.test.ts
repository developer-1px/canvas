import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  createCanvasAffordanceConfig,
  type CanvasCreationAdapter,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { startCanvasPointerCreation } from './CanvasPointerCreationStart'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerCreationStart', () => {
  it('starts rect creation with an initial draft rect', () => {
    const result = startCanvasPointerCreation(createInput({
      pointerGesture: 'create-rect',
      startWorld: { x: 80, y: 120 },
      tool: 'rect',
    }))

    expect(result).toMatchObject({
      capturePointer: true,
      draftRect: { h: 0, w: 0, x: 80, y: 120 },
      gesture: 'create-rect',
      interaction: {
        currentWorld: { x: 80, y: 120 },
        kind: 'create-rect',
        startWorld: { x: 80, y: 120 },
      },
      kind: 'interaction',
    })
  })

  it('starts drawing gestures with a draft stroke', () => {
    const result = startCanvasPointerCreation(createInput({
      pointerGesture: 'draw-marker',
      startWorld: { x: 80, y: 120 },
      tool: 'marker',
    }))

    expect(result).toMatchObject({
      capturePointer: true,
      draftStroke: {
        kind: 'marker',
        points: [{ x: 80, y: 120 }],
      },
      gesture: 'draw-marker',
      interaction: {
        kind: 'draw-marker',
        points: [{ x: 80, y: 120 }],
      },
      kind: 'interaction',
    })
  })

  it('creates text immediately without starting pointer capture', () => {
    const result = startCanvasPointerCreation(createInput({
      createId: () => 'text-1',
      pointerGesture: 'create-text',
      startWorld: { x: 80, y: 120 },
      tool: 'text',
    }))

    expect(result).toEqual({
      capturePointer: false,
      edit: { id: 'text-1', value: 'Text' },
      item: {
        h: 40,
        id: 'text-1',
        text: 'Text',
        type: 'text',
        w: 120,
        x: 80,
        y: 120,
      },
      kind: 'created-text',
    })
  })

  it('does not start a missing custom creation tool', () => {
    const result = startCanvasPointerCreation(createInput({
      customCreationTools: [],
      pointerGesture: 'create-custom',
      tool: 'custom:risk',
    }))

    expect(result).toEqual({ kind: 'none' })
  })

  it('returns null for non-creation gestures', () => {
    expect(
      startCanvasPointerCreation(createInput({ pointerGesture: 'marquee' })),
    ).toBeNull()
  })
})

function createInput(
  overrides: Partial<Parameters<typeof startCanvasPointerCreation>[0]> = {},
): Parameters<typeof startCanvasPointerCreation>[0] {
  return {
    config,
    creationAdapter,
    createId: (prefix) => `${prefix}-1`,
    customCreationTools: [
      {
        id: 'risk',
        label: '!',
        title: 'Risk',
        createItem: () => null,
      },
    ],
    input: createPointerInput(),
    pointerGesture: 'create-rect',
    startScreen: { x: 80, y: 120 },
    startWorld: { x: 80, y: 120 },
    tool: 'rect',
    ...overrides,
  }
}

function createPointerInput(
  overrides: Partial<CanvasAppPointerInput> = {},
): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 80,
    clientY: 120,
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
  createHighlight: ({ id, points }) => ({
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
  }),
  createMarker: ({ id, points }) => ({
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
