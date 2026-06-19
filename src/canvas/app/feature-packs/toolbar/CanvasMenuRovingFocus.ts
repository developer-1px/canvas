import {
  useCallback,
  useLayoutEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'

export const CANVAS_MENU_ITEM_PROPS = {
  'data-canvas-menu-item': '',
} as const

export const CANVAS_MENU_ROVING_FOCUS_MODEL = 'canvas-menu-roving-focus'
export const CANVAS_MENU_FOCUS_MODEL = 'enabled-menuitem-roving'
export const CANVAS_MENU_FOCUS_RESTORE_MODEL = 'canvas-menu-focus-restore'
export const CANVAS_MENU_KEYBOARD_KEYS =
  'arrow-left-right-up-down-home-end-enter-space-escape'
export const CANVAS_SELECTION_TOOLBAR_DROPDOWN_MENU_MODEL =
  'canvas-selection-toolbar-dropdown-menu'

const CANVAS_MENU_ITEM_SELECTOR = '[data-canvas-menu-item]'

type CanvasMenuItem = HTMLElement & {
  disabled?: boolean
}

type CanvasMenuFocusTarget = HTMLElement & {
  disabled?: boolean
}

export type CanvasMenuRovingKeyIndexInput = {
  count: number
  currentIndex: number
  key: string
}

export type CanvasMenuRovingActiveIndexInput = {
  count: number
  focusedIndex: number
  preferredIndex: number
}

export type CanvasMenuTriggerKeyboardIntentInput = {
  key: string
}

export type CanvasMenuTriggerKeyboardIntent =
  | {
      kind: 'open-menu'
      preventDefault: true
    }
  | {
      kind: 'none'
      preventDefault: false
    }

export type CanvasMenuRovingFocusOptions = {
  autoFocus?: boolean
  initialActiveIndex?: number
  onClose?: () => void
  preventScroll?: boolean
  restoreFocus?: boolean
}

export function useCanvasMenuRovingFocus<
  TElement extends HTMLElement = HTMLElement,
>({
  autoFocus = true,
  initialActiveIndex = 0,
  onClose,
  preventScroll = true,
  restoreFocus = false,
}: CanvasMenuRovingFocusOptions = {}) {
  const rootRef = useRef<TElement | null>(null)
  const activeIndexRef = useRef(initialActiveIndex)
  const didAutoFocusRef = useRef(false)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const didRestoreFocusRef = useRef(false)

  const syncItems = useCallback((preferredIndex?: number) => {
    const root = rootRef.current

    if (!root) {
      return []
    }

    const items = getCanvasMenuItems(root)
    const enabledItems = items.filter(isCanvasMenuItemEnabled)
    const focusedIndex = enabledItems.findIndex((item) =>
      item === root.ownerDocument.activeElement)
    const activeIndex = getCanvasMenuRovingActiveIndex({
      count: enabledItems.length,
      focusedIndex,
      preferredIndex: preferredIndex ?? activeIndexRef.current,
    })

    activeIndexRef.current = activeIndex
    for (const item of items) {
      const enabledIndex = enabledItems.indexOf(item)
      item.tabIndex = enabledIndex === activeIndex ? 0 : -1
    }

    return enabledItems
  }, [])

  const focusItem = useCallback((index: number) => {
    const items = syncItems(index)

    items[index]?.focus()
  }, [syncItems])

  const focusInitialItem = useCallback(() => {
    if (!autoFocus || didAutoFocusRef.current) {
      return
    }

    const items = syncItems(initialActiveIndex)

    didAutoFocusRef.current = true
    items[activeIndexRef.current]?.focus()
  }, [autoFocus, initialActiveIndex, syncItems])

  const setRoot = useCallback((root: TElement | null) => {
    rootRef.current = root

    if (!root) {
      if (restoreFocus && !didRestoreFocusRef.current) {
        didRestoreFocusRef.current = true
        restoreCanvasMenuFocus(restoreFocusRef.current, { preventScroll })
      }

      restoreFocusRef.current = null
      didAutoFocusRef.current = false
      return
    }

    restoreFocusRef.current = restoreFocus
      ? getCanvasMenuRestoreFocusTarget({ root })
      : null
    didRestoreFocusRef.current = false
    activeIndexRef.current = initialActiveIndex
    syncItems(initialActiveIndex)
    focusInitialItem()
  }, [
    focusInitialItem,
    initialActiveIndex,
    preventScroll,
    restoreFocus,
    syncItems,
  ])

  useLayoutEffect(() => {
    syncItems()
    focusInitialItem()
  })

  const onFocus = useCallback((event: FocusEvent<TElement>) => {
    const items = getCanvasMenuItems(event.currentTarget)
      .filter(isCanvasMenuItemEnabled)
    const focusedIndex = items.findIndex((item) => item === event.target)

    if (focusedIndex >= 0) {
      syncItems(focusedIndex)
    }
  }, [syncItems])

  const onKeyDown = useCallback((event: KeyboardEvent<TElement>) => {
    const items = syncItems()
    const currentIndex = items.findIndex((item) =>
      item === event.currentTarget.ownerDocument.activeElement)
    const nextIndex = getCanvasMenuRovingKeyIndex({
      count: items.length,
      currentIndex,
      key: event.key,
    })

    if (nextIndex !== null) {
      event.preventDefault()
      event.stopPropagation()
      focusItem(nextIndex)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose?.()
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      items[currentIndex]?.click()
    }
  }, [focusItem, onClose, syncItems])

  return {
    ref: setRoot,
    onFocus,
    onKeyDown,
  }
}

function getCanvasMenuItems(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<CanvasMenuItem>(CANVAS_MENU_ITEM_SELECTOR),
  )
}

function isCanvasMenuItemEnabled(item: CanvasMenuItem) {
  return !item.disabled && item.getAttribute('aria-disabled') !== 'true'
}

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

export function getCanvasMenuRovingActiveIndex({
  count,
  focusedIndex,
  preferredIndex,
}: CanvasMenuRovingActiveIndexInput) {
  if (count === 0) {
    return 0
  }

  if (focusedIndex >= 0) {
    return focusedIndex
  }

  return Math.max(0, Math.min(preferredIndex, count - 1))
}

export function getCanvasMenuRovingKeyIndex({
  count,
  currentIndex,
  key,
}: CanvasMenuRovingKeyIndexInput) {
  if (count === 0 || currentIndex < 0) {
    return null
  }

  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return (currentIndex + 1) % count
  }

  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    return (currentIndex - 1 + count) % count
  }

  if (key === 'Home') {
    return 0
  }

  if (key === 'End') {
    return count - 1
  }

  return null
}

export function getCanvasMenuTriggerKeyboardIntent({
  key,
}: CanvasMenuTriggerKeyboardIntentInput): CanvasMenuTriggerKeyboardIntent {
  if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
    return {
      kind: 'open-menu',
      preventDefault: true,
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
  }
}
