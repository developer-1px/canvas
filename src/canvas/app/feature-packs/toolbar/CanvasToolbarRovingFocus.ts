import {
  useCallback,
  useLayoutEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'

import {
  getCanvasToolbarRovingActiveIndex,
  runCanvasToolbarRovingKeyboardIntent,
} from './CanvasToolbarRovingFocusKeyboard'
import type {
  CanvasToolbarRovingFocusOptions,
} from './CanvasToolbarRovingFocusContracts'

export {
  CANVAS_TOOLBAR_FOCUS_MODEL,
  CANVAS_TOOLBAR_ITEM_PROPS,
  CANVAS_TOOLBAR_KEYBOARD_MODEL,
  CANVAS_TOOLBAR_ROVING_FOCUS_MODEL,
} from './CanvasToolbarRovingFocusContracts'
export {
  getCanvasToolbarRovingActiveIndex,
  getCanvasToolbarRovingKeyIndex,
  getCanvasToolbarRovingKeyboardIntent,
  runCanvasToolbarRovingKeyboardIntent,
} from './CanvasToolbarRovingFocusKeyboard'
export type {
  CanvasToolbarOrientation,
  CanvasToolbarRovingActiveIndexInput,
  CanvasToolbarRovingFocusOptions,
  CanvasToolbarRovingKeyboardEvent,
  CanvasToolbarRovingKeyboardIntent,
  CanvasToolbarRovingKeyboardIntentInput,
  CanvasToolbarRovingKeyIndexInput,
  RunCanvasToolbarRovingKeyboardIntentInput,
} from './CanvasToolbarRovingFocusContracts'

const CANVAS_TOOLBAR_ITEM_SELECTOR = '[data-canvas-toolbar-item]'

type CanvasToolbarRovingItem = HTMLElement & {
  disabled?: boolean
}

export function useCanvasToolbarRovingFocus<
  TElement extends HTMLElement = HTMLElement,
>({
  orientation = 'both',
}: CanvasToolbarRovingFocusOptions = {}) {
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
      orientation,
    })
  }, [focusItem, orientation, syncItems])

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
