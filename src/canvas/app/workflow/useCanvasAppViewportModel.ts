import { useCanvasViewportControls } from '../interaction/viewport/useCanvasViewportControls'
import { useCanvasWheelViewport } from '../interaction/viewport/useCanvasWheelViewport'
import { getCanvasAppViewportConsumerModel } from './CanvasAppViewportConsumerModel'
import type { CanvasAppViewportModelInput } from './CanvasAppViewportConsumerContracts'

export function useCanvasAppViewportModel({
  config,
  itemReadModel,
  setViewport,
  stageElement,
}: CanvasAppViewportModelInput) {
  useCanvasWheelViewport({
    config,
    setViewport,
    stageElement,
  })

  const viewportControls = useCanvasViewportControls({
    itemReadModel,
    setViewport,
    stageElement,
  })

  return getCanvasAppViewportConsumerModel(viewportControls)
}
