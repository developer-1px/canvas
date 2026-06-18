import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type { CanvasViewportZoomDirection } from '../../core'
import type { CanvasAffordanceConfig } from '../../engine'
import type {
  Point,
  Viewport,
} from '../../entities'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type {
  CanvasAppStageElement,
  CanvasAppStageRect,
} from '../rendering/stage/CanvasAppStageElement'
import type { CanvasAppKeyboardViewportContext } from './CanvasAppKeyboardConsumerContracts'

export type CanvasAppViewportModelInput = {
  config: CanvasAffordanceConfig
  itemReadModel: CanvasAppItemReadModel
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
}

export type CanvasAppViewportRuntime = {
  centerAtWorldPoint: (point: Point) => void
  fitToItems: (ids?: string[]) => void
  resetViewport: () => void
  viewportRect: CanvasAppStageRect | null
  zoom: (direction: CanvasViewportZoomDirection) => void
}

export type CanvasAppViewportControlContext = {
  onCenterViewportAtWorldPoint: (point: Point) => void
  onFitItems: (ids?: string[]) => void
  onViewportReset: () => void
  onZoom: (direction: CanvasViewportZoomDirection) => void
  viewportRect: CanvasAppStageRect | null
}

export type CanvasAppViewportFocusControls = {
  centerAtWorldPoint: (point: Point) => void
  fitAll: () => void
  fitItems: (ids: readonly string[]) => void
  fitSelection: () => void
  viewportRect: CanvasAppStageRect | null
}

export type CanvasAppViewportConsumerModel = {
  control: CanvasAppViewportControlContext
  keyboard: CanvasAppKeyboardViewportContext
}
