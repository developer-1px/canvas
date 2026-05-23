import { describe, expect, it, vi } from 'vitest'
import type { RectItem } from '../../entities'
import type { CanvasAppPointerInput } from '../pointer/CanvasAppPointerInput'
import { getCanvasAppPointerConsumerModel } from './CanvasAppPointerConsumerModel'

describe('CanvasAppPointerConsumerModel', () => {
  it('builds item layer handlers from pointer down runtime callbacks', () => {
    const downHandlers = createDownHandlers()
    const model = getCanvasAppPointerConsumerModel({
      downHandlers,
      dragHandlers: createDragHandlers(),
    })
    const event = createPointerInput()
    const item = createRectItem()

    model.itemLayerHandlers.onItemPointerDown(event, 'item-1')
    model.itemLayerHandlers.onTextDoubleClick(item)

    expect(downHandlers.handleItemPointerDown).toHaveBeenCalledWith(
      event,
      'item-1',
    )
    expect(downHandlers.handleTextDoubleClick).toHaveBeenCalledWith(item)
    expect(model.itemLayerHandlers).not.toHaveProperty('onPointerMove')
  })

  it('builds stage handlers from pointer down and drag runtime callbacks', () => {
    const downHandlers = createDownHandlers()
    const dragHandlers = createDragHandlers()
    const model = getCanvasAppPointerConsumerModel({
      downHandlers,
      dragHandlers,
    })
    const event = createPointerInput()

    model.stageHandlers.onCanvasPointerDown(event)
    model.stageHandlers.onPointerCancel(event)
    model.stageHandlers.onPointerMove(event)
    model.stageHandlers.onPointerUp(event)
    model.stageHandlers.onResizePointerDown(event, 'se')

    expect(downHandlers.handleCanvasPointerDown).toHaveBeenCalledWith(event)
    expect(dragHandlers.handlePointerCancel).toHaveBeenCalledWith(event)
    expect(dragHandlers.handlePointerMove).toHaveBeenCalledWith(event)
    expect(dragHandlers.handlePointerUp).toHaveBeenCalledWith(event)
    expect(downHandlers.handleResizePointerDown).toHaveBeenCalledWith(
      event,
      'se',
    )
    expect(model.stageHandlers).not.toHaveProperty('onTextDoubleClick')
  })
})

function createDownHandlers() {
  return {
    handleCanvasPointerDown: vi.fn(),
    handleItemPointerDown: vi.fn(),
    handleResizePointerDown: vi.fn(),
    handleTextDoubleClick: vi.fn(),
  }
}

function createDragHandlers() {
  return {
    handlePointerCancel: vi.fn(),
    handlePointerMove: vi.fn(),
    handlePointerUp: vi.fn(),
  }
}

function createPointerInput(): CanvasAppPointerInput {
  return {
    altKey: false,
    button: 0,
    clientX: 10,
    clientY: 20,
    ctrlKey: false,
    metaKey: false,
    pointerId: 1,
    preventDefault: vi.fn(),
    shiftKey: false,
    stopPropagation: vi.fn(),
  }
}

function createRectItem(): RectItem {
  return {
    fill: '#ffffff',
    h: 40,
    id: 'item-1',
    stroke: '#111111',
    type: 'rect',
    w: 80,
    x: 10,
    y: 20,
  }
}
