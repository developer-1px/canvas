import { describe, expect, it, vi } from 'vitest'
import { getCanvasAppViewportConsumerModel } from './CanvasAppViewportConsumerModel'

describe('CanvasAppViewportConsumerModel', () => {
  it('builds control viewport handlers from runtime controls', () => {
    const viewportControls = createViewportControls()
    const model = getCanvasAppViewportConsumerModel(viewportControls)

    model.control.onCenterViewportAtWorldPoint({ x: 10, y: 20 })
    model.control.onFitItems(['item-1'])
    model.control.onViewportReset()
    model.control.onZoom('in')

    expect(viewportControls.centerAtWorldPoint).toHaveBeenCalledWith({
      x: 10,
      y: 20,
    })
    expect(viewportControls.fitToItems).toHaveBeenCalledWith(['item-1'])
    expect(viewportControls.resetViewport).toHaveBeenCalledTimes(1)
    expect(model.control.viewportRect).toEqual({
      height: 600,
      left: 0,
      top: 0,
      width: 900,
    })
    expect(viewportControls.zoom).toHaveBeenCalledWith('in')
  })

  it('builds keyboard viewport handlers without control naming', () => {
    const viewportControls = createViewportControls()
    const model = getCanvasAppViewportConsumerModel(viewportControls)

    model.keyboard.fitToItems()
    model.keyboard.resetViewport()
    model.keyboard.zoom('out')

    expect(viewportControls.fitToItems).toHaveBeenCalledWith()
    expect(viewportControls.resetViewport).toHaveBeenCalledTimes(1)
    expect(viewportControls.zoom).toHaveBeenCalledWith('out')
  })
})

function createViewportControls() {
  return {
    centerAtWorldPoint: vi.fn(),
    fitToItems: vi.fn(),
    resetViewport: vi.fn(),
    viewportRect: {
      height: 600,
      left: 0,
      top: 0,
      width: 900,
    },
    zoom: vi.fn(),
  }
}
