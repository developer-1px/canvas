import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAppStageElement,
  type CanvasAppStageElementController,
} from '../stage/CanvasAppStageElement'
import { getCanvasAppStageElementConsumerModel } from './CanvasAppStageElementConsumerModel'
import type { CanvasAppStageElementConsumerModelInput } from './CanvasAppStageElementConsumerContracts'

describe('CanvasAppStageElementConsumerModel', () => {
  it('routes the stage element controller to DOM-dependent consumers', () => {
    const input = createInput()
    const stageElement = input.stageElement
    const model = getCanvasAppStageElementConsumerModel(input)

    expect(model.command.stageElement).toBe(stageElement)
    expect(model.component.stageElement).toBe(stageElement)
    expect(model.pointer.stageElement).toBe(stageElement)
    expect(model.viewport.stageElement).toBe(stageElement)
  })

  it('keeps stage render mounting on the mount interface only', () => {
    const input = createInput()
    const stageElement = input.stageElement
    const model = getCanvasAppStageElementConsumerModel(input)
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

function createInput(): CanvasAppStageElementConsumerModelInput {
  return {
    stageElement: createStageElement(),
  }
}
