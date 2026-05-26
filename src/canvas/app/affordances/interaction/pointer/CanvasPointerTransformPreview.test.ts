import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import {
  createCanvasAffordanceConfig,
  createCanvasSceneAdapter,
  type CanvasTransformAdapter,
} from '../../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  previewCanvasPointerTransform,
} from './CanvasPointerTransformPreview'

const rectItem = createRectItem('rect-1')
const arrowItem = createArrowItem('arrow-1')

describe('CanvasPointerTransformPreview', () => {
  it('updates live items for move previews after the drag threshold', () => {
    expect(previewCanvasPointerTransform(createInput({
      currentScreen: { x: 50, y: 0 },
      currentWorld: { x: 50, y: 0 },
      interaction: createMoveInteraction(),
    }))).toMatchObject({
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
    expect(previewCanvasPointerTransform(createInput({
      currentScreen: { x: 1, y: 0 },
      currentWorld: { x: 1, y: 0 },
      interaction: createMoveInteraction(),
    }))).toEqual({ kind: 'none' })
  })

  it('updates live items for resize previews after grid snapping', () => {
    expect(previewCanvasPointerTransform(createInput({
      config: createCanvasAffordanceConfig({
        gestures: { snapToGrid: false },
      }),
      currentScreen: { x: 100, y: 90 },
      currentWorld: { x: 100, y: 90 },
      interaction: {
        bounds: { h: 60, w: 80, x: 0, y: 0 },
        currentItems: [rectItem],
        handle: 'se',
        historyItems: [rectItem],
        ids: ['rect-1'],
        kind: 'resize',
        moved: false,
        pointerId: 1,
        startItems: [rectItem],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 80, y: 60 },
      },
    }))).toMatchObject({
      interaction: {
        currentItems: [createRectItem('rect-1', { h: 90, w: 100 })],
        kind: 'resize',
        moved: true,
      },
      kind: 'preview',
      liveItems: [createRectItem('rect-1', { h: 90, w: 100 })],
    })
  })

  it('updates arrow endpoint handles and reanchors connected targets', () => {
    expect(previewCanvasPointerTransform(createInput({
      currentScreen: { x: 230, y: 50 },
      currentWorld: { x: 230, y: 50 },
      interaction: {
        arrowId: 'arrow-1',
        currentItems: [arrowItem, createRectItem('rect-1', {
          h: 80,
          w: 120,
          x: 220,
          y: 20,
        })],
        currentWorld: { x: 100, y: 50 },
        endpoint: 'end',
        historyItems: [arrowItem],
        kind: 'arrow-endpoint',
        moved: false,
        pointerId: 1,
        startItems: [arrowItem, createRectItem('rect-1', {
          h: 80,
          w: 120,
          x: 220,
          y: 20,
        })],
        startScreen: { x: 0, y: 0 },
        startWorld: { x: 100, y: 50 },
      },
      scene: createCanvasSceneAdapter([
        {
          bounds: { h: 80, w: 120, x: 220, y: 20 },
          id: 'rect-1',
          isGroup: false,
          parentId: null,
          path: [1],
        },
      ]),
    }))).toMatchObject({
      interaction: {
        currentItems: [
          {
            end: { x: 220, y: 56.666666666666664 },
            endAttachedTo: 'rect-1',
            id: 'arrow-1',
            start: { x: 100, y: 50 },
            type: 'arrow',
          },
          expect.objectContaining({ id: 'rect-1' }),
        ],
        kind: 'arrow-endpoint',
        moved: true,
      },
      kind: 'preview',
    })
  })
})

function createInput(
  overrides: Partial<Parameters<typeof previewCanvasPointerTransform>[0]> = {},
): Parameters<typeof previewCanvasPointerTransform>[0] {
  return {
    config: createCanvasAffordanceConfig(),
    currentScreen: { x: 0, y: 0 },
    currentWorld: { x: 0, y: 0 },
    input: createPointerInput(),
    interaction: createMoveInteraction(),
    scene: createCanvasSceneAdapter([]),
    transformAdapter,
    viewport: { x: 0, y: 0, scale: 1 },
    ...overrides,
  }
}

function createMoveInteraction(): Extract<
  Parameters<typeof previewCanvasPointerTransform>[0]['interaction'],
  { kind: 'move' }
> {
  return {
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
    preventDefault: () => undefined,
    shiftKey: false,
    stopPropagation: () => undefined,
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

function createArrowItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'arrow' }>> = {},
): Extract<CanvasItem, { type: 'arrow' }> {
  return {
    end: { x: 180, y: 50 },
    h: 24,
    id,
    start: { x: 100, y: 50 },
    stroke: '#334155',
    strokeWidth: 3,
    type: 'arrow',
    w: 104,
    x: 88,
    y: 38,
    ...overrides,
  }
}
