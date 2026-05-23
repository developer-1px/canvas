import type { CanvasAppStageElementController } from '../stage/CanvasAppStageElement'

type GetCanvasAppStageElementConsumerModelArgs = {
  stageElement: CanvasAppStageElementController
}

export function getCanvasAppStageElementConsumerModel({
  stageElement,
}: GetCanvasAppStageElementConsumerModelArgs) {
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
