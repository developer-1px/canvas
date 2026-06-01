import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import type {
  Point,
  Viewport
} from '../../core'
import { zoomViewport } from '../primitives/CanvasPrimitives'

export type CanvasWheelInput = {
  ctrlKey: boolean
  deltaMode: number
  deltaX: number
  deltaY: number
  metaKey: boolean
  shiftKey: boolean
}

const WHEEL_PAN_MULTIPLIER = 0.9
const WHEEL_ZOOM_MULTIPLIER = 3
const WHEEL_LINE_DELTA = 16
const WHEEL_PAGE_DELTA = 800
const WHEEL_ZOOM_SENSITIVITY = 0.001

export function shouldHandleCanvasWheelViewport({
  config,
  input,
}: {
  config: CanvasAffordanceConfig
  input: CanvasWheelInput
}) {
  return isPinchWheelInput(input)
    ? config.gestures.wheelZoom
    : config.gestures.pan
}

export function getCanvasWheelViewport({
  config,
  input,
  point,
  viewport,
}: {
  config: CanvasAffordanceConfig
  input: CanvasWheelInput
  point: Point
  viewport: Viewport
}) {
  if (!shouldHandleCanvasWheelViewport({ config, input })) {
    return null
  }

  const delta = normalizeWheelDelta(input)

  if (delta.x === 0 && delta.y === 0) {
    return null
  }

  if (isPinchWheelInput(input)) {
    const multiplier = Math.exp(
      -delta.y * WHEEL_ZOOM_SENSITIVITY * WHEEL_ZOOM_MULTIPLIER,
    )

    return zoomViewport(viewport, point, multiplier)
  }

  const panDelta = getWheelPanDelta(input, delta)

  return {
    ...viewport,
    x: viewport.x - panDelta.x * WHEEL_PAN_MULTIPLIER,
    y: viewport.y - panDelta.y * WHEEL_PAN_MULTIPLIER,
  }
}

function normalizeWheelDelta(input: CanvasWheelInput): Point {
  const unit =
    input.deltaMode === 1
      ? WHEEL_LINE_DELTA
      : input.deltaMode === 2
        ? WHEEL_PAGE_DELTA
        : 1

  return {
    x: input.deltaX * unit,
    y: input.deltaY * unit,
  }
}

function getWheelPanDelta(input: CanvasWheelInput, delta: Point): Point {
  if (input.shiftKey && delta.x === 0) {
    return {
      x: delta.y,
      y: 0,
    }
  }

  return delta
}

function isPinchWheelInput(input: CanvasWheelInput) {
  return input.ctrlKey || input.metaKey
}
