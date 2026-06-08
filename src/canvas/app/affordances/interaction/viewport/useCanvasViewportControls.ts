import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { CanvasViewportZoomDirection } from '../../../../core'
import type { Viewport } from '../../../../entities'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'
import {
  fitCanvasViewportToItems,
  resetCanvasViewport,
  zoomCanvasViewport,
} from './CanvasViewportControlExecution'

type UseCanvasViewportControlsArgs = {
  itemReadModel: CanvasAppItemReadModel
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
}

export function useCanvasViewportControls({
  itemReadModel,
  setViewport,
  stageElement,
}: UseCanvasViewportControlsArgs) {
  const fitToItems = useCallback(
    (ids?: string[]) => {
      fitCanvasViewportToItems({
        ids,
        itemReadModel,
        setViewport,
        stageElement,
      })
    },
    [itemReadModel, setViewport, stageElement],
  )

  const resetViewport = useCallback(() => {
    resetCanvasViewport({ setViewport })
  }, [setViewport])

  const zoom = useCallback(
    (direction: CanvasViewportZoomDirection) => {
      zoomCanvasViewport({
        direction,
        setViewport,
        stageElement,
      })
    },
    [setViewport, stageElement],
  )

  return {
    fitToItems,
    resetViewport,
    zoom,
  }
}
