import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import {
  useCanvasStampControls,
  type CanvasStampControlsModel,
} from './useCanvasStampControls'

describe('useCanvasStampControls', () => {
  it('keeps contextual reaction controls hidden without a selection anchor', () => {
    const model = renderStampControlsModel({
      itemReadModel: createReadModel(null),
      selection: [],
    })

    expect(model.visible).toBe(false)
    expect(model.anchor).toBeNull()
    expect(model.canInsertStamp).toBe(true)
  })

  it('shows contextual reaction controls when the selection has bounds', () => {
    const model = renderStampControlsModel({
      itemReadModel: createReadModel({ h: 80, w: 120, x: 10, y: 20 }),
      selection: ['rect-1'],
    })

    expect(model.visible).toBe(true)
    expect(model.anchor).toEqual({ x: 70, y: 176 })
  })
})

function renderStampControlsModel({
  itemReadModel,
  selection,
}: {
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
}) {
  let model: CanvasStampControlsModel | null = null

  function Harness() {
    model = useCanvasStampControls({
      commitItemsChange: vi.fn(),
      config: createCanvasAffordanceConfig(),
      createId: vi.fn(() => 'stamp-1'),
      itemReadModel,
      selection,
      stageElement: createStageElement(),
      viewport: { scale: 1, x: 0, y: 0 },
    })

    return null
  }

  renderToStaticMarkup(<Harness />)

  const renderedModel = model as CanvasStampControlsModel | null

  if (!renderedModel) {
    throw new Error('Expected stamp controls model to render')
  }

  return renderedModel
}

function createReadModel(
  bounds: ReturnType<CanvasAppItemReadModel['getSelectionBounds']>,
): CanvasAppItemReadModel {
  return {
    findEditableTextItem: vi.fn(() => null),
    findItem: vi.fn(() => undefined),
    getAllIds: vi.fn(() => []),
    getAllItems: vi.fn(() => []),
    getItemBounds: vi.fn(() => {
      throw new Error('Unexpected item bounds read')
    }),
    getSelection: vi.fn((ids) => ids),
    getSelectionBounds: vi.fn(() => bounds),
    getSelectedItems: vi.fn(() => []),
  }
}

function createStageElement(): CanvasAppStageElement {
  return {
    addWheelListener: vi.fn(() => () => undefined),
    capturePointer: vi.fn(),
    getRect: vi.fn(() => null),
    getScreenPoint: vi.fn(() => ({ x: 0, y: 0 })),
    getViewportCenter: vi.fn(() => ({ x: 0, y: 0 })),
    releasePointer: vi.fn(),
  }
}
