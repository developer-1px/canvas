import type {
  RefCallback,
} from 'react'
import type {
  Point,
  Viewport,
} from '../../../entities'

export type CanvasAppStageRect = {
  height: number
  left: number
  top: number
  width: number
}

export type CanvasElementRect = CanvasAppStageRect & {
  bottom?: number
  right?: number
}

export type CanvasElementRectTarget = {
  getBoundingClientRect?: () => CanvasElementRect
}

export type CanvasPointerCaptureTarget = {
  hasPointerCapture?: (pointerId: number) => boolean
  releasePointerCapture?: (pointerId: number) => void
  setPointerCapture?: (pointerId: number) => void
}

export type CanvasAppStageSvgSnapshot = {
  height: number
  svg: string
  width: number
}

export type CanvasAppStageSvgSnapshotInput = {
  bounds: {
    h: number
    w: number
    x: number
    y: number
  }
  ids: readonly string[]
}

export type CanvasAppStageWheelHandler = (
  event: globalThis.WheelEvent,
  rect: CanvasAppStageRect,
) => void

export type CanvasAppStageDomElement = {
  addEventListener: (
    type: 'wheel',
    listener: (event: globalThis.WheelEvent) => void,
    options?: AddEventListenerOptions,
  ) => void
  contains: (target: Node | null) => boolean
  getBoundingClientRect: () => CanvasAppStageRect
  hasPointerCapture: (pointerId: number) => boolean
  parentElement: CanvasAppStageWheelRoot | null
  releasePointerCapture: (pointerId: number) => void
  removeEventListener: (
    type: 'wheel',
    listener: (event: globalThis.WheelEvent) => void,
    options?: EventListenerOptions,
  ) => void
  setPointerCapture: (pointerId: number) => void
}

export type CanvasAppStageWheelRoot = {
  addEventListener: (
    type: 'wheel',
    listener: (event: globalThis.WheelEvent) => void,
    options?: AddEventListenerOptions,
  ) => void
  removeEventListener: (
    type: 'wheel',
    listener: (event: globalThis.WheelEvent) => void,
    options?: EventListenerOptions,
  ) => void
}

export type CanvasAppStageElement = {
  addWheelListener: (handler: CanvasAppStageWheelHandler) => () => void
  capturePointer: (pointerId: number) => void
  getRect: () => CanvasAppStageRect | null
  getScreenPoint: (event: { clientX: number; clientY: number }) => Point
  getSelectionSvgSnapshot?: (
    input: CanvasAppStageSvgSnapshotInput,
  ) => CanvasAppStageSvgSnapshot | null
  getViewportCenter: (viewport: Viewport) => Point | null
  releasePointer: (pointerId: number) => void
}

export type CanvasAppStageElementMount = {
  ref: RefCallback<Element>
}

export type CanvasAppStageElementController = CanvasAppStageElement & {
  mount: CanvasAppStageElementMount
}

export type CreateCanvasAppStageElementInput = {
  getElement: () => CanvasAppStageDomElement | null
  setElement: RefCallback<Element>
}
