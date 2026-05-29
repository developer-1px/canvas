import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  CANVAS_APP_CUSTOM_FOCUS_EVENT,
  getCanvasAppCustomFocusForSelection,
  isCanvasAppCustomFocusEvent,
  type CanvasAppCustomFocus,
} from './CanvasAppCustomFocus'

export function useCanvasAppCustomFocus({
  selection,
}: {
  selection: readonly string[]
}) {
  const [customFocus, setCustomFocus] =
    useState<CanvasAppCustomFocus | null>(null)

  useEffect(() => {
    const handleCustomFocus = (event: Event) => {
      if (isCanvasAppCustomFocusEvent(event)) {
        setCustomFocus(event.detail)
      }
    }

    window.addEventListener(CANVAS_APP_CUSTOM_FOCUS_EVENT, handleCustomFocus)

    return () => {
      window.removeEventListener(
        CANVAS_APP_CUSTOM_FOCUS_EVENT,
        handleCustomFocus,
      )
    }
  }, [])

  return useMemo(
    () => getCanvasAppCustomFocusForSelection({
      focus: customFocus,
      selection,
    }),
    [customFocus, selection],
  )
}
