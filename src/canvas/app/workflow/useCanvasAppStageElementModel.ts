import { useCanvasAppStageElement } from '../stage/CanvasAppStageElement'

export function useCanvasAppStageElementModel() {
  const stageElement = useCanvasAppStageElement()

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
