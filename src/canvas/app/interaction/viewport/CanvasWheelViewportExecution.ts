import {
  getCanvasWheelViewport,
  shouldHandleCanvasWheelViewport,
  type CanvasAffordanceConfig,
  type CanvasWheelInput,
} from '../../../engine'
import type { Viewport } from '../../../entities'
import type { CanvasAppStageRect } from '../../stage/CanvasAppStageElement'

export type CanvasWheelViewportSetter = (
  next: Viewport | ((current: Viewport) => Viewport),
) => void

export type CanvasWheelViewportEvent = {
  clientX: number
  clientY: number
  ctrlKey: boolean
  deltaMode: number
  deltaX: number
  deltaY: number
  metaKey: boolean
  preventDefault: () => void
  shiftKey: boolean
}

type RunCanvasWheelViewportArgs = {
  config: CanvasAffordanceConfig
  event: CanvasWheelViewportEvent
  rect: CanvasAppStageRect
  setViewport: CanvasWheelViewportSetter
}

export function runCanvasWheelViewport({
  config,
  event,
  rect,
  setViewport,
}: RunCanvasWheelViewportArgs) {
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
}

function getCanvasWheelInput(event: CanvasWheelViewportEvent): CanvasWheelInput {
  return {
    ctrlKey: event.ctrlKey,
    deltaMode: event.deltaMode,
    deltaX: event.deltaX,
    deltaY: event.deltaY,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  }
}
