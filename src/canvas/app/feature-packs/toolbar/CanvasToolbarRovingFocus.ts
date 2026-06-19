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

export const CANVAS_TOOLBAR_ROVING_FOCUS_MODEL =
  'canvas-toolbar-roving-focus'
export const CANVAS_TOOLBAR_FOCUS_MODEL = 'roving-tabindex'
export const CANVAS_TOOLBAR_KEYBOARD_MODEL = 'arrow-home-end'

const CANVAS_TOOLBAR_ITEM_SELECTOR = '[data-canvas-toolbar-item]'

type CanvasToolbarRovingItem = HTMLElement & {
  disabled?: boolean
}

export type CanvasToolbarRovingActiveIndexInput = {
  count: number
  focusedIndex: number
  preferredIndex: number
}

export type CanvasToolbarRovingKeyIndexInput = {
  count: number
  currentIndex: number
  key: string
}

export type CanvasToolbarRovingKeyboardIntentInput =
  CanvasToolbarRovingKeyIndexInput

export type CanvasToolbarRovingKeyboardIntent =
  | {
      kind: 'move-focus'
      nextIndex: number
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }

export type CanvasToolbarRovingKeyboardEvent = {
  key: string
  preventDefault: () => void
  stopPropagation: () => void
}

export type RunCanvasToolbarRovingKeyboardIntentInput = {
  count: number
  currentIndex: number
  event: CanvasToolbarRovingKeyboardEvent
  onMoveFocus: (nextIndex: number) => void
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
    runCanvasToolbarRovingKeyboardIntent({
      count: items.length,
      currentIndex,
      event,
      onMoveFocus: focusItem,
    })
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

export function getCanvasToolbarRovingActiveIndex({
  count,
  focusedIndex,
  preferredIndex,
}: CanvasToolbarRovingActiveIndexInput) {
  if (count === 0) {
    return 0
  }

  if (focusedIndex >= 0) {
    return focusedIndex
  }

  return Math.max(0, Math.min(preferredIndex, count - 1))
}

export function getCanvasToolbarRovingKeyIndex({
  count,
  currentIndex,
  key,
}: CanvasToolbarRovingKeyIndexInput) {
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

export function getCanvasToolbarRovingKeyboardIntent({
  count,
  currentIndex,
  key,
}: CanvasToolbarRovingKeyboardIntentInput): CanvasToolbarRovingKeyboardIntent {
  const nextIndex = getCanvasToolbarRovingKeyIndex({
    count,
    currentIndex,
    key,
  })

  if (nextIndex === null) {
    return {
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    }
  }

  return {
    kind: 'move-focus',
    nextIndex,
    preventDefault: true,
    stopPropagation: true,
  }
}

export function runCanvasToolbarRovingKeyboardIntent({
  count,
  currentIndex,
  event,
  onMoveFocus,
}: RunCanvasToolbarRovingKeyboardIntentInput) {
  const intent = getCanvasToolbarRovingKeyboardIntent({
    count,
    currentIndex,
    key: event.key,
  })

  if (intent.kind === 'none') {
    return false
  }

  if (intent.preventDefault) {
    event.preventDefault()
  }
  if (intent.stopPropagation) {
    event.stopPropagation()
  }

  onMoveFocus(intent.nextIndex)
  return true
}
