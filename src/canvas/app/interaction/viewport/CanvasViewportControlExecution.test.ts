import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  fitBoundsIntoViewport,
  INITIAL_VIEWPORT,
  zoomViewport,
} from '../../../core'
import type {
  CanvasAppStageElement,
  CanvasAppStageRect,
} from '../../stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'
import {
  fitCanvasViewportToItems,
  resetCanvasViewport,
  type CanvasViewportSetter,
  zoomCanvasViewportBy,
} from './CanvasViewportControlExecution'

describe('CanvasViewportControlExecution', () => {
  it('fits the viewport to the provided item ids', () => {
    const bounds = { h: 50, w: 100, x: 10, y: 20 }
    const rect = createRect()
    const itemReadModel = createItemReadModel({
      allIds: ['item-1', 'item-2'],
      bounds,
    })
    const setViewport = vi.fn<CanvasViewportSetter>()

    fitCanvasViewportToItems({
      ids: ['item-2'],
      itemReadModel,
      setViewport,
      stageElement: createStageElement(rect),
    })

    expect(itemReadModel.getAllIds).not.toHaveBeenCalled()
    expect(itemReadModel.getSelectionBounds).toHaveBeenCalledWith(['item-2'])
    expect(setViewport).toHaveBeenCalledWith(
      fitBoundsIntoViewport(bounds, rect),
    )
  })

  it('fits the viewport to every item when ids are omitted or empty', () => {
    const itemReadModel = createItemReadModel({
      allIds: ['item-1', 'item-2'],
      bounds: { h: 50, w: 100, x: 10, y: 20 },
    })
    const setViewport = vi.fn<CanvasViewportSetter>()

    fitCanvasViewportToItems({
      itemReadModel,
      setViewport,
      stageElement: createStageElement(createRect()),
    })
    fitCanvasViewportToItems({
      ids: [],
      itemReadModel,
      setViewport,
      stageElement: createStageElement(createRect()),
    })

    expect(itemReadModel.getAllIds).toHaveBeenCalledTimes(2)
    expect(itemReadModel.getSelectionBounds).toHaveBeenNthCalledWith(
      1,
      ['item-1', 'item-2'],
    )
    expect(itemReadModel.getSelectionBounds).toHaveBeenNthCalledWith(
      2,
      ['item-1', 'item-2'],
    )
  })

  it('ignores fit requests when bounds or stage rect are missing', () => {
    const missingBoundsSetViewport = vi.fn<CanvasViewportSetter>()
    const missingRectSetViewport = vi.fn<CanvasViewportSetter>()

    fitCanvasViewportToItems({
      ids: ['item-1'],
      itemReadModel: createItemReadModel({
        allIds: ['item-1'],
        bounds: null,
      }),
      setViewport: missingBoundsSetViewport,
      stageElement: createStageElement(createRect()),
    })
    fitCanvasViewportToItems({
      ids: ['item-1'],
      itemReadModel: createItemReadModel({
        allIds: ['item-1'],
        bounds: { h: 50, w: 100, x: 10, y: 20 },
      }),
      setViewport: missingRectSetViewport,
      stageElement: createStageElement(null),
    })

    expect(missingBoundsSetViewport).not.toHaveBeenCalled()
    expect(missingRectSetViewport).not.toHaveBeenCalled()
  })

  it('resets the viewport to the initial viewport contract', () => {
    const setViewport = vi.fn<CanvasViewportSetter>()

    resetCanvasViewport({ setViewport })

    expect(setViewport).toHaveBeenCalledWith(INITIAL_VIEWPORT)
  })

  it('zooms around the mounted stage center', () => {
    const setViewport = vi.fn<CanvasViewportSetter>()
    const currentViewport = { scale: 1, x: 10, y: 20 }

    zoomCanvasViewportBy({
      multiplier: 1.5,
      setViewport,
      stageElement: createStageElement(createRect()),
    })

    const viewportUpdate = setViewport.mock.calls[0][0]

    if (typeof viewportUpdate !== 'function') {
      throw new Error('expected viewport updater')
    }

    expect(viewportUpdate(currentViewport)).toEqual(
      zoomViewport(currentViewport, { x: 250, y: 150 }, 1.5),
    )
  })

  it('ignores zoom requests when the stage rect is missing', () => {
    const setViewport = vi.fn<CanvasViewportSetter>()

    zoomCanvasViewportBy({
      multiplier: 1.5,
      setViewport,
      stageElement: createStageElement(null),
    })

    expect(setViewport).not.toHaveBeenCalled()
  })
})

function createItemReadModel({
  allIds,
  bounds,
}: {
  allIds: string[]
  bounds: ReturnType<CanvasAppItemReadModel['getSelectionBounds']>
}): CanvasAppItemReadModel {
  return {
    getAllIds: vi.fn(() => allIds),
    getSelectionBounds: vi.fn(() => bounds),
  } as unknown as CanvasAppItemReadModel
}

function createRect(): CanvasAppStageRect {
  return {
    height: 300,
    left: 0,
    top: 0,
    width: 500,
  }
}

function createStageElement(
  rect: CanvasAppStageRect | null,
): CanvasAppStageElement {
  return {
    addWheelListener: vi.fn(() => () => undefined),
    capturePointer: vi.fn(),
    getRect: vi.fn(() => rect),
    getScreenPoint: vi.fn(() => ({ x: 0, y: 0 })),
    getViewportCenter: vi.fn(() => null),
    releasePointer: vi.fn(),
  }
}
