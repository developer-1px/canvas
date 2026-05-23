import {
  useCallback,
  useMemo,
  useRef,
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

export type CanvasAppStageElement = {
  addWheelListener: (handler: CanvasAppStageWheelHandler) => () => void
  capturePointer: (pointerId: number) => void
  getRect: () => CanvasAppStageRect | null
  getScreenPoint: (event: { clientX: number; clientY: number }) => Point
  getViewportCenter: (viewport: Viewport) => Point | null
  releasePointer: (pointerId: number) => void
  setElement: RefCallback<SVGSVGElement>
}

export function useCanvasAppStageElement(): CanvasAppStageElement {
  const elementRef = useRef<SVGSVGElement | null>(null)

  const setElement = useCallback((element: SVGSVGElement | null) => {
    elementRef.current = element
  }, [])

  return useMemo(
    () => ({
      addWheelListener: (handler) => {
        const element = elementRef.current

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
        const element = elementRef.current

        if (element && !element.hasPointerCapture(pointerId)) {
          element.setPointerCapture(pointerId)
        }
      },
      getRect: () => {
        const element = elementRef.current

        return element ? getStageElementRect(element) : null
      },
      getScreenPoint: (event) => {
        const rect = elementRef.current?.getBoundingClientRect()

        if (!rect) {
          return { x: 0, y: 0 }
        }

        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
      },
      getViewportCenter: (viewport) => {
        const rect = elementRef.current?.getBoundingClientRect()

        if (!rect) {
          return null
        }

        return {
          x: (rect.width / 2 - viewport.x) / viewport.scale,
          y: (rect.height / 2 - viewport.y) / viewport.scale,
        }
      },
      releasePointer: (pointerId) => {
        const element = elementRef.current

        if (element?.hasPointerCapture(pointerId)) {
          element.releasePointerCapture(pointerId)
        }
      },
      setElement,
    }),
    [setElement],
  )
}

function getStageElementRect(element: SVGSVGElement): CanvasAppStageRect {
  const rect = element.getBoundingClientRect()

  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  }
}
