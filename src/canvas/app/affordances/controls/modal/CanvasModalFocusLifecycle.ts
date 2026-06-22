import {
  useEffect,
  useRef,
} from 'react'
import {
  focusCanvasModalElement,
  getCanvasModalRestoreFocusTarget,
  restoreCanvasModalFocus,
} from './CanvasModalFocusLifecycleFocus'
import type {
  CanvasModalFocusRef,
} from './CanvasModalFocusLifecycleContracts'

export {
  CANVAS_MODAL_FOCUSABLE_SELECTOR,
  CANVAS_MODAL_FOCUS_LIFECYCLE_MODEL,
} from './CanvasModalFocusLifecycleContracts'
export {
  focusCanvasModalElement,
  getCanvasModalFocusableElements,
  getCanvasModalNextFocusIndex,
  getCanvasModalRestoreFocusTarget,
  restoreCanvasModalFocus,
} from './CanvasModalFocusLifecycleFocus'
export {
  getCanvasModalBackdropPointerIntent,
  getCanvasModalKeyboardIntent,
  runCanvasModalBackdropPointerIntent,
  runCanvasModalKeyboardIntent,
  trapCanvasModalTabFocus,
} from './CanvasModalFocusLifecycleIntent'
export type {
  CanvasModalBackdropPointerEvent,
  CanvasModalBackdropPointerIntent,
  CanvasModalBackdropPointerIntentInput,
  CanvasModalFocusRef,
  CanvasModalFocusTarget,
  CanvasModalKeyboardEvent,
  CanvasModalKeyboardIntent,
  CanvasModalKeyboardIntentInput,
  CanvasModalTabFocusEvent,
  RunCanvasModalBackdropPointerIntentInput,
  RunCanvasModalKeyboardIntentInput,
} from './CanvasModalFocusLifecycleContracts'

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
