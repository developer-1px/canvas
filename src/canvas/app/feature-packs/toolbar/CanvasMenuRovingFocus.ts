import {
  useCallback,
  useLayoutEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'
import {
  getCanvasMenuRestoreFocusTarget,
  restoreCanvasMenuFocus,
} from './CanvasMenuFocusRestore'
import {
  getCanvasMenuItems,
  isCanvasMenuItemEnabled,
} from './CanvasMenuItems'
import {
  getCanvasMenuRovingActiveIndex,
  runCanvasMenuRovingKeyboardIntent,
} from './CanvasMenuKeyboard'
import type {
  CanvasMenuRovingFocusOptions,
} from './CanvasMenuRovingFocusContracts'

export {
  getCanvasMenuRestoreFocusTarget,
  restoreCanvasMenuFocus,
} from './CanvasMenuFocusRestore'
export {
  getCanvasMenuRovingActiveIndex,
  getCanvasMenuRovingKeyboardIntent,
  getCanvasMenuRovingKeyIndex,
  getCanvasMenuTriggerKeyboardIntent,
  runCanvasMenuRovingKeyboardIntent,
} from './CanvasMenuKeyboard'
export {
  CANVAS_MENU_FOCUS_MODEL,
  CANVAS_MENU_FOCUS_RESTORE_MODEL,
  CANVAS_MENU_ITEM_PROPS,
  CANVAS_MENU_KEYBOARD_KEYS,
  CANVAS_MENU_ROVING_FOCUS_MODEL,
  CANVAS_SELECTION_TOOLBAR_DROPDOWN_MENU_MODEL,
} from './CanvasMenuRovingFocusContracts'
export type {
  CanvasMenuRovingActiveIndexInput,
  CanvasMenuRovingFocusOptions,
  CanvasMenuRovingKeyboardEvent,
  CanvasMenuRovingKeyboardIntent,
  CanvasMenuRovingKeyboardIntentInput,
  CanvasMenuRovingKeyIndexInput,
  CanvasMenuTriggerKeyboardIntent,
  CanvasMenuTriggerKeyboardIntentInput,
  RunCanvasMenuRovingKeyboardIntentInput,
} from './CanvasMenuRovingFocusContracts'

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
    runCanvasMenuRovingKeyboardIntent({
      count: items.length,
      currentIndex,
      event,
      onActivateItem: (index) => {
        items[index]?.click()
      },
      onClose: () => {
        onClose?.()
      },
      onMoveFocus: focusItem,
    })
  }, [focusItem, onClose, syncItems])

  return {
    ref: setRoot,
    onFocus,
    onKeyDown,
  }
}
