import type { CanvasNativeGestureTarget } from './CanvasNativeGestureBoundary'

export type CanvasPointerPinchChange = {
  readonly clientX: number
  readonly clientY: number
  readonly deltaX: number
  readonly deltaY: number
  readonly scale: number
}

export type CanvasPointerPinchTarget = CanvasNativeGestureTarget & {
  dispatchEvent: (event: Event) => boolean
}

type CanvasTouchPointerEvent = Event & {
  readonly clientX?: number
  readonly clientY?: number
  readonly pointerId?: number
  readonly pointerType?: string
  stopPropagation: () => void
}

type CanvasTouchPoint = {
  readonly x: number
  readonly y: number
}

type CanvasPointerPinchSession = {
  readonly pointerIds: readonly [number, number]
  readonly center: CanvasTouchPoint
  readonly distance: number
}

const LISTENER_OPTIONS = {
  capture: true,
  passive: false,
} as const

const REMOVE_OPTIONS = {
  capture: true,
} as const

const CANVAS_SYNTHETIC_PINCH_CANCEL = 'canvasSyntheticPinchCancel'

export function bindCanvasPointerPinchGesture(
  target: CanvasPointerPinchTarget | null,
  onChange: (change: CanvasPointerPinchChange) => void,
) {
  if (!target) {
    return () => false
  }

  const activeTarget = target
  const touches = new Map<number, CanvasTouchPoint>()
  const suppressedPointers = new Set<number>()
  let pinch: CanvasPointerPinchSession | null = null

  function handlePointerDown(event: Event) {
    const pointerEvent = event as CanvasTouchPointerEvent

    if (!isTouchPointerEvent(pointerEvent)) {
      return
    }

    touches.set(pointerEvent.pointerId, getTouchPoint(pointerEvent))

    if (pinch || touches.size < 2) {
      if (pinch) {
        suppressedPointers.add(pointerEvent.pointerId)
        ownPointerEvent(pointerEvent)
      }

      return
    }

    const pointerIds = [...touches.keys()].slice(0, 2) as [number, number]
    const firstPoint = touches.get(pointerIds[0])
    const secondPoint = touches.get(pointerIds[1])

    if (!firstPoint || !secondPoint) {
      return
    }

    pinch = createPinchSession(pointerIds, firstPoint, secondPoint)
    suppressedPointers.add(pointerIds[0])
    suppressedPointers.add(pointerIds[1])
    ownPointerEvent(pointerEvent)
    activeTarget.dispatchEvent(createSyntheticPointerCancel(
      pointerIds[0],
      firstPoint,
    ))
  }

  function handlePointerMove(event: Event) {
    const pointerEvent = event as CanvasTouchPointerEvent

    if (!isTouchPointerEvent(pointerEvent)) {
      return
    }

    if (touches.has(pointerEvent.pointerId)) {
      touches.set(pointerEvent.pointerId, getTouchPoint(pointerEvent))
    }

    if (!pinch || !pinch.pointerIds.includes(pointerEvent.pointerId)) {
      if (suppressedPointers.has(pointerEvent.pointerId)) {
        ownPointerEvent(pointerEvent)
      }

      return
    }

    const firstPoint = touches.get(pinch.pointerIds[0])
    const secondPoint = touches.get(pinch.pointerIds[1])

    ownPointerEvent(pointerEvent)

    if (!firstPoint || !secondPoint) {
      return
    }

    const nextPinch = createPinchSession(
      pinch.pointerIds,
      firstPoint,
      secondPoint,
    )
    const scale = nextPinch.distance / pinch.distance

    if (Number.isFinite(scale) && scale > 0) {
      onChange({
        clientX: nextPinch.center.x,
        clientY: nextPinch.center.y,
        deltaX: nextPinch.center.x - pinch.center.x,
        deltaY: nextPinch.center.y - pinch.center.y,
        scale,
      })
    }

    pinch = nextPinch
  }

  function handlePointerEnd(event: Event) {
    const pointerEvent = event as CanvasTouchPointerEvent & {
      readonly canvasSyntheticPinchCancel?: boolean
    }
    const isSyntheticPinchCancel =
      pointerEvent.canvasSyntheticPinchCancel === true

    if (
      !isTouchPointerEvent(pointerEvent) ||
      isSyntheticPinchCancel
    ) {
      return
    }

    if (suppressedPointers.has(pointerEvent.pointerId)) {
      ownPointerEvent(pointerEvent)
    }

    touches.delete(pointerEvent.pointerId)
    suppressedPointers.delete(pointerEvent.pointerId)

    if (pinch?.pointerIds.includes(pointerEvent.pointerId)) {
      pinch = null
    }
  }

  const listeners = [
    ['pointerdown', handlePointerDown],
    ['pointermove', handlePointerMove],
    ['pointerup', handlePointerEnd],
    ['pointercancel', handlePointerEnd],
  ] as const satisfies readonly (readonly [string, EventListener])[]

  for (const [type, listener] of listeners) {
    activeTarget.addEventListener(type, listener, LISTENER_OPTIONS)
  }

  let isBound = true

  return () => {
    if (!isBound) {
      return false
    }

    for (const [type, listener] of listeners) {
      activeTarget.removeEventListener(type, listener, REMOVE_OPTIONS)
    }

    touches.clear()
    suppressedPointers.clear()
    pinch = null
    isBound = false
    return true
  }
}

function createPinchSession(
  pointerIds: readonly [number, number],
  first: CanvasTouchPoint,
  second: CanvasTouchPoint,
): CanvasPointerPinchSession {
  return {
    pointerIds,
    center: {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    },
    distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
  }
}

function createSyntheticPointerCancel(
  pointerId: number,
  point: CanvasTouchPoint,
) {
  const event = typeof PointerEvent === 'undefined'
    ? new Event('pointercancel', { bubbles: true })
    : new PointerEvent('pointercancel', {
        bubbles: true,
        clientX: point.x,
        clientY: point.y,
        pointerId,
        pointerType: 'touch',
      })

  Object.defineProperty(event, CANVAS_SYNTHETIC_PINCH_CANCEL, { value: true })

  if (typeof PointerEvent === 'undefined') {
    Object.defineProperties(event, {
      clientX: { value: point.x },
      clientY: { value: point.y },
      pointerId: { value: pointerId },
      pointerType: { value: 'touch' },
    })
  }

  return event
}

function getTouchPoint(event: CanvasTouchPointerEvent): CanvasTouchPoint {
  return {
    x: event.clientX ?? 0,
    y: event.clientY ?? 0,
  }
}

function isTouchPointerEvent(
  event: CanvasTouchPointerEvent,
): event is CanvasTouchPointerEvent & { readonly pointerId: number } {
  return event.pointerType === 'touch' && typeof event.pointerId === 'number'
}

function ownPointerEvent(event: CanvasTouchPointerEvent) {
  event.preventDefault()
  event.stopPropagation()
}
