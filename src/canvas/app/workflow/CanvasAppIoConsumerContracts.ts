import type { CanvasAffordanceConfig } from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppStageElement } from '../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'

export type CanvasAppImageModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  itemReadModel: CanvasAppItemReadModel
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export type CanvasAppLinkPreviewImportModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

export type CanvasAppTableImportModelInput = {
  commitItemsChange: CommitCanvasItemsChange
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  selection: string[]
  stageElement: CanvasAppStageElement
  viewport: Viewport
}
