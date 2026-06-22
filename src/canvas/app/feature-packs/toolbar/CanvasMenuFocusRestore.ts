import type {
  CanvasMenuFocusTarget,
} from './CanvasMenuRovingFocusContracts'

export function getCanvasMenuRestoreFocusTarget({
  ownerDocument,
  root,
}: {
  ownerDocument?: Document
  root: HTMLElement | null
}) {
  const resolvedOwnerDocument = ownerDocument ?? root?.ownerDocument
  const activeElement = resolvedOwnerDocument?.activeElement

  if (
    !activeElement ||
    activeElement === resolvedOwnerDocument?.body ||
    (root && root.contains(activeElement))
  ) {
    return null
  }

  return isCanvasMenuFocusableElement(activeElement)
    ? activeElement
    : null
}

export function restoreCanvasMenuFocus(
  element: HTMLElement | null,
  {
    preventScroll = true,
  }: {
    preventScroll?: boolean
  } = {},
) {
  if (!isCanvasMenuFocusableElement(element)) {
    return false
  }

  element.focus({ preventScroll })
  return true
}

function isCanvasMenuFocusableElement(
  element: Element | null,
): element is CanvasMenuFocusTarget {
  const candidate = element as CanvasMenuFocusTarget | null

  return !!candidate &&
    candidate.isConnected !== false &&
    candidate.disabled !== true &&
    typeof candidate.focus === 'function' &&
    candidate.getAttribute('aria-hidden') !== 'true'
}
