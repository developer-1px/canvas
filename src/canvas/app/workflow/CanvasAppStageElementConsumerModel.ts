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
    image: {
      stageElement,
    },
    pointer: {
      stageElement,
    },
    stage: {
      stageElement: stageElement.mount,
    },
    stamp: {
      stageElement,
    },
    table: {
      stageElement,
    },
    viewport: {
      stageElement,
    },
  }
}
