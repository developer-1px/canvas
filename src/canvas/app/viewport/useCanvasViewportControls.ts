import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { Viewport } from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../workflow/CanvasAppItemReadModelContracts'
import {
  fitCanvasViewportToItems,
  resetCanvasViewport,
  zoomCanvasViewportBy,
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

  const zoomBy = useCallback(
    (multiplier: number) => {
      zoomCanvasViewportBy({
        multiplier,
        setViewport,
        stageElement,
      })
    },
    [setViewport, stageElement],
  )

  return {
    fitToItems,
    resetViewport,
    zoomBy,
  }
}
