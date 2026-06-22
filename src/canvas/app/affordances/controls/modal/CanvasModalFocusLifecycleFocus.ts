import {
  CANVAS_MODAL_FOCUSABLE_SELECTOR,
  type CanvasModalFocusTarget,
} from './CanvasModalFocusLifecycleContracts'

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
