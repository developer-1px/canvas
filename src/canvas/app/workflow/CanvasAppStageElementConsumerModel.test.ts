import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAppStageElement,
  type CanvasAppStageElementController,
} from '../stage/CanvasAppStageElement'
import { getCanvasAppStageElementConsumerModel } from './CanvasAppStageElementConsumerModel'

describe('CanvasAppStageElementConsumerModel', () => {
  it('routes the stage element controller to DOM-dependent consumers', () => {
    const stageElement = createStageElement()
    const model = getCanvasAppStageElementConsumerModel({ stageElement })

    expect(model.command.stageElement).toBe(stageElement)
    expect(model.component.stageElement).toBe(stageElement)
    expect(model.pointer.stageElement).toBe(stageElement)
    expect(model.viewport.stageElement).toBe(stageElement)
  })

  it('keeps stage render mounting on the mount interface only', () => {
    const stageElement = createStageElement()
    const model = getCanvasAppStageElementConsumerModel({ stageElement })
    const svgElement = {} as SVGSVGElement

    model.stage.stageElement.ref(svgElement)

    expect(model.stage.stageElement).toBe(stageElement.mount)
    expect(model.stage).not.toHaveProperty('capturePointer')
    expect(stageElement.mount.ref).toHaveBeenCalledWith(svgElement)
  })
})

function createStageElement(): CanvasAppStageElementController {
  const stageElement = createCanvasAppStageElement({
    getElement: () => null,
    setElement: vi.fn(),
  })

  return {
    ...stageElement,
    mount: {
      ref: vi.fn(stageElement.mount.ref),
    },
  }
}
