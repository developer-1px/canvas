export const CANVAS_NATIVE_GESTURE_BOUNDARY_SELECTOR =
  '[data-canvas-native-gesture-boundary]'
export const CANVAS_WHEEL_PASSTHROUGH_SELECTOR =
  '[data-canvas-wheel-passthrough="true"]'
export const CANVAS_SCROLL_WHEEL_PASSTHROUGH_SELECTOR =
  '[data-canvas-wheel-passthrough="scroll"]'
export const CANVAS_NATIVE_TEXT_ENTRY_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
].join(',')

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

export type CanvasKeyboardZoomEvent = {
  readonly ctrlKey?: boolean
  readonly isComposing?: boolean
  readonly key?: string
  readonly metaKey?: boolean
  readonly target?: EventTarget | null
}

export type CanvasNativeKeyboardZoomIntent = 'in' | 'out' | 'reset'
export type CanvasNativeKeyboardZoomResolution = {
  readonly intent: CanvasNativeKeyboardZoomIntent
  readonly owner: 'canvas' | 'text-entry'
}

type CanvasWheelGestureEvent = Event & {
  readonly ctrlKey?: boolean
  readonly metaKey?: boolean
}

export type CanvasNativeWheelEvent = {
  readonly ctrlKey?: boolean
  readonly deltaX: number
  readonly deltaY: number
  readonly metaKey?: boolean
  readonly shiftKey?: boolean
  readonly target: EventTarget | null
}

export type CanvasNativeWheelOwnership = 'canvas' | 'native'

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

export function resolveCanvasNativeWheelOwnership(
  event: CanvasNativeWheelEvent,
): CanvasNativeWheelOwnership {
  if (event.ctrlKey || event.metaKey) {
    return 'canvas'
  }

  if (isCanvasNativeWheelPassthroughTarget(event.target)) {
    return 'native'
  }

  const target = getCanvasNativeGestureElement(event.target)

  if (!target) {
    return 'canvas'
  }

  let scrollSurface = closestCanvasScrollSurface(target)

  while (scrollSurface) {
    if (canCanvasScrollSurfaceConsume(scrollSurface, event)) {
      return 'native'
    }

    scrollSurface = scrollSurface.parentElement
      ? closestCanvasScrollSurface(scrollSurface.parentElement)
      : null
  }

  return 'canvas'
}

export function getCanvasNativeKeyboardZoomIntent(
  event: CanvasKeyboardZoomEvent,
): CanvasNativeKeyboardZoomIntent | null {
  const resolution = resolveCanvasNativeKeyboardZoom(event)

  return resolution?.owner === 'canvas' ? resolution.intent : null
}

export function resolveCanvasNativeKeyboardZoom(
  event: CanvasKeyboardZoomEvent,
): CanvasNativeKeyboardZoomResolution | null {
  if (!event.ctrlKey && !event.metaKey) {
    return null
  }

  let intent: CanvasNativeKeyboardZoomIntent | null

  switch (event.key) {
    case '+':
    case '=':
      intent = 'in'
      break
    case '-':
      intent = 'out'
      break
    case '0':
      intent = 'reset'
      break
    default:
      return null
  }

  return {
    intent,
    owner: event.isComposing || isCanvasNativeTextEntryTarget(
      event.target ?? null,
    )
      ? 'text-entry'
      : 'canvas',
  }
}

export function isCanvasNativeTextEntryTarget(target: EventTarget | null) {
  if (
    (typeof HTMLInputElement !== 'undefined' &&
      target instanceof HTMLInputElement) ||
    (typeof HTMLTextAreaElement !== 'undefined' &&
      target instanceof HTMLTextAreaElement) ||
    (typeof HTMLSelectElement !== 'undefined' &&
      target instanceof HTMLSelectElement) ||
    (typeof HTMLElement !== 'undefined' &&
      target instanceof HTMLElement &&
      target.isContentEditable)
  ) {
    return true
  }

  const element = getCanvasNativeGestureElement(target)

  if (!element) {
    return false
  }

  try {
    return Boolean(element.closest(CANVAS_NATIVE_TEXT_ENTRY_SELECTOR))
  } catch {
    return false
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

function closestCanvasScrollSurface(element: Element) {
  try {
    return element.closest<HTMLElement>(
      CANVAS_SCROLL_WHEEL_PASSTHROUGH_SELECTOR,
    )
  } catch {
    return null
  }
}

function canCanvasScrollSurfaceConsume(
  element: HTMLElement,
  event: Pick<CanvasNativeWheelEvent, 'deltaX' | 'deltaY' | 'shiftKey'>,
) {
  let deltaX = event.deltaX
  let deltaY = event.deltaY

  if (event.shiftKey && deltaX === 0) {
    deltaX = deltaY
    deltaY = 0
  }

  return canConsumeScrollDelta(
    element.scrollLeft,
    element.scrollWidth - element.clientWidth,
    deltaX,
  ) || canConsumeScrollDelta(
    element.scrollTop,
    element.scrollHeight - element.clientHeight,
    deltaY,
  )
}

function canConsumeScrollDelta(position: number, max: number, delta: number) {
  if (!Number.isFinite(delta) || delta === 0 || max <= 0) {
    return false
  }

  return delta < 0 ? position > 0 : position < max
}

function preventBrowserKeyboardZoom(event: Event) {
  if (resolveCanvasNativeKeyboardZoom(event as CanvasKeyboardZoomEvent)) {
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
