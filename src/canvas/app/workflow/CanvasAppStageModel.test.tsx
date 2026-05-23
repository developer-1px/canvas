import { describe, expect, it, vi } from 'vitest'
import type {
  CanvasAppItemLayerRenderInput,
  CanvasAppStageRenderInput,
} from '../rendering'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import {
  renderCanvasAppStageModel,
  type CanvasAppStageModelInput,
} from './CanvasAppStageModel'

describe('CanvasAppStageModel', () => {
  it('renders item layer children through the stage adapter', () => {
    let stageInput: CanvasAppStageRenderInput | null = null
    const input = createStageModelInput({
      itemLayerAdapter: {
        renderItems: () => 'items',
      },
      stageAdapter: {
        renderStage: (nextInput) => {
          stageInput = nextInput
          return 'stage'
        },
      },
    })

    expect(renderCanvasAppStageModel(input)).toBe('stage')
    const renderedStageInput = expectStageInput(stageInput)

    expect(renderedStageInput.children).toBe('items')

    const preventDefault = vi.fn()
    renderedStageInput.onContextMenu({
      preventDefault,
      stopPropagation: vi.fn(),
    })

    expect(preventDefault).toHaveBeenCalledTimes(1)
  })

  it('blurs the text editor before stage and item pointer down handlers', () => {
    const calls: string[] = []
    let itemLayerInput: CanvasAppItemLayerRenderInput | null = null
    let stageInput: CanvasAppStageRenderInput | null = null
    const input = createStageModelInput({
      blurTextEditor: () => calls.push('blur'),
      itemLayerAdapter: {
        renderItems: (nextInput) => {
          itemLayerInput = nextInput
          return 'items'
        },
      },
      itemLayerInput: {
        ...createItemLayerInput(),
        onItemPointerDown: (_event, itemId) => calls.push(`item:${itemId}`),
      },
      stageAdapter: {
        renderStage: (nextInput) => {
          stageInput = nextInput
          return 'stage'
        },
      },
      stageInput: {
        ...createStageInput(),
        onCanvasPointerDown: () => calls.push('canvas'),
      },
    })

    renderCanvasAppStageModel(input)
    expectStageInput(stageInput).onCanvasPointerDown(createPointerInput())
    expectItemLayerInput(itemLayerInput).onItemPointerDown(
      createPointerInput(),
      'rect-1',
    )

    expect(calls).toEqual(['blur', 'canvas', 'blur', 'item:rect-1'])
  })

  it('contains item layer adapter failures without dropping the stage', () => {
    let stageInput: CanvasAppStageRenderInput | null = null
    const input = createStageModelInput({
      itemLayerAdapter: {
        renderItems: () => {
          throw new Error('item layer failed')
        },
      },
      stageAdapter: {
        renderStage: (nextInput) => {
          stageInput = nextInput
          return 'stage'
        },
      },
    })

    expect(renderCanvasAppStageModel(input)).toBe('stage')
    expect(expectStageInput(stageInput).children).toBeNull()
  })

  it('contains stage adapter failures', () => {
    const input = createStageModelInput({
      stageAdapter: {
        renderStage: () => {
          throw new Error('stage failed')
        },
      },
    })

    expect(renderCanvasAppStageModel(input)).toBeNull()
  })
})

function createStageModelInput(
  overrides: Partial<CanvasAppStageModelInput> = {},
): CanvasAppStageModelInput {
  return {
    blurTextEditor: vi.fn(),
    itemLayerAdapter: {
      renderItems: () => 'items',
    },
    itemLayerInput: createItemLayerInput(),
    stageAdapter: {
      renderStage: () => 'stage',
    },
    stageInput: createStageInput(),
    ...overrides,
  }
}

function createItemLayerInput(): CanvasAppItemLayerRenderInput {
  return {
    componentPresentationRenderers: {},
    customItemRenderers: {},
    getComponentPresentation: () => 'card',
    items: [],
    onItemPointerDown: vi.fn(),
    onTextDoubleClick: vi.fn(),
    outlineIds: new Set(),
    selected: new Set(),
  }
}

function createStageInput(): CanvasAppStageModelInput['stageInput'] {
  return {
    activeMode: 'select',
    gesture: 'none',
    overlays: {} as CanvasAppStageRenderInput['overlays'],
    stageElement: {
      ref: vi.fn(),
    },
    viewport: {
      scale: 1,
      x: 0,
      y: 0,
    },
    onCanvasPointerDown: vi.fn(),
    onPointerCancel: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
    onResizePointerDown: vi.fn(),
  }
}

function createPointerInput(): CanvasAppPointerInput {
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
  }
}

function expectStageInput(
  input: CanvasAppStageRenderInput | null,
): CanvasAppStageRenderInput {
  expect(input).not.toBeNull()

  return input as CanvasAppStageRenderInput
}

function expectItemLayerInput(
  input: CanvasAppItemLayerRenderInput | null,
): CanvasAppItemLayerRenderInput {
  expect(input).not.toBeNull()

  return input as CanvasAppItemLayerRenderInput
}
