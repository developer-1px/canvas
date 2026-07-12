import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import {
  createCanvasSceneAdapter,
  type CanvasCreationAdapter,
} from '../../../../engine'
import { createCanvasComponentLibrary } from '../../../../host'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../../../workflow/CanvasWorkflowContract'
import {
  cancelCanvasPointerInteraction,
  commitCanvasPointerInteraction,
  type CanvasPointerInteractionCommitInput,
} from './CanvasPointerInteractionLifecycle'

describe('CanvasPointerInteractionLifecycle', () => {
  it('commits created rect items and returns to the select tool', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const setTool = vi.fn()

    expect(commitCanvasPointerInteraction(createCommitInput({
      commitItemsChange,
      interaction: {
        kind: 'create-shape',
        pointerId: 1,
        shapeType: 'rect',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
        currentWorld: { x: 90, y: 100 },
        moved: true,
      },
      setTool,
    }))).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          {
            fill: '#ffffff',
            h: 80,
            id: 'rect-1',
            stroke: '#111827',
            type: 'rect',
            w: 80,
            x: 10,
            y: 20,
          },
        ],
      },
      { before: ['selected-1'], after: ['rect-1'] },
    )
    expect(setTool).toHaveBeenCalledWith('select')
  })

  it('commits move interactions from history items to current items', () => {
    const beforeItem = createRectItem('rect-1', { x: 0, y: 0 })
    const afterItem = createRectItem('rect-1', { x: 40, y: 30 })
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    expect(commitCanvasPointerInteraction(createCommitInput({
      commitItemsChange,
      interaction: {
        kind: 'move',
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        ids: ['rect-1'],
        bounds: { x: 0, y: 0, w: 80, h: 60 },
        historySelection: ['previous-selection'],
        startItems: [beforeItem],
        currentItems: [afterItem],
        historyItems: [beforeItem],
        moved: true,
      },
    }))).toBe(true)

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'transform',
        beforeItems: [beforeItem],
        afterItems: [afterItem],
      },
      { before: ['previous-selection'], after: ['rect-1'] },
    )
  })

  it('commits marquee selection through the scene adapter', () => {
    const commitSelection = vi.fn<CommitCanvasSelection>(() => true)
    const setSelection = vi.fn()

    commitCanvasPointerInteraction(createCommitInput({
      commitSelection,
      interaction: {
        kind: 'marquee',
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        currentWorld: { x: 70, y: 70 },
        additive: true,
        baseSelection: ['existing'],
        moved: true,
      },
      scene: createCanvasSceneAdapter([
        {
          bounds: { x: 20, y: 20, w: 40, h: 40 },
          id: 'rect-1',
          isGroup: false,
          parentId: null,
          path: [0],
        },
      ]),
      setSelection,
    }))

    expect(setSelection).toHaveBeenCalledWith(['existing'])
    expect(commitSelection).toHaveBeenCalledWith(['existing', 'rect-1'])
  })

  it('reports a rejected transform without applying post-commit effects', () => {
    const beforeItem = createRectItem('rect-1', { x: 0, y: 0 })
    const afterItem = createRectItem('rect-1', { x: 40, y: 30 })
    const setEditing = vi.fn()
    const setTool = vi.fn()

    expect(commitCanvasPointerInteraction(createCommitInput({
      commitItemsChange: () => false,
      interaction: {
        kind: 'move',
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        ids: ['rect-1'],
        bounds: { x: 0, y: 0, w: 80, h: 60 },
        historySelection: ['rect-1'],
        startItems: [beforeItem],
        currentItems: [afterItem],
        historyItems: [beforeItem],
        moved: true,
      },
      setEditing,
      setTool,
    }))).toBe(false)
    expect(setEditing).not.toHaveBeenCalled()
    expect(setTool).not.toHaveBeenCalled()
  })

  it('restores live items and marquee selection on cancel', () => {
    const historyItem = createRectItem('rect-1', { x: 0, y: 0 })
    const setLiveItems = vi.fn()
    const setSelection = vi.fn()

    cancelCanvasPointerInteraction({
      interaction: {
        kind: 'resize',
        pointerId: 1,
        handle: 'se',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        ids: ['rect-1'],
        bounds: { x: 0, y: 0, w: 80, h: 60 },
        startItems: [historyItem],
        currentItems: [createRectItem('rect-1', { x: 0, y: 0, w: 120 })],
        historyItems: [historyItem],
        moved: true,
      },
      setLiveItems,
      setSelection,
    })
    cancelCanvasPointerInteraction({
      interaction: {
        kind: 'marquee',
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
        currentWorld: { x: 70, y: 70 },
        additive: false,
        baseSelection: ['existing'],
        moved: true,
      },
      setLiveItems,
      setSelection,
    })

    expect(setLiveItems).toHaveBeenCalledWith([historyItem])
    expect(setSelection).toHaveBeenCalledWith(['existing'])
  })
})

function createCommitInput(
  overrides: Partial<CanvasPointerInteractionCommitInput> = {},
): CanvasPointerInteractionCommitInput {
  return {
    componentLibrary: createCanvasComponentLibrary(),
    commitItemsChange: () => true,
    commitSelection: () => true,
    creationAdapter,
    createId: (prefix) => `${prefix}-1`,
    customCreationTools: [],
    interaction: { kind: 'none' },
    scene: createCanvasSceneAdapter([]),
    selection: ['selected-1'],
    setEditing: () => undefined,
    setSelection: () => undefined,
    setTool: () => undefined,
    ...overrides,
  }
}

const creationAdapter: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({ end, id, start }) => ({
    id,
    type: 'arrow',
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
    end,
    start,
    stroke: '#111827',
    strokeWidth: 2,
    opacity: 1,
  }),
  createHighlight: ({ id, points }) => ({
    id,
    type: 'highlight',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    opacity: 0.4,
    points,
    stroke: '#fde047',
    strokeWidth: 10,
  }),
  createMarker: ({ id, points }) => ({
    id,
    type: 'marker',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    opacity: 1,
    points,
    stroke: '#475569',
    strokeWidth: 3,
  }),
  createRect: ({ bounds, id }) => ({
    id,
    type: 'rect',
    ...bounds,
    fill: '#ffffff',
    stroke: '#111827',
  }),
  createText: ({ id, point }) => ({
    item: {
      id,
      type: 'text',
      x: point.x,
      y: point.y,
      w: 120,
      h: 40,
      text: 'Text',
    },
    editValue: 'Text',
  }),
}

function createRectItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'rect' }>> = {},
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 60,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 80,
    x: 0,
    y: 0,
    ...overrides,
  }
}
