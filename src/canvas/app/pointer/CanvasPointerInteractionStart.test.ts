import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  createCanvasAffordanceConfig,
  type CanvasCreationAdapter,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { startCanvasPointerInteraction } from './CanvasPointerInteractionStart'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerInteractionStart', () => {
  it('starts rect creation with an initial draft rect', () => {
    const result = startCanvasPointerInteraction(createInput({
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
    const result = startCanvasPointerInteraction(createInput({
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
    const result = startCanvasPointerInteraction(createInput({
      createId: () => 'text-1',
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

  it('creates comments immediately through the comment tool', () => {
    const result = startCanvasPointerInteraction(createInput({
      createId: () => 'comment-1',
      startWorld: { x: 80, y: 120 },
      targetItemId: 'rect-1',
      tool: 'comment',
    }))

    expect(result).toMatchObject({
      capturePointer: false,
      item: {
        attachedTo: 'rect-1',
        body: 'Comment',
        id: 'comment-1',
        type: 'comment',
        x: 62,
        y: 102,
      },
      kind: 'created-item',
    })
  })

  it('does not start a missing custom creation tool', () => {
    const result = startCanvasPointerInteraction(createInput({
      customCreationTools: [],
      tool: 'custom:risk',
    }))

    expect(result).toEqual({ kind: 'none' })
  })

  it('starts marquee selection and reports whether selection should clear', () => {
    const result = startCanvasPointerInteraction(createInput({
      input: createPointerInput({ shiftKey: false }),
      selection: ['rect-1'],
      tool: 'select',
    }))
    const additiveResult = startCanvasPointerInteraction(createInput({
      input: createPointerInput({ shiftKey: true }),
      selection: ['rect-1'],
      tool: 'select',
    }))

    expect(result).toMatchObject({
      capturePointer: true,
      clearSelection: true,
      gesture: 'marquee',
      interaction: {
        additive: false,
        baseSelection: ['rect-1'],
        kind: 'marquee',
      },
      kind: 'interaction',
    })
    expect(additiveResult).toMatchObject({
      clearSelection: false,
      interaction: {
        additive: true,
        baseSelection: ['rect-1'],
        kind: 'marquee',
      },
    })
  })
})

function createInput(
  overrides: Partial<Parameters<typeof startCanvasPointerInteraction>[0]> = {},
): Parameters<typeof startCanvasPointerInteraction>[0] {
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
    selection: [],
    spaceDown: false,
    startScreen: { x: 80, y: 120 },
    startWorld: { x: 80, y: 120 },
    tool: 'select',
    viewport: { x: 0, y: 0, scale: 1 },
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
