import {
  useState,
} from 'react'
import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import {
  addCanvasAppStageWheelListener,
} from './CanvasAppStageWheelEvents'
import type {
  CanvasAppStageElementController,
  CreateCanvasAppStageElementInput,
} from './CanvasAppStageElementContracts'
import {
  getCanvasAppStageElementRect,
  getCanvasElementRect,
} from './CanvasAppStageElementGeometry'
import {
  captureCanvasPointerTarget,
  releaseCanvasPointerTarget,
} from './CanvasPointerCaptureTarget'
import {
  createCanvasSelectionSvgSnapshot,
} from './CanvasSelectionSvgSnapshot'

export {
  getCanvasElementRect,
} from './CanvasAppStageElementGeometry'
export {
  captureCanvasPointerTarget,
  releaseCanvasPointerTarget,
} from './CanvasPointerCaptureTarget'
export type {
  CanvasAppStageDomElement,
  CanvasAppStageElement,
  CanvasAppStageElementController,
  CanvasAppStageElementMount,
  CanvasAppStageRect,
  CanvasAppStageSvgSnapshot,
  CanvasAppStageSvgSnapshotInput,
  CanvasAppStageWheelHandler,
  CanvasElementRect,
  CanvasElementRectTarget,
  CanvasPointerCaptureTarget,
  CreateCanvasAppStageElementInput,
} from './CanvasAppStageElementContracts'

export function useCanvasAppStageElement(): CanvasAppStageElementController {
  const [, setRevision] = useState(0)
  const [stageElement] = useState(() => {
    let element: Element | null = null

    return createCanvasAppStageElement({
      getElement: () => element,
      setElement: (nextElement) => {
        element = nextElement
        setRevision((current) => current + 1)
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

      return element
        ? addCanvasAppStageWheelListener({ element, handler })
        : () => undefined
    },
    capturePointer: (pointerId) => {
      captureCanvasPointerTarget({
        pointerId,
        target: getElement(),
      })
    },
    getRect: () => {
      const element = getElement()

      return element ? getCanvasAppStageElementRect(element) : null
    },
    getScreenPoint: (event) => {
      const rect = getCanvasElementRect(getElement())

      if (!rect) {
        return { x: 0, y: 0 }
      }

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    },
    getSelectionSvgSnapshot: (input) => {
      const element = getElement()

      return typeof SVGSVGElement !== 'undefined' &&
        element instanceof SVGSVGElement
        ? createCanvasSelectionSvgSnapshot(element, input)
        : null
    },
    getViewportCenter: (viewport) => {
      const rect = getCanvasElementRect(getElement())

      if (!rect) {
        return null
      }

      return getCanvasViewportWorldPoint(viewport, {
        x: rect.width / 2,
        y: rect.height / 2,
      })
    },
    releasePointer: (pointerId) => {
      releaseCanvasPointerTarget({
        pointerId,
        target: getElement(),
      })
    },
    mount: {
      ref: setElement,
    },
  }
}
