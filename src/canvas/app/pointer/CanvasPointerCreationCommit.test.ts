import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import type {
  CanvasCreationAdapter,
  CanvasSceneAdapter,
} from '../../engine'
import {
  createCanvasComponentLibrary,
  getCanvasDrawingStrokeStyle,
} from '../../host'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import {
  commitCanvasPointerCreation,
  type CanvasPointerCreationCommitInput,
} from './CanvasPointerCreationCommit'

describe('CanvasPointerCreationCommit', () => {
  it('commits rect creation and returns to the select tool', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const setTool = vi.fn()

    commitCanvasPointerCreation(createInput({
      commitItemsChange,
      interaction: {
        kind: 'create-rect',
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
        currentWorld: { x: 90, y: 100 },
        moved: true,
      },
      setTool,
    }))

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

  it('commits drawing items without changing tool or selection', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const setTool = vi.fn()

    commitCanvasPointerCreation(createInput({
      commitItemsChange,
      interaction: {
        kind: 'draw-marker',
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
        currentWorld: { x: 40, y: 50 },
        points: [{ x: 10, y: 20 }, { x: 40, y: 50 }],
        style: getCanvasDrawingStrokeStyle('marker'),
        moved: true,
      },
      setTool,
    }))

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          expect.objectContaining({
            id: 'marker-1',
            type: 'marker',
          }),
        ],
      },
      { before: ['selected-1'], after: ['selected-1'] },
    )
    expect(setTool).not.toHaveBeenCalled()
  })

  it('delegates custom creation to the registered custom tool', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    commitCanvasPointerCreation(createInput({
      commitItemsChange,
      customCreationTools: [
        {
          id: 'risk',
          label: 'Risk',
          title: 'Risk',
          createItem: ({ createId }) => ({
            id: createId('risk'),
            type: 'custom',
            kind: 'risk',
            presentation: 'risk-node',
            title: 'Risk',
            x: 10,
            y: 20,
            w: 120,
            h: 80,
            data: { severity: 'high' },
          }),
        },
      ],
      interaction: {
        kind: 'create-custom',
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 10, y: 20 },
        currentWorld: { x: 90, y: 100 },
        moved: true,
        tool: 'custom:risk',
      },
    }))

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          expect.objectContaining({
            id: 'risk-1',
            kind: 'risk',
            type: 'custom',
          }),
        ],
      },
      { before: ['selected-1'], after: ['risk-1'] },
    )
  })

  it('commits drag-sized section components and returns to select', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const setTool = vi.fn()

    commitCanvasPointerCreation(createInput({
      commitItemsChange,
      interaction: {
        currentWorld: { x: 420, y: 360 },
        kind: 'create-section',
        moved: true,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 120, y: 80 },
      },
      setTool,
    }))

    expect(commitItemsChange).toHaveBeenCalledWith(
      {
        type: 'add',
        items: [
          expect.objectContaining({
            component: 'section',
            h: 280,
            id: 'component-1',
            title: 'Section',
            type: 'component',
            w: 300,
            x: 120,
            y: 80,
          }),
        ],
      },
      { before: ['selected-1'], after: ['component-1'] },
    )
    expect(setTool).toHaveBeenCalledWith('select')
  })
})

function createInput(
  overrides: Partial<CanvasPointerCreationCommitInput> = {},
): CanvasPointerCreationCommitInput {
  return {
    componentLibrary: createCanvasComponentLibrary(),
    commitItemsChange: () => true,
    creationAdapter,
    createId: (prefix) => `${prefix}-1`,
    customCreationTools: [],
    interaction: {
      kind: 'create-arrow',
      pointerId: 1,
      startScreen: { x: 0, y: 0 },
      startWorld: { x: 0, y: 0 },
      currentWorld: { x: 40, y: 40 },
      moved: true,
    },
    selection: ['selected-1'],
    scene: createSceneAdapter(),
    setTool: () => undefined,
    ...overrides,
  }
}

const creationAdapter: CanvasCreationAdapter<CanvasItem> = {
  createArrow: ({ end, endAttachedTo, id, start, startAttachedTo }) => ({
    id,
    type: 'arrow',
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
    end,
    endAttachedTo,
    start,
    startAttachedTo,
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

function createSceneAdapter(): CanvasSceneAdapter {
  return {
    entries: [],
    getBounds: vi.fn(() => null),
    getParentId: vi.fn(() => null),
    getSelectedAncestorId: vi.fn(() => null),
    isGroup: vi.fn(() => false),
  }
}
