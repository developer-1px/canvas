import {
  useEffect,
  useRef,
} from 'react'

export const CANVAS_MODAL_FOCUS_LIFECYCLE_MODEL = 'canvas-modal-focus-lifecycle'

export const CANVAS_MODAL_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export type CanvasModalFocusTarget = HTMLElement & {
  disabled?: boolean
}

export type CanvasModalFocusRef<TElement extends HTMLElement = HTMLElement> = {
  current: TElement | null
}

export type CanvasModalTabFocusEvent = {
  key: string
  shiftKey: boolean
  preventDefault: () => void
  stopPropagation: () => void
}

export function useCanvasModalFocusLifecycle<
  TInitialFocusElement extends HTMLElement = HTMLElement,
>({
  focusDelayMs = 0,
  initialFocusRef,
  preventScroll = true,
  restoreFocus = true,
}: {
  focusDelayMs?: number
  initialFocusRef?: CanvasModalFocusRef<TInitialFocusElement>
  preventScroll?: boolean
  restoreFocus?: boolean
} = {}) {
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const didRestoreFocusRef = useRef(false)

  useEffect(() => {
    restoreFocusRef.current = getCanvasModalRestoreFocusTarget()
    didRestoreFocusRef.current = false

    const focusTimer = window.setTimeout(() => {
      focusCanvasModalElement(initialFocusRef?.current ?? null, {
        preventScroll,
      })
    }, focusDelayMs)

    return () => {
      window.clearTimeout(focusTimer)

      if (restoreFocus && !didRestoreFocusRef.current) {
        didRestoreFocusRef.current = true
        restoreCanvasModalFocus(restoreFocusRef.current, { preventScroll })
      }

      restoreFocusRef.current = null
    }
  }, [focusDelayMs, initialFocusRef, preventScroll, restoreFocus])

  return {
    restoreFocusRef,
  }
}

export function getCanvasModalRestoreFocusTarget({
  ownerDocument = typeof document === 'undefined' ? undefined : document,
  root,
}: {
  ownerDocument?: Document
  root?: HTMLElement | null
} = {}) {
  const activeElement = ownerDocument?.activeElement

  if (
    !activeElement ||
    activeElement === ownerDocument?.body ||
    (root && root.contains(activeElement))
  ) {
    return null
  }

  return isCanvasModalFocusableElement(activeElement)
    ? activeElement
    : null
}

export function focusCanvasModalElement(
  element: HTMLElement | null,
  {
    preventScroll = true,
  }: {
    preventScroll?: boolean
  } = {},
) {
  if (!isCanvasModalFocusableElement(element)) {
    return false
  }

  element.focus({ preventScroll })
  return true
}

export function restoreCanvasModalFocus(
  element: HTMLElement | null,
  {
    preventScroll = true,
  }: {
    preventScroll?: boolean
  } = {},
) {
  return focusCanvasModalElement(element, { preventScroll })
}

export function trapCanvasModalTabFocus({
  event,
  root,
}: {
  event: CanvasModalTabFocusEvent
  root: HTMLElement | null
}) {
  if (event.key !== 'Tab' || !root) {
    return false
  }

  const focusableElements = getCanvasModalFocusableElements(root)

  event.preventDefault()
  event.stopPropagation()

  const nextIndex = getCanvasModalNextFocusIndex({
    count: focusableElements.length,
    currentIndex: focusableElements.findIndex((element) =>
      element === root.ownerDocument.activeElement),
    shiftKey: event.shiftKey,
  })

  if (nextIndex === null) {
    return true
  }

  focusableElements[nextIndex]?.focus()
  return true
}

export function getCanvasModalFocusableElements(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(CANVAS_MODAL_FOCUSABLE_SELECTOR),
  ).filter(isCanvasModalFocusableElement)
}

export function getCanvasModalNextFocusIndex({
  count,
  currentIndex,
  shiftKey,
}: {
  count: number
  currentIndex: number
  shiftKey: boolean
}) {
  if (count === 0) {
    return null
  }

  if (currentIndex < 0) {
    return 0
  }

  const direction = shiftKey ? -1 : 1

  return (currentIndex + direction + count) % count
}

function isCanvasModalFocusableElement(
  element: Element | null,
): element is CanvasModalFocusTarget {
  const candidate = element as CanvasModalFocusTarget | null

  return !!candidate &&
    candidate.isConnected !== false &&
    candidate.disabled !== true &&
    typeof candidate.focus === 'function' &&
    candidate.getAttribute('aria-hidden') !== 'true'
}
