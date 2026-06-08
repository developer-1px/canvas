import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type { CanvasViewportZoomDirection } from '../../core'
import type { CanvasAffordanceConfig } from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppStageElement } from '../rendering/stage/CanvasAppStageElement'
import type { CanvasAppKeyboardViewportContext } from './CanvasAppKeyboardConsumerContracts'

export type CanvasAppViewportModelInput = {
  config: CanvasAffordanceConfig
  itemReadModel: CanvasAppItemReadModel
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
}

export type CanvasAppViewportRuntime = {
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  zoom: (direction: CanvasViewportZoomDirection) => void
}

export type CanvasAppViewportControlContext = {
  onFitItems: (ids?: string[]) => void
  onViewportReset: () => void
  onZoom: (direction: CanvasViewportZoomDirection) => void
}

export type CanvasAppViewportConsumerModel = {
  control: CanvasAppViewportControlContext
  keyboard: CanvasAppKeyboardViewportContext
}
