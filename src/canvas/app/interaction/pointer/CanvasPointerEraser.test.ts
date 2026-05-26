import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../entities'
import {
  createCanvasAffordanceConfig,
  createCanvasSceneAdapter,
} from '../../../engine'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import { getCanvasEraserHitItemIds } from './CanvasEraserHitTesting'
import {
  commitCanvasPointerEraserInteraction,
  previewCanvasPointerEraserInteraction,
  startCanvasPointerEraserInteraction,
} from './CanvasPointerEraser'

const marker = createMarkerItem('marker-1', [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
])
const farMarker = createMarkerItem('marker-2', [
  { x: 0, y: 80 },
  { x: 100, y: 80 },
])
const rect = createRectItem('rect-1')
const items = [marker, farMarker, rect]
const itemReadModel: CanvasAppItemReadModel = {
  findEditableTextItem: () => null,
  findItem: (id) => items.find((item) => item.id === id),
  getAllIds: () => items.map((item) => item.id),
  getAllItems: () => items,
  getItemBounds: (item) => item,
  getSelection: (ids) => ids,
  getSelectionBounds: () => null,
  getSelectedItems: (ids) => items.filter((item) => ids.includes(item.id)),
}
const scene = createCanvasSceneAdapter([
  {
    bounds: marker,
    id: marker.id,
    isGroup: false,
    parentId: null,
    path: [0],
  },
  {
    bounds: farMarker,
    id: farMarker.id,
    isGroup: false,
    parentId: null,
    path: [1],
  },
  {
    bounds: rect,
    id: rect.id,
    isGroup: false,
    parentId: null,
    path: [2],
  },
])

describe('CanvasPointerEraser', () => {
  it('finds freehand strokes touched by the eraser path', () => {
    expect(getCanvasEraserHitItemIds({
      itemReadModel,
      points: [{ x: 50, y: 6 }],
      radius: 6,
      scene,
    })).toEqual(['marker-1'])

    expect(getCanvasEraserHitItemIds({
      itemReadModel,
      points: [{ x: 50, y: 40 }],
      radius: 6,
      scene,
    })).toEqual([])
  })

  it('starts from the built-in eraser gesture without selecting objects', () => {
    const result = startCanvasPointerEraserInteraction({
      config: createCanvasAffordanceConfig(),
      input: createPointerInput(),
      itemReadModel,
      pointerGesture: 'erase',
      scene,
      startScreen: { x: 50, y: 6 },
      startWorld: { x: 50, y: 6 },
    })

    expect(result).toMatchObject({
      capturePointer: true,
      gesture: 'erase',
      interaction: {
        erasedIds: ['marker-1'],
        kind: 'erase',
        points: [{ x: 50, y: 6 }],
      },
      kind: 'interaction',
    })
  })

  it('previews accumulated eraser hits across the drag path', () => {
    const result = previewCanvasPointerEraserInteraction({
      config: createCanvasAffordanceConfig(),
      currentScreen: { x: 50, y: 86 },
      currentWorld: { x: 50, y: 86 },
      interaction: {
        currentWorld: { x: 50, y: 6 },
        erasedIds: ['marker-1'],
        kind: 'erase',
        moved: false,
        pointerId: 1,
        points: [{ x: 50, y: 6 }],
        startScreen: { x: 50, y: 6 },
        startWorld: { x: 50, y: 6 },
      },
      itemReadModel,
      scene,
    })

    expect(result).toMatchObject({
      interaction: {
        erasedIds: ['marker-1', 'marker-2'],
        kind: 'erase',
        moved: true,
      },
      kind: 'preview',
    })
    expect(result?.kind === 'preview' ? result.interaction.points[0] : null)
      .toEqual({ x: 50, y: 6 })
    expect(result?.kind === 'preview'
      ? result.interaction.points.at(-1)
      : null).toEqual({ x: 50, y: 86 })
    expect(result?.kind === 'preview' ? result.interaction.points.length : 0)
      .toBeGreaterThan(2)
  })

  it('samples between sparse pointer events so quick eraser drags still hit strokes', () => {
    const result = previewCanvasPointerEraserInteraction({
      config: createCanvasAffordanceConfig(),
      currentScreen: { x: 50, y: 40 },
      currentWorld: { x: 50, y: 40 },
      interaction: {
        currentWorld: { x: 50, y: -40 },
        erasedIds: [],
        kind: 'erase',
        moved: false,
        pointerId: 1,
        points: [{ x: 50, y: -40 }],
        startScreen: { x: 50, y: -40 },
        startWorld: { x: 50, y: -40 },
      },
      itemReadModel,
      scene,
    })

    expect(result).toMatchObject({
      interaction: {
        erasedIds: ['marker-1'],
      },
      kind: 'preview',
    })
  })

  it('commits eraser hits as a remove-selection document change', () => {
    const commitItemsChange = vi.fn<CommitCanvasItemsChange>(() => true)

    commitCanvasPointerEraserInteraction({
      commitItemsChange,
      interaction: {
        currentWorld: { x: 50, y: 86 },
        erasedIds: ['marker-1', 'marker-2'],
        kind: 'erase',
        moved: true,
        pointerId: 1,
        points: [{ x: 50, y: 6 }, { x: 50, y: 86 }],
        startScreen: { x: 50, y: 6 },
        startWorld: { x: 50, y: 6 },
      },
      selection: ['marker-1', 'rect-1'],
    })

    expect(commitItemsChange).toHaveBeenCalledWith(
      { selection: ['marker-1', 'marker-2'], type: 'remove-selection' },
      { before: ['marker-1', 'rect-1'], after: ['rect-1'] },
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

function createMarkerItem(
  id: string,
  points: Extract<CanvasItem, { type: 'marker' }>['points'],
): Extract<CanvasItem, { type: 'marker' }> {
  return {
    h: 8,
    id,
    opacity: 1,
    points,
    stroke: '#111827',
    strokeWidth: 4,
    type: 'marker',
    w: 100,
    x: 0,
    y: points[0]?.y ?? 0,
  }
}

function createRectItem(id: string): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111827',
    type: 'rect',
    w: 40,
    x: 0,
    y: 0,
  }
}
