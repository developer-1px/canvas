import { useCanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { getCanvasAppStageElementConsumerModel } from './CanvasAppStageElementConsumerModel'

export function useCanvasAppStageElementModel() {
  const stageElement = useCanvasAppStageElement()

  return getCanvasAppStageElementConsumerModel({ stageElement })
}
