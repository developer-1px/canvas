import { describe, expect, it, vi } from 'vitest'
import type {
  CanvasAppItemLayerRenderInput,
} from '../rendering/CanvasAppItemLayerAdapter'
import type {
  CanvasAppStageRenderInput,
} from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import {
  renderCanvasAppStageModel,
  type CanvasAppStageModelInput,
} from './CanvasAppStageModel'

describe('CanvasAppStageModel', () => {
  it('renders item layer children through the stage adapter', () => {
    let stageInput: CanvasAppStageRenderInput | null = null
    const input = createStageModelInput({
      rendering: {
        ...createRenderingModel(),
        itemLayerAdapter: {
          renderItems: () => 'items',
        },
        stageAdapter: {
          renderStage: (nextInput) => {
            stageInput = nextInput
            return 'stage'
          },
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
    const pointer = createPointerModel()
    const input = createStageModelInput({
      blurTextEditor: () => calls.push('blur'),
      pointer: {
        itemLayerHandlers: {
          ...pointer.itemLayerHandlers,
          onItemPointerDown: (_event, itemId) =>
            calls.push(`item:${itemId}`),
        },
        stageHandlers: {
          ...pointer.stageHandlers,
          onCanvasPointerDown: () => calls.push('canvas'),
        },
      },
      rendering: {
        ...createRenderingModel(),
        itemLayerAdapter: {
          renderItems: (nextInput) => {
            itemLayerInput = nextInput
            return 'items'
          },
        },
        stageAdapter: {
          renderStage: (nextInput) => {
            stageInput = nextInput
            return 'stage'
          },
        },
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
      rendering: {
        ...createRenderingModel(),
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
      },
    })

    expect(renderCanvasAppStageModel(input)).toBe('stage')
    expect(expectStageInput(stageInput).children).toBeNull()
  })

  it('contains stage adapter failures', () => {
    const input = createStageModelInput({
      rendering: {
        ...createRenderingModel(),
        stageAdapter: {
          renderStage: () => {
            throw new Error('stage failed')
          },
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
    itemLayer: createItemLayerModel(),
    pointer: createPointerModel(),
    rendering: createRenderingModel(),
    stage: createStageModel(),
    ...overrides,
  }
}

function createItemLayerModel(): CanvasAppStageModelInput['itemLayer'] {
  return {
    items: [],
    selected: new Set(),
  }
}

function createPointerModel(): CanvasAppStageModelInput['pointer'] {
  return {
    itemLayerHandlers: {
      onItemPointerDown: vi.fn(),
      onTextDoubleClick: vi.fn(),
    },
    stageHandlers: {
      onCanvasPointerDown: vi.fn(),
      onPointerCancel: vi.fn(),
      onPointerMove: vi.fn(),
      onPointerUp: vi.fn(),
      onResizePointerDown: vi.fn(),
    },
  }
}

function createRenderingModel(): CanvasAppStageModelInput['rendering'] {
  return {
    componentPresentationRenderers: {},
    customItemRenderers: {},
    getComponentPresentation: () => 'card',
    itemLayerAdapter: {
      renderItems: () => 'items',
    },
    stageAdapter: {
      renderStage: () => 'stage',
    },
  }
}

function createStageModel(): CanvasAppStageModelInput['stage'] {
  return {
    activeMode: 'select',
    gesture: 'none',
    overlays: {
      itemOutlineIds: new Set(),
    } as CanvasAppStageRenderInput['overlays'],
    stageElement: {
      ref: vi.fn(),
    },
    viewport: {
      scale: 1,
      x: 0,
      y: 0,
    },
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
