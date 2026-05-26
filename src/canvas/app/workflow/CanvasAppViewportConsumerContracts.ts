import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
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
  zoomBy: (multiplier: number) => void
}

export type CanvasAppViewportControlContext = {
  onFitItems: (ids?: string[]) => void
  onViewportReset: () => void
  onZoomBy: (multiplier: number) => void
}

export type CanvasAppViewportConsumerModel = {
  control: CanvasAppViewportControlContext
  keyboard: CanvasAppKeyboardViewportContext
}
