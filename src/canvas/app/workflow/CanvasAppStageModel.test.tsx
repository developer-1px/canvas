import {
  isValidElement,
  type ReactElement,
} from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CanvasInlineTextEditingContext } from '../affordances/editing/text-editor/CanvasInlineTextEditingContext'
import type {
  CanvasAppItemLayerRenderInput,
  CanvasAppStageRenderInput,
} from '../rendering/CanvasAppRenderingContracts'
import type { CanvasAppPointerInput } from '../affordances/interaction/pointer/CanvasAppPointerInput'
import {
  createCanvasAppStageExternalOverlaySlot,
  renderCanvasAppStageModel,
  type CanvasAppStageModelInput,
} from './CanvasAppStageModel'

describe('CanvasAppStageModel', () => {
  it('renders product external overlays after the canvas stage', () => {
    const slot = createCanvasAppStageExternalOverlaySlot(
      <div className="canvas-stage">Stage</div>,
    )

    const markup = renderToStaticMarkup(
      <>
        {slot.render(<div className="product-overlay">Overlay</div>)}
      </>,
    )

    expect(markup).toContain(
      '<div class="canvas-stage">Stage</div><div class="product-overlay">Overlay</div>',
    )
  })

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

    expect(
      expectInlineTextEditingProvider(renderedStageInput.children).props
        .children,
    ).toBe('items')

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
    const cursorChat = createCursorChatModel({
      onPointerDown: () => calls.push('cursor-down'),
      onPointerMove: () => calls.push('cursor-move'),
    })
    const emote = createEmoteModel({
      onPointerDown: () => {
        calls.push('emote-down')
        return false
      },
      onPointerMove: () => calls.push('emote-move'),
    })
    const input = createStageModelInput({
      blurTextEditor: () => calls.push('blur'),
      cursorChat,
      emote,
      pointer: {
        itemLayerHandlers: {
          ...pointer.itemLayerHandlers,
          onArrowEndpointPointerDown: (_event, itemId, endpoint) =>
            calls.push(`arrow:${itemId}:${endpoint}`),
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
    expectStageInput(stageInput).onPointerMove(createPointerInput())
    expectStageInput(stageInput).onCanvasPointerDown(createPointerInput())
    expectItemLayerInput(itemLayerInput).onItemPointerDown(
      createPointerInput(),
      'rect-1',
    )
    expectItemLayerInput(itemLayerInput).onArrowEndpointPointerDown(
      createPointerInput(),
      'arrow-1',
      'end',
    )

    expect(calls).toEqual([
      'cursor-move',
      'emote-move',
      'cursor-down',
      'emote-down',
      'blur',
      'canvas',
      'cursor-down',
      'blur',
      'item:rect-1',
      'cursor-down',
      'blur',
      'arrow:arrow-1:end',
    ])
  })

  it('lets transient emotes consume canvas pointer down before document handlers', () => {
    const calls: string[] = []
    let stageInput: CanvasAppStageRenderInput | null = null
    const input = createStageModelInput({
      blurTextEditor: () => calls.push('blur'),
      emote: createEmoteModel({
        onPointerDown: () => {
          calls.push('emote-down')
          return true
        },
      }),
      pointer: {
        ...createPointerModel(),
        stageHandlers: {
          ...createPointerModel().stageHandlers,
          onCanvasPointerDown: () => calls.push('canvas'),
        },
      },
      rendering: {
        ...createRenderingModel(),
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

    expect(calls).toEqual(['emote-down', 'blur'])
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
    cursorChat: createCursorChatModel(),
    emote: createEmoteModel(),
    inlineTextEditor: createInlineTextEditorModel(),
    itemLayer: createItemLayerModel(),
    pointer: createPointerModel(),
    rendering: createRenderingModel(),
    stage: createStageModel(),
    ...overrides,
  }
}

function expectInlineTextEditingProvider(
  value: unknown,
): ReactElement<{ children?: unknown }> {
  if (!isValidElement(value)) {
    throw new Error('Expected inline text editing provider')
  }

  expect(value.type).toBe(CanvasInlineTextEditingContext.Provider)

  return value as ReactElement<{ children?: unknown }>
}

function createInlineTextEditorModel(): CanvasAppStageModelInput['inlineTextEditor'] {
  return {
    commitOnEnter: true,
    editing: null,
    enabled: true,
    setEditorElement: vi.fn(),
    onBlur: vi.fn(),
    onCancel: vi.fn(),
    onChange: vi.fn(),
    onCommit: vi.fn(),
  }
}

function createCursorChatModel(
  overrides: Partial<CanvasAppStageModelInput['cursorChat']> = {},
): CanvasAppStageModelInput['cursorChat'] {
  return {
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    ...overrides,
  }
}

function createEmoteModel(
  overrides: Partial<CanvasAppStageModelInput['emote']> = {},
): CanvasAppStageModelInput['emote'] {
  return {
    onPointerDown: vi.fn(() => false),
    onPointerMove: vi.fn(),
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
      onArrowEndpointPointerDown: vi.fn(),
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
