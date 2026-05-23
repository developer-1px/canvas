import type {
  CanvasAppStageElementConsumerModel,
  CanvasAppStageElementConsumerModelInput,
} from './CanvasAppConsumerContracts'

export function getCanvasAppStageElementConsumerModel({
  stageElement,
}: CanvasAppStageElementConsumerModelInput): CanvasAppStageElementConsumerModel {
  return {
    command: {
      stageElement,
    },
    component: {
      stageElement,
    },
    pointer: {
      stageElement,
    },
    stage: {
      stageElement: stageElement.mount,
    },
    viewport: {
      stageElement,
    },
  }
}
