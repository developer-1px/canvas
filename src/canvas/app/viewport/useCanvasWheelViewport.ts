import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { Viewport } from '../../core'
import {
  getCanvasWheelViewport,
  shouldHandleCanvasWheelViewport,
  type CanvasAffordanceConfig,
  type CanvasWheelInput,
} from '../../engine'

type UseCanvasWheelViewportArgs = {
  config: CanvasAffordanceConfig
  setViewport: Dispatch<SetStateAction<Viewport>>
  svgRef: RefObject<SVGSVGElement | null>
}

export function useCanvasWheelViewport({
  config,
  setViewport,
  svgRef,
}: UseCanvasWheelViewportArgs) {
  useEffect(() => {
    const svg = svgRef.current

    if (!svg) {
      return
    }

    const svgElement = svg

    function handleNativeWheel(event: globalThis.WheelEvent) {
      const input = getCanvasWheelInput(event)

      if (!shouldHandleCanvasWheelViewport({ config, input })) {
        return
      }

      event.preventDefault()

      const rect = svgElement.getBoundingClientRect()
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      setViewport(
        (current) =>
          getCanvasWheelViewport({
            config,
            input,
            point,
            viewport: current,
          }) ?? current,
      )
    }

    svgElement.addEventListener('wheel', handleNativeWheel, { passive: false })

    return () => {
      svgElement.removeEventListener('wheel', handleNativeWheel)
    }
  }, [config, setViewport, svgRef])
}

function getCanvasWheelInput(event: globalThis.WheelEvent): CanvasWheelInput {
  return {
    ctrlKey: event.ctrlKey,
    deltaMode: event.deltaMode,
    deltaX: event.deltaX,
    deltaY: event.deltaY,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  }
}
