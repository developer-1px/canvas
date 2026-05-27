import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import type {
  CanvasCreationAdapter,
  CanvasSceneAdapter,
} from '../../../../engine'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import { commitCanvasPointerShapeCreation } from './CanvasPointerShapeCreation'

describe('CanvasPointerShapeCreation commits', () => {
  it('commits shape creation and owns post-create tool selection', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const setTool = vi.fn()

    commitCanvasPointerShapeCreation({
      commitItemsChange,
      creationAdapter,
      createId: (prefix) => `${prefix}-1`,
      interaction: {
        currentWorld: { x: 90, y: 100 },
        kind: 'create-shape',
        moved: true,
        pointerId: 1,
        shapeType: 'rect',
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
            shapeType: 'rect',
            type: 'shape',
          }),
        ],
      },
      { before: ['selected-1'], after: ['rect-1'] },
    )
    expect(setTool).toHaveBeenCalledWith('select')
  })


  it('commits ellipse creation through the shape creation descriptor', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)
    const setTool = vi.fn()

    commitCanvasPointerShapeCreation({
      commitItemsChange,
      creationAdapter,
      createId: (prefix) => `${prefix}-1`,
      interaction: {
        currentWorld: { x: 90, y: 100 },
        kind: 'create-shape',
        moved: true,
        pointerId: 1,
        shapeType: 'ellipse',
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
            id: 'ellipse-1',
            shapeType: 'ellipse',
            type: 'shape',
          }),
        ],
      },
      { before: ['selected-1'], after: ['ellipse-1'] },
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
            end: { x: 160, y: 90 },
            endAttachedTo: 'component-end',
            id: 'arrow-1',
            routing: 'elbow',
            start: { x: 120, y: 70 },
            startAttachedTo: 'component-start',
            type: 'arrow',
          }),
        ],
      },
      { before: [], after: ['arrow-1'] },
    )
  })

})

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
  createArrow: ({
    end,
    endAttachedTo,
    id,
    routing,
    start,
    startAttachedTo,
  }) => ({
    end,
    endAttachedTo,
    h: Math.abs(end.y - start.y),
    id,
    opacity: 1,
    routing,
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
  createShape: ({ bounds, id, shapeType }) => ({
    fill: '#ffffff',
    id,
    shapeType,
    stroke: '#111827',
    type: 'shape',
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
