import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type { CanvasAffordanceConfig } from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { useCanvasViewportControls } from '../viewport/useCanvasViewportControls'
import { useCanvasWheelViewport } from '../viewport/useCanvasWheelViewport'

type UseCanvasAppViewportModelArgs = {
  config: CanvasAffordanceConfig
  itemReadModel: CanvasItemReadModel
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
}

export function useCanvasAppViewportModel({
  config,
  itemReadModel,
  setViewport,
  stageElement,
}: UseCanvasAppViewportModelArgs) {
  useCanvasWheelViewport({
    config,
    setViewport,
    stageElement,
  })

  const viewportControls = useCanvasViewportControls({
    itemReadModel,
    setViewport,
    stageElement,
  })

  return {
    control: {
      onFitItems: viewportControls.fitToItems,
      onViewportReset: viewportControls.resetViewport,
      onZoomBy: viewportControls.zoomBy,
    },
    keyboard: {
      fitToItems: viewportControls.fitToItems,
      resetViewport: viewportControls.resetViewport,
      zoomBy: viewportControls.zoomBy,
    },
  }
}
