import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { CanvasItem, Viewport } from '../../entities'
import {
  fitBoundsIntoViewport,
  INITIAL_VIEWPORT,
  zoomViewport,
} from '../../engine/primitives/CanvasPrimitives'
import { flattenCanvasItems, unionBounds } from '../../host/tree/CanvasTree'

type UseCanvasViewportControlsArgs = {
  items: CanvasItem[]
  setViewport: Dispatch<SetStateAction<Viewport>>
  svgRef: RefObject<SVGSVGElement | null>
}

export function useCanvasViewportControls({
  items,
  setViewport,
  svgRef,
}: UseCanvasViewportControlsArgs) {
  const fitToItems = useCallback(
    (ids?: string[]) => {
      const targetIds =
        ids && ids.length > 0
          ? ids
          : flattenCanvasItems(items).map((entry) => entry.item.id)
      const bounds = unionBounds(items, new Set(targetIds))
      const rect = svgRef.current?.getBoundingClientRect()

      if (!bounds || !rect) {
        return
      }

      setViewport(fitBoundsIntoViewport(bounds, rect))
    },
    [items, setViewport, svgRef],
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
