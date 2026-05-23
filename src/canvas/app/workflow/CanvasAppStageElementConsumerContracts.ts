import type { CanvasAppStageElementController } from '../stage/CanvasAppStageElement'

export type CanvasAppStageElementConsumerModelInput = {
  stageElement: CanvasAppStageElementController
}

export type CanvasAppStageElementControllerContext = {
  stageElement: CanvasAppStageElementController
}

export type CanvasAppStageElementStageContext = {
  stageElement: CanvasAppStageElementController['mount']
}

export type CanvasAppStageElementConsumerModel = {
  command: CanvasAppStageElementControllerContext
  component: CanvasAppStageElementControllerContext
  pointer: CanvasAppStageElementControllerContext
  stage: CanvasAppStageElementStageContext
  viewport: CanvasAppStageElementControllerContext
}
