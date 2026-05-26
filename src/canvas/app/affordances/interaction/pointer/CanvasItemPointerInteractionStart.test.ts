import { describe, expect, it, vi } from 'vitest'
import type { CanvasItem } from '../../../../entities'
import {
  createCanvasAffordanceConfig,
  createCanvasSceneAdapter,
} from '../../../../engine'
import { isCanvasEditableTextItem } from '../../../../host'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import {
  startCanvasItemPointerInteraction,
  startCanvasTextEditInteraction,
} from './CanvasItemPointerInteractionStart'

const rectItem = createRectItem('rect-1')

describe('CanvasItemPointerInteractionStart', () => {
  it('starts a move interaction and commits selection for an unselected item', () => {
    const result = startCanvasItemPointerInteraction(createInput({
      selection: [],
    }))

    expect(result).toMatchObject({
      capturePointer: true,
      commitSelection: ['rect-1'],
      interaction: {
        bounds: { h: 60, w: 80, x: 0, y: 0 },
        historySelection: ['rect-1'],
        ids: ['rect-1'],
        kind: 'move',
      },
      kind: 'move',
    })
  })

  it('turns additive clicks on selected items into selection-only updates', () => {
    const result = startCanvasItemPointerInteraction(createInput({
      input: createPointerInput({ shiftKey: true }),
      selection: ['rect-1'],
    }))

    expect(result).toEqual({
      capturePointer: false,
      commitSelection: [],
      kind: 'none',
    })
  })

  it('starts alt-drag duplicate moves with cloned live items', () => {
    const clone = createRectItem('rect-copy', { x: 20 })
    const cloneItems = vi.fn(() => [clone])
    const result = startCanvasItemPointerInteraction(createInput({
      cloneItems,
      input: createPointerInput({ altKey: true }),
      selection: ['rect-1'],
    }))

    expect(cloneItems).toHaveBeenCalledWith(['rect-1'], { x: 0, y: 0 })
    expect(result).toMatchObject({
      capturePointer: true,
      interaction: {
        historySelection: ['rect-1'],
        ids: ['rect-copy'],
        kind: 'move',
      },
      kind: 'move',
      liveItems: [rectItem, clone],
      selection: ['rect-copy'],
    })
  })

  it('carries text edit state into a click-to-edit move interaction', () => {
    const textItem: CanvasItem = {
      h: 40,
      id: 'text-1',
      text: 'Hello',
      type: 'text',
      w: 120,
      x: 0,
      y: 0,
    }
    const result = startCanvasItemPointerInteraction(createInput({
      isDoubleClick: true,
      itemId: 'text-1',
      items: [textItem],
      selection: [],
    }))

    expect(result).toMatchObject({
      capturePointer: true,
      clearLastClick: true,
      commitSelection: ['text-1'],
      interaction: {
        edit: { id: 'text-1', value: 'Hello' },
        ids: ['text-1'],
        kind: 'move',
      },
      kind: 'move',
    })
  })

  it('returns selection effects without pointer capture when move is disabled', () => {
    const result = startCanvasItemPointerInteraction(createInput({
      config: createCanvasAffordanceConfig({
        gestures: { move: false },
      }),
      selection: [],
    }))

    expect(result).toEqual({
      capturePointer: false,
      commitSelection: ['rect-1'],
      kind: 'none',
    })
  })

  it('starts direct text editing for renderer text double clicks', () => {
    const result = startCanvasTextEditInteraction({
      config: createCanvasAffordanceConfig(),
      item: createRectItem('rect-1', { text: 'Label' }),
    })

    expect(result).toEqual({
      editing: { id: 'rect-1', value: 'Label' },
      kind: 'text-edit',
      selection: ['rect-1'],
      tool: 'select',
    })
  })

  it('does not start direct text editing when disabled', () => {
    const result = startCanvasTextEditInteraction({
      config: createCanvasAffordanceConfig({
        gestures: { textEdit: false },
      }),
      item: {
        h: 40,
        id: 'text-1',
        text: 'Body',
        type: 'text',
        w: 120,
        x: 0,
        y: 0,
      },
    })

    expect(result).toEqual({ kind: 'none' })
  })
})

function createInput(
  overrides: Partial<Parameters<typeof startCanvasItemPointerInteraction>[0]> = {},
): Parameters<typeof startCanvasItemPointerInteraction>[0] {
  const items = overrides.items ?? [rectItem]
  const scene = createTestCanvasScene(items)
  const itemReadModel = createTestCanvasItemReadModel(items, scene)

  return {
    cloneItems: () => [],
    config: createCanvasAffordanceConfig(),
    input: createPointerInput(),
    isDoubleClick: false,
    itemId: 'rect-1',
    itemReadModel,
    items,
    scene,
    selection: [],
    startScreen: { x: 0, y: 0 },
    startWorld: { x: 0, y: 0 },
    ...overrides,
  }
}

function createTestCanvasScene(items: CanvasItem[]) {
  return createCanvasSceneAdapter(
    items.map((item, index) => ({
      bounds: getTestCanvasItemBounds(item),
      id: item.id,
      isGroup: item.type === 'group',
      parentId: null,
      path: [index],
    })),
  )
}

function createTestCanvasItemReadModel(
  items: CanvasItem[],
  scene: ReturnType<typeof createTestCanvasScene>,
): CanvasAppItemReadModel {
  return {
    findEditableTextItem: (id) => {
      const item = items.find((item) => item.id === id)

      return item && isCanvasEditableTextItem(item) ? item : null
    },
    findItem: (id) => items.find((item) => item.id === id),
    getAllIds: () => items.map((item) => item.id),
    getAllItems: () => items,
    getItemBounds: getTestCanvasItemBounds,
    getSelection: (ids) => ids,
    getSelectionBounds: (ids) => scene.getBounds([...ids]),
    getSelectedItems: (ids) =>
      ids
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is CanvasItem => item !== undefined),
  }
}

function getTestCanvasItemBounds(item: CanvasItem) {
  return {
    h: item.h,
    w: item.w,
    x: item.x,
    y: item.y,
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
