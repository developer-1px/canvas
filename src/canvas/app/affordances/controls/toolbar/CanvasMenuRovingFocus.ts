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

const CANVAS_MENU_ITEM_SELECTOR = '[data-canvas-menu-item]'

type CanvasMenuItem = HTMLElement & {
  disabled?: boolean
}

export function useCanvasMenuRovingFocus<
  TElement extends HTMLElement = HTMLElement,
>({
  autoFocus = true,
  onClose,
}: {
  autoFocus?: boolean
  onClose?: () => void
} = {}) {
  const rootRef = useRef<TElement | null>(null)
  const activeIndexRef = useRef(0)
  const didAutoFocusRef = useRef(false)

  const syncItems = useCallback((preferredIndex?: number) => {
    const root = rootRef.current

    if (!root) {
      return []
    }

    const items = getCanvasMenuItems(root)
    const enabledItems = items.filter(isCanvasMenuItemEnabled)
    const focusedIndex = enabledItems.findIndex((item) =>
      item === root.ownerDocument.activeElement)
    const activeIndex = getCanvasMenuActiveIndex({
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

    const items = syncItems()

    didAutoFocusRef.current = true
    items[activeIndexRef.current]?.focus()
  }, [autoFocus, syncItems])

  const setRoot = useCallback((root: TElement | null) => {
    rootRef.current = root

    if (!root) {
      didAutoFocusRef.current = false
      return
    }

    syncItems()
    focusInitialItem()
  }, [focusInitialItem, syncItems])

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
    const nextIndex = getCanvasMenuKeyIndex({
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

function getCanvasMenuActiveIndex({
  count,
  focusedIndex,
  preferredIndex,
}: {
  count: number
  focusedIndex: number
  preferredIndex: number
}) {
  if (count === 0) {
    return 0
  }

  if (focusedIndex >= 0) {
    return focusedIndex
  }

  return Math.max(0, Math.min(preferredIndex, count - 1))
}

function getCanvasMenuKeyIndex({
  count,
  currentIndex,
  key,
}: {
  count: number
  currentIndex: number
  key: string
}) {
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
