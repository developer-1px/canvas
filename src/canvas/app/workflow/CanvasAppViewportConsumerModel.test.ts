import { describe, expect, it, vi } from 'vitest'
import { getCanvasAppViewportConsumerModel } from './CanvasAppViewportConsumerModel'

describe('CanvasAppViewportConsumerModel', () => {
  it('builds control viewport handlers from runtime controls', () => {
    const viewportControls = createViewportControls()
    const model = getCanvasAppViewportConsumerModel(viewportControls)

    model.control.onFitItems(['item-1'])
    model.control.onViewportReset()
    model.control.onZoomBy(1.25)

    expect(viewportControls.fitToItems).toHaveBeenCalledWith(['item-1'])
    expect(viewportControls.resetViewport).toHaveBeenCalledTimes(1)
    expect(viewportControls.zoomBy).toHaveBeenCalledWith(1.25)
  })

  it('builds keyboard viewport handlers without control naming', () => {
    const viewportControls = createViewportControls()
    const model = getCanvasAppViewportConsumerModel(viewportControls)

    model.keyboard.fitToItems()
    model.keyboard.resetViewport()
    model.keyboard.zoomBy(0.8)

    expect(viewportControls.fitToItems).toHaveBeenCalledWith()
    expect(viewportControls.resetViewport).toHaveBeenCalledTimes(1)
    expect(viewportControls.zoomBy).toHaveBeenCalledWith(0.8)
  })
})

function createViewportControls() {
  return {
    fitToItems: vi.fn(),
    resetViewport: vi.fn(),
    zoomBy: vi.fn(),
  }
}
