import {
  useCallback,
  useLayoutEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'

export const CANVAS_TOOLBAR_ITEM_PROPS = {
  'data-canvas-toolbar-item': '',
} as const

const CANVAS_TOOLBAR_ITEM_SELECTOR = '[data-canvas-toolbar-item]'

type CanvasToolbarRovingItem = HTMLElement & {
  disabled?: boolean
}

export function useCanvasToolbarRovingFocus<
  TElement extends HTMLElement = HTMLElement,
>() {
  const rootRef = useRef<TElement | null>(null)
  const activeIndexRef = useRef(0)

  const syncItems = useCallback((preferredIndex?: number) => {
    const root = rootRef.current

    if (!root) {
      return []
    }

    const items = getCanvasToolbarRovingItems(root)
    const enabledItems = items.filter(isCanvasToolbarRovingItemEnabled)
    const focusedIndex = enabledItems.findIndex((item) =>
      item === root.ownerDocument.activeElement)
    const activeIndex = getCanvasToolbarRovingActiveIndex({
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

  const setRoot = useCallback((root: TElement | null) => {
    rootRef.current = root

    if (root) {
      syncItems()
    }
  }, [syncItems])

  useLayoutEffect(() => {
    syncItems()
  })

  const focusItem = useCallback((index: number) => {
    const items = syncItems(index)

    items[index]?.focus()
  }, [syncItems])

  const onFocus = useCallback((event: FocusEvent<TElement>) => {
    const items = getCanvasToolbarRovingItems(event.currentTarget)
      .filter(isCanvasToolbarRovingItemEnabled)
    const focusedIndex = items.findIndex((item) => item === event.target)

    if (focusedIndex >= 0) {
      syncItems(focusedIndex)
    }
  }, [syncItems])

  const onKeyDown = useCallback((event: KeyboardEvent<TElement>) => {
    const items = syncItems()
    const currentIndex = items.findIndex((item) =>
      item === event.currentTarget.ownerDocument.activeElement)
    const nextIndex = getCanvasToolbarRovingKeyIndex({
      count: items.length,
      currentIndex,
      key: event.key,
    })

    if (nextIndex === null) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    focusItem(nextIndex)
  }, [focusItem, syncItems])

  return {
    ref: setRoot,
    onFocus,
    onKeyDown,
  }
}

function getCanvasToolbarRovingItems(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<CanvasToolbarRovingItem>(
      CANVAS_TOOLBAR_ITEM_SELECTOR,
    ),
  )
}

function isCanvasToolbarRovingItemEnabled(item: CanvasToolbarRovingItem) {
  return !item.disabled && item.getAttribute('aria-disabled') !== 'true'
}

function getCanvasToolbarRovingActiveIndex({
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

function getCanvasToolbarRovingKeyIndex({
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

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return (currentIndex + 1) % count
  }

  if (key === 'ArrowLeft' || key === 'ArrowUp') {
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
