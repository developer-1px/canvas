import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  createCanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasSceneAdapter,
} from '../../engine'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  commitCanvasPointerShapeCreation,
  previewCanvasPointerShapeCreation,
  startCanvasPointerShapeCreation,
} from './CanvasPointerShapeCreation'

const config = createCanvasAffordanceConfig()

describe('CanvasPointerShapeCreation', () => {
  it('starts rect and arrow creation through one shape descriptor contract', () => {
    const rect = startCanvasPointerShapeCreation({
      config,
      input: createPointerInput(),
      pointerGesture: 'create-rect',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
    })
    const arrow = startCanvasPointerShapeCreation({
      config,
      input: createPointerInput(),
      pointerGesture: 'create-arrow',
      startScreen: { x: 8, y: 12 },
      startWorld: { x: 80, y: 120 },
      targetItemId: 'component-start',
    })

    expect(rect).toMatchObject({
      draftRect: { h: 0, w: 0, x: 80, y: 120 },
      gesture: 'create-rect',
      interaction: {
        currentWorld: { x: 80, y: 120 },
        kind: 'create-rect',
        startWorld: { x: 80, y: 120 },
      },
      kind: 'interaction',
    })
    expect(arrow).toMatchObject({
      draftArrow: {
        end: { x: 80, y: 120 },
        start: { x: 80, y: 120 },
      },
      gesture: 'create-arrow',
      interaction: {
        currentWorld: { x: 80, y: 120 },
        kind: 'create-arrow',
        startAttachedTo: 'component-start',
      },
      kind: 'interaction',
    })
  })

  it('previews enabled shape creation and contains disabled shape gestures', () => {
    const preview = previewCanvasPointerShapeCreation({
      config,
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-rect',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
    })
    const disabled = previewCanvasPointerShapeCreation({
      config: createCanvasAffordanceConfig({
        gestures: { createArrow: false },
      }),
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-arrow',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
    })

    expect(preview).toMatchObject({
      draftRect: { h: 80, w: 80, x: 0, y: 0 },
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'create-rect',
        moved: true,
      },
      kind: 'preview',
    })
    expect(disabled).toEqual({ kind: 'none' })
  })

  it('commits shape creation and owns post-create tool selection', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const setTool = vi.fn()

    commitCanvasPointerShapeCreation({
      commitItemsChange,
      creationAdapter,
      createId: (prefix) => `${prefix}-1`,
      interaction: {
        currentWorld: { x: 90, y: 100 },
        kind: 'create-rect',
        moved: true,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
      },
      scene: createSceneAdapter(),
      selection: ['selected-1'],
      setTool,
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          expect.objectContaining({
            id: 'rect-1',
            type: 'rect',
          }),
        ],
      },
      { before: ['selected-1'], after: ['rect-1'] },
    )
    expect(setTool).toHaveBeenCalledWith('select')
  })

  it('commits arrow creation with endpoint attachments', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    commitCanvasPointerShapeCreation({
      commitItemsChange,
      creationAdapter,
      createId: (prefix) => `${prefix}-1`,
      interaction: {
        currentWorld: { x: 190, y: 100 },
        kind: 'create-arrow',
        moved: true,
        pointerId: 1,
        startAttachedTo: 'component-start',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
      },
      scene: createSceneAdapter(),
      selection: [],
      setTool: vi.fn(),
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          expect.objectContaining({
            endAttachedTo: 'component-end',
            id: 'arrow-1',
            startAttachedTo: 'component-start',
            type: 'arrow',
          }),
        ],
      },
      { before: [], after: ['arrow-1'] },
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

function createSceneAdapter(): CanvasSceneAdapter {
  return {
    entries: [
      {
        bounds: { h: 80, w: 120, x: 0, y: 0 },
        id: 'component-start',
        isGroup: false,
        parentId: null,
        path: [0],
      },
      {
        bounds: { h: 80, w: 120, x: 160, y: 80 },
        id: 'component-end',
        isGroup: false,
        parentId: null,
        path: [1],
      },
    ],
    getBounds: vi.fn(() => null),
    getParentId: vi.fn(() => null),
    getSelectedAncestorId: vi.fn(() => null),
    isGroup: vi.fn(() => false),
  }
}

const creationAdapter: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({ end, endAttachedTo, id, start, startAttachedTo }) => ({
    end,
    endAttachedTo,
    h: Math.abs(end.y - start.y),
    id,
    opacity: 1,
    start,
    startAttachedTo,
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
