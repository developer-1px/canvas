import type { ReactNode } from 'react'
import type {
  CanvasAppItemLayerAdapter,
  CanvasAppItemLayerRenderInput,
  CanvasAppStageAdapter,
  CanvasAppStageRenderInput,
} from '../rendering'
import type { CanvasAppEventInput } from '../pointer/CanvasAppPointerInput'

export type CanvasAppStageModelInput = {
  blurTextEditor: () => void
  itemLayerAdapter: CanvasAppItemLayerAdapter
  itemLayerInput: CanvasAppItemLayerRenderInput
  stageAdapter: CanvasAppStageAdapter
  stageInput: Omit<
    CanvasAppStageRenderInput,
    'children' | 'onContextMenu'
  >
}

export function renderCanvasAppStageModel({
  blurTextEditor,
  itemLayerAdapter,
  itemLayerInput,
  stageAdapter,
  stageInput,
}: CanvasAppStageModelInput) {
  const children = renderCanvasAppItemLayerSafely({
    adapter: itemLayerAdapter,
    input: {
      ...itemLayerInput,
      onItemPointerDown: (event, itemId) => {
        blurTextEditor()
        itemLayerInput.onItemPointerDown(event, itemId)
      },
    },
  })

  return renderCanvasAppStageSafely({
    adapter: stageAdapter,
    input: {
      ...stageInput,
      children,
      onCanvasPointerDown: (event) => {
        blurTextEditor()
        stageInput.onCanvasPointerDown(event)
      },
      onContextMenu: preventCanvasContextMenu,
    },
  })
}

function renderCanvasAppItemLayerSafely({
  adapter,
  input,
}: {
  adapter: CanvasAppItemLayerAdapter
  input: CanvasAppItemLayerRenderInput
}): ReactNode {
  try {
    return adapter.renderItems(input)
  } catch {
    return null
  }
}

function renderCanvasAppStageSafely({
  adapter,
  input,
}: {
  adapter: CanvasAppStageAdapter
  input: CanvasAppStageRenderInput
}): ReactNode {
  try {
    return adapter.renderStage(input)
  } catch {
    return null
  }
}

function preventCanvasContextMenu(event: CanvasAppEventInput) {
  event.preventDefault()
}
