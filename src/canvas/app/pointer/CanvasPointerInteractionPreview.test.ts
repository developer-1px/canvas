import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../entities'
import {
  createCanvasAffordanceConfig,
  createCanvasSceneAdapter,
  type CanvasTransformAdapter,
} from '../../engine'
import { getCanvasDrawingStrokeStyle } from '../../host'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  previewCanvasPointerInteraction,
  type CanvasPointerInteractionPreviewInput,
} from './CanvasPointerInteractionPreview'

const config = createCanvasAffordanceConfig()
const rectItem = createRectItem('rect-1')

describe('CanvasPointerInteractionPreview', () => {
  it('updates live items for move previews after the drag threshold', () => {
    const result = previewCanvasPointerInteraction(createInput({
      currentScreen: { x: 50, y: 0 },
      currentWorld: { x: 50, y: 0 },
      interaction: {
        bounds: { h: 60, w: 80, x: 0, y: 0 },
        currentItems: [rectItem],
        historyItems: [rectItem],
        historySelection: ['rect-1'],
        ids: ['rect-1'],
        kind: 'move',
        moved: false,
        pointerId: 1,
        startItems: [rectItem],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
    }))

    expect(result).toMatchObject({
      interaction: {
        currentItems: [createRectItem('rect-1', { x: 50 })],
        kind: 'move',
        moved: true,
      },
      kind: 'preview',
      liveItems: [createRectItem('rect-1', { x: 50 })],
      snapGuides: {
        alignmentGuides: [],
        spacingGuides: [],
      },
    })
  })

  it('keeps move previews quiet before the drag threshold', () => {
    const result = previewCanvasPointerInteraction(createInput({
      currentScreen: { x: 1, y: 0 },
      currentWorld: { x: 1, y: 0 },
      interaction: {
        bounds: { h: 60, w: 80, x: 0, y: 0 },
        currentItems: [rectItem],
        historyItems: [rectItem],
        historySelection: ['rect-1'],
        ids: ['rect-1'],
        kind: 'move',
        moved: false,
        pointerId: 1,
        startItems: [rectItem],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
    }))

    expect(result).toEqual({ kind: 'none' })
  })

  it('previews marquee selection through the scene adapter', () => {
    const result = previewCanvasPointerInteraction(createInput({
      currentScreen: { x: 80, y: 80 },
      currentWorld: { x: 80, y: 80 },
      interaction: {
        additive: true,
        baseSelection: ['existing'],
        currentWorld: { x: 0, y: 0 },
        kind: 'marquee',
        moved: false,
        pointerId: 1,
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
      scene: createCanvasSceneAdapter([
        {
          bounds: { h: 40, w: 40, x: 20, y: 20 },
          id: 'rect-1',
          isGroup: false,
          parentId: null,
          path: [0],
        },
      ]),
    }))

    expect(result).toMatchObject({
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'marquee',
        moved: true,
      },
      kind: 'preview',
      marquee: { h: 80, w: 80, x: 0, y: 0 },
      selection: ['existing', 'rect-1'],
    })
  })

  it('previews created rects and drawing strokes', () => {
    const rectResult = previewCanvasPointerInteraction(createInput({
      currentScreen: { x: 90, y: 90 },
      currentWorld: { x: 90, y: 90 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'create-shape',
        moved: false,
        pointerId: 1,
        shape: 'rect',
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
    }))
    const drawingResult = previewCanvasPointerInteraction(createInput({
      currentScreen: { x: 40, y: 20 },
      currentWorld: { x: 40, y: 20 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'draw-marker',
        moved: false,
        pointerId: 1,
        points: [{ x: 0, y: 0 }],
        style: getCanvasDrawingStrokeStyle('marker'),
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
    }))

    expect(rectResult).toMatchObject({
      draftRect: { h: 80, shape: 'rect', w: 80, x: 0, y: 0 },
      interaction: {
        currentWorld: { x: 80, y: 80 },
        kind: 'create-shape',
        moved: true,
      },
      kind: 'preview',
    })
    expect(drawingResult).toMatchObject({
      draftStroke: {
        kind: 'marker',
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
      },
      interaction: {
        kind: 'draw-marker',
        moved: true,
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
      },
      kind: 'preview',
    })
  })

  it('previews laser pointer trails as transient overlays', () => {
    const result = previewCanvasPointerInteraction(createInput({
      currentScreen: { x: 40, y: 20 },
      currentWorld: { x: 40, y: 20 },
      interaction: {
        currentWorld: { x: 0, y: 0 },
        kind: 'laser',
        moved: false,
        pointerId: 1,
        points: [{ x: 0, y: 0 }],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 0, y: 0 },
      },
    }))

    expect(result).toMatchObject({
      interaction: {
        kind: 'laser',
        moved: true,
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
      },
      kind: 'preview',
      laserTrail: {
        points: [{ x: 0, y: 0 }, { x: 40, y: 20 }],
      },
    })
  })
})

function createInput(
  overrides: Partial<CanvasPointerInteractionPreviewInput> = {},
): CanvasPointerInteractionPreviewInput {
  return {
    config,
    currentScreen: { x: 0, y: 0 },
    currentWorld: { x: 0, y: 0 },
    input: createPointerInput(),
    interaction: { kind: 'none' },
    itemReadModel: emptyItemReadModel,
    scene: createCanvasSceneAdapter([]),
    transformAdapter,
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

const transformAdapter: CanvasTransformAdapter<CanvasItem> = {
  resizeSelection: ({ items, selection, to }) =>
    items.map((item) =>
      selection.includes(item.id)
        ? {
            ...item,
            ...to,
          }
        : item,
    ),
  translateSelection: ({ dx, dy, items, selection }) =>
    items.map((item) =>
      selection.includes(item.id)
        ? {
            ...item,
            x: item.x + dx,
            y: item.y + dy,
          }
        : item,
    ),
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

const emptyItemReadModel: CanvasAppItemReadModel = {
  findEditableTextItem: () => null,
  findItem: () => undefined,
  getAllIds: () => [],
  getAllItems: () => [],
  getItemBounds: (item) => item,
  getSelection: () => [],
  getSelectionBounds: () => null,
  getSelectedItems: () => [],
}
