export const CANVAS_NATIVE_GESTURE_BOUNDARY_SELECTOR =
  '[data-canvas-native-gesture-boundary]'
export const CANVAS_WHEEL_PASSTHROUGH_SELECTOR =
  '[data-canvas-wheel-passthrough="true"]'

export type CanvasNativeGestureTarget = {
  addEventListener: (
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ) => void
  removeEventListener: (
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions,
  ) => void
}

type CanvasTouchGestureEvent = Event & {
  readonly touches?: ArrayLike<unknown>
}

type CanvasKeyboardZoomEvent = Event & {
  readonly ctrlKey?: boolean
  readonly key?: string
  readonly metaKey?: boolean
}

export type CanvasNativeKeyboardZoomIntent = 'in' | 'out' | 'reset'

type CanvasWheelGestureEvent = Event & {
  readonly ctrlKey?: boolean
  readonly metaKey?: boolean
}

const LISTENER_OPTIONS = {
  capture: true,
  passive: false,
} as const

const REMOVE_OPTIONS = {
  capture: true,
} as const

export function bindCanvasNativeGestureBoundary(
  target: CanvasNativeGestureTarget | null,
) {
  if (!target) {
    return () => false
  }

  const listeners = [
    ['wheel', (event: Event) => preventBrowserWheelZoom(event)],
    ['keydown', (event: Event) => preventBrowserKeyboardZoom(event)],
    ['touchstart', (event: Event) => preventBrowserTouchZoom(event)],
    ['touchmove', (event: Event) => preventBrowserTouchZoom(event)],
    ['gesturestart', (event: Event) => preventBrowserGesture(event)],
    ['gesturechange', (event: Event) => preventBrowserGesture(event)],
    ['gestureend', (event: Event) => preventBrowserGesture(event)],
  ] as const satisfies readonly (readonly [string, EventListener])[]
  let isBound = true

  for (const [type, listener] of listeners) {
    target.addEventListener(type, listener, LISTENER_OPTIONS)
  }

  return () => {
    if (!isBound) {
      return false
    }

    for (const [type, listener] of listeners) {
      target.removeEventListener(type, listener, REMOVE_OPTIONS)
    }

    isBound = false
    return true
  }
}

export function isCanvasNativeWheelPassthroughTarget(
  target: EventTarget | null,
) {
  const element = getCanvasNativeGestureElement(target)

  if (!element) {
    return false
  }

  try {
    return Boolean(element.closest(CANVAS_WHEEL_PASSTHROUGH_SELECTOR))
  } catch {
    return false
  }
}

export function getCanvasNativeKeyboardZoomIntent(
  event: CanvasKeyboardZoomEvent,
): CanvasNativeKeyboardZoomIntent | null {
  if (!event.ctrlKey && !event.metaKey) {
    return null
  }

  switch (event.key) {
    case '+':
    case '=':
      return 'in'
    case '-':
      return 'out'
    case '0':
      return 'reset'
    default:
      return null
  }
}

function getCanvasNativeGestureElement(target: EventTarget | null) {
  if (!target) {
    return null
  }

  if (typeof Element !== 'undefined' && target instanceof Element) {
    return target
  }

  if (
    typeof Node !== 'undefined' &&
    target instanceof Node &&
    'parentElement' in target
  ) {
    return target.parentElement
  }

  return null
}

function preventBrowserKeyboardZoom(event: Event) {
  if (getCanvasNativeKeyboardZoomIntent(event as CanvasKeyboardZoomEvent)) {
    event.preventDefault()
  }
}

function preventBrowserWheelZoom(event: Event) {
  const wheelEvent = event as CanvasWheelGestureEvent

  if (wheelEvent.ctrlKey || wheelEvent.metaKey) {
    event.preventDefault()
  }
}

function preventBrowserTouchZoom(event: Event) {
  const touchEvent = event as CanvasTouchGestureEvent

  if ((touchEvent.touches?.length ?? 0) > 1) {
    event.preventDefault()
  }
}

function preventBrowserGesture(event: Event) {
  event.preventDefault()
}
