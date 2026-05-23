import {
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { Viewport } from '../../entities'
import {
  getCanvasWheelViewport,
  shouldHandleCanvasWheelViewport,
  type CanvasAffordanceConfig,
  type CanvasWheelInput,
} from '../../engine'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'

type UseCanvasWheelViewportArgs = {
  config: CanvasAffordanceConfig
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageElement: CanvasAppStageElement
}

export function useCanvasWheelViewport({
  config,
  setViewport,
  stageElement,
}: UseCanvasWheelViewportArgs) {
  useEffect(() => {
    return stageElement.addWheelListener((event, rect) => {
      const input = getCanvasWheelInput(event)

      if (!shouldHandleCanvasWheelViewport({ config, input })) {
        return
      }

      event.preventDefault()

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
    })
  }, [config, setViewport, stageElement])
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
