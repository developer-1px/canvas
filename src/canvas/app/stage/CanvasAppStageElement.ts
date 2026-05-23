import {
  useState,
  type RefCallback,
} from 'react'
import type {
  Point,
  Viewport,
} from '../../entities'

export type CanvasAppStageRect = {
  height: number
  left: number
  top: number
  width: number
}

export type CanvasAppStageWheelHandler = (
  event: globalThis.WheelEvent,
  rect: CanvasAppStageRect,
) => void

type CanvasAppStageDomElement = {
  addEventListener: (
    type: 'wheel',
    listener: (event: globalThis.WheelEvent) => void,
    options?: AddEventListenerOptions,
  ) => void
  getBoundingClientRect: () => CanvasAppStageRect
  hasPointerCapture: (pointerId: number) => boolean
  releasePointerCapture: (pointerId: number) => void
  removeEventListener: (
    type: 'wheel',
    listener: (event: globalThis.WheelEvent) => void,
  ) => void
  setPointerCapture: (pointerId: number) => void
}

export type CanvasAppStageElement = {
  addWheelListener: (handler: CanvasAppStageWheelHandler) => () => void
  capturePointer: (pointerId: number) => void
  getRect: () => CanvasAppStageRect | null
  getScreenPoint: (event: { clientX: number; clientY: number }) => Point
  getViewportCenter: (viewport: Viewport) => Point | null
  releasePointer: (pointerId: number) => void
}

type CanvasAppStageElementMount = {
  ref: RefCallback<Element>
}

export type CanvasAppStageElementController = CanvasAppStageElement & {
  mount: CanvasAppStageElementMount
}

type CreateCanvasAppStageElementInput = {
  getElement: () => CanvasAppStageDomElement | null
  setElement: RefCallback<Element>
}

export function useCanvasAppStageElement(): CanvasAppStageElementController {
  const [stageElement] = useState(() => {
    let element: Element | null = null

    return createCanvasAppStageElement({
      getElement: () => element,
      setElement: (nextElement) => {
        element = nextElement
      },
    })
  })

  return stageElement
}

export function createCanvasAppStageElement({
  getElement,
  setElement,
}: CreateCanvasAppStageElementInput): CanvasAppStageElementController {
  return {
    addWheelListener: (handler) => {
      const element = getElement()

      if (!element) {
        return () => undefined
      }

      const activeElement = element

      function handleWheel(event: globalThis.WheelEvent) {
        handler(event, getStageElementRect(activeElement))
      }

      activeElement.addEventListener('wheel', handleWheel, { passive: false })

      return () => {
        activeElement.removeEventListener('wheel', handleWheel)
      }
    },
    capturePointer: (pointerId) => {
      const element = getElement()

      if (element && !element.hasPointerCapture(pointerId)) {
        element.setPointerCapture(pointerId)
      }
    },
    getRect: () => {
      const element = getElement()

      return element ? getStageElementRect(element) : null
    },
    getScreenPoint: (event) => {
      const rect = getElement()?.getBoundingClientRect()

      if (!rect) {
        return { x: 0, y: 0 }
      }

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    },
    getViewportCenter: (viewport) => {
      const rect = getElement()?.getBoundingClientRect()

      if (!rect) {
        return null
      }

      return {
        x: (rect.width / 2 - viewport.x) / viewport.scale,
        y: (rect.height / 2 - viewport.y) / viewport.scale,
      }
    },
    releasePointer: (pointerId) => {
      const element = getElement()

      if (element?.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId)
      }
    },
    mount: {
      ref: setElement,
    },
  }
}

function getStageElementRect(
  element: CanvasAppStageDomElement,
): CanvasAppStageRect {
  const rect = element.getBoundingClientRect()

  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  }
}
