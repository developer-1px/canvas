import type { CanvasAppStageElementController } from '../rendering/stage/CanvasAppStageElement'

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
  image: CanvasAppStageElementControllerContext
  linkPreview: CanvasAppStageElementControllerContext
  pointer: CanvasAppStageElementControllerContext
  stage: CanvasAppStageElementStageContext
  stamp: CanvasAppStageElementControllerContext
  table: CanvasAppStageElementControllerContext
  textPaste: CanvasAppStageElementControllerContext
  viewport: CanvasAppStageElementControllerContext
}
