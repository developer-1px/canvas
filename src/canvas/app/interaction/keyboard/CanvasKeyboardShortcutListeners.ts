import {
  handleCanvasKeyboardShortcut,
  type CanvasKeyboardShortcutHandlers,
} from './CanvasKeyboardShortcutRouter'
import {
  runCanvasKeyboardSystemKeyUp,
  runCanvasKeyboardSystemWindowBlur,
} from './CanvasKeyboardSystemDispatch'

type CanvasKeyboardShortcutListenerType = 'blur' | 'keydown' | 'keyup'

export type CanvasKeyboardShortcutHandlerRef = {
  current: CanvasKeyboardShortcutHandlers
}

export type CanvasKeyboardShortcutEventTarget = {
  addEventListener: (
    type: CanvasKeyboardShortcutListenerType,
    listener: EventListener,
  ) => void
  removeEventListener: (
    type: CanvasKeyboardShortcutListenerType,
    listener: EventListener,
  ) => void
}

export function bindCanvasKeyboardShortcutListeners({
  handlersRef,
  target,
}: {
  handlersRef: CanvasKeyboardShortcutHandlerRef
  target: CanvasKeyboardShortcutEventTarget
}) {
  const handleKeyDown: EventListener = (event) => {
    handleCanvasKeyboardShortcut(
      event as globalThis.KeyboardEvent,
      handlersRef.current,
    )
  }

  const handleKeyUp: EventListener = (event) => {
    const handlers = handlersRef.current

    runCanvasKeyboardSystemKeyUp({
      config: handlers.config,
      event: event as globalThis.KeyboardEvent,
      handlers,
    })
  }

  const handleWindowBlur: EventListener = () => {
    runCanvasKeyboardSystemWindowBlur({ handlers: handlersRef.current })
  }

  target.addEventListener('keydown', handleKeyDown)
  target.addEventListener('keyup', handleKeyUp)
  target.addEventListener('blur', handleWindowBlur)

  return () => {
    target.removeEventListener('keydown', handleKeyDown)
    target.removeEventListener('keyup', handleKeyUp)
    target.removeEventListener('blur', handleWindowBlur)
  }
}
