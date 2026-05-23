import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { Viewport } from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import {
  fitBoundsIntoViewport,
  INITIAL_VIEWPORT,
  zoomViewport,
} from '../../core'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'

type UseCanvasViewportControlsArgs = {
  itemReadModel: CanvasItemReadModel
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
      const targetIds =
        ids && ids.length > 0
          ? ids
          : itemReadModel.getAllIds()
      const bounds = itemReadModel.getSelectionBounds(targetIds)
      const rect = stageElement.getRect()

      if (!bounds || !rect) {
        return
      }

      setViewport(fitBoundsIntoViewport(bounds, rect))
    },
    [itemReadModel, setViewport, stageElement],
  )

  const resetViewport = useCallback(() => {
    setViewport(INITIAL_VIEWPORT)
  }, [setViewport])

  const zoomBy = useCallback(
    (multiplier: number) => {
      const rect = stageElement.getRect()

      if (!rect) {
        return
      }

      const point = {
        x: rect.width / 2,
        y: rect.height / 2,
      }

      setViewport((current) => zoomViewport(current, point, multiplier))
    },
    [setViewport, stageElement],
  )

  return {
    fitToItems,
    resetViewport,
    zoomBy,
  }
}
