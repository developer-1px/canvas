import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { Viewport } from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import {
  fitBoundsIntoViewport,
  INITIAL_VIEWPORT,
  zoomViewport,
} from '../../core'

type UseCanvasViewportControlsArgs = {
  itemReadModel: CanvasItemReadModel
  setViewport: Dispatch<SetStateAction<Viewport>>
  svgRef: RefObject<SVGSVGElement | null>
}

export function useCanvasViewportControls({
  itemReadModel,
  setViewport,
  svgRef,
}: UseCanvasViewportControlsArgs) {
  const fitToItems = useCallback(
    (ids?: string[]) => {
      const targetIds =
        ids && ids.length > 0
          ? ids
          : itemReadModel.getAllIds()
      const bounds = itemReadModel.getSelectionBounds(targetIds)
      const rect = svgRef.current?.getBoundingClientRect()

      if (!bounds || !rect) {
        return
      }

      setViewport(fitBoundsIntoViewport(bounds, rect))
    },
    [itemReadModel, setViewport, svgRef],
  )

  const resetViewport = useCallback(() => {
    setViewport(INITIAL_VIEWPORT)
  }, [setViewport])

  const zoomBy = useCallback(
    (multiplier: number) => {
      const rect = svgRef.current?.getBoundingClientRect()

      if (!rect) {
        return
      }

      const point = {
        x: rect.width / 2,
        y: rect.height / 2,
      }

      setViewport((current) => zoomViewport(current, point, multiplier))
    },
    [setViewport, svgRef],
  )

  return {
    fitToItems,
    resetViewport,
    zoomBy,
  }
}
