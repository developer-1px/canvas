import type {
  CanvasAppStageElementConsumerModel,
  CanvasAppStageElementConsumerModelInput,
} from './CanvasAppStageElementConsumerContracts'

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
    linkPreview: {
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
    textPaste: {
      stageElement,
    },
    viewport: {
      stageElement,
    },
  }
}
