import {
  getCanvasFindInputKeyboardIntent,
} from './CanvasFindReplaceKeyboard'

type CanvasFindReplacePanelKeyboardEvent = {
  key: string
  preventDefault: () => void
  shiftKey?: boolean
  stopPropagation: () => void
}

export function runCanvasFindReplacePanelKeyboardIntent({
  event,
  onClose,
}: {
  event: CanvasFindReplacePanelKeyboardEvent
  onClose: () => void
}) {
  const keyboardIntent = getCanvasFindInputKeyboardIntent({
    key: event.key,
    shiftKey: event.shiftKey,
  })

  if (keyboardIntent.kind !== 'close-find') {
    return false
  }

  if (keyboardIntent.preventDefault) {
    event.preventDefault()
  }
  if (keyboardIntent.stopPropagation) {
    event.stopPropagation()
  }

  onClose()
  return true
}
