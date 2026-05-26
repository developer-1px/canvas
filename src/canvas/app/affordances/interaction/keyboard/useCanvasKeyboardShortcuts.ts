import {
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import type { CanvasKeyboardShortcutHandlers } from './CanvasKeyboardShortcutRouter'
import { bindCanvasKeyboardShortcutListeners } from './CanvasKeyboardShortcutListeners'

export function useCanvasKeyboardShortcuts(
  handlers: CanvasKeyboardShortcutHandlers,
) {
  const handlersRef = useRef<CanvasKeyboardShortcutHandlers>(handlers)

  useLayoutEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  useEffect(
    () =>
      bindCanvasKeyboardShortcutListeners({
        handlersRef,
        target: window,
      }),
    [],
  )
}
