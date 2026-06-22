export const CANVAS_MODAL_FOCUS_LIFECYCLE_MODEL =
  'canvas-modal-focus-lifecycle'

export const CANVAS_MODAL_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export type CanvasModalFocusTarget = HTMLElement & {
  disabled?: boolean
}

export type CanvasModalFocusRef<TElement extends HTMLElement = HTMLElement> = {
  current: TElement | null
}

export type CanvasModalTabFocusEvent = {
  key: string
  shiftKey: boolean
  preventDefault: () => void
  stopPropagation: () => void
}

export type CanvasModalBackdropPointerEvent =
  CanvasModalBackdropPointerIntentInput & {
    preventDefault: () => void
    stopPropagation: () => void
  }

export type CanvasModalKeyboardEvent = CanvasModalTabFocusEvent

export type CanvasModalBackdropPointerIntentInput = {
  currentTarget: EventTarget | null
  target: EventTarget | null
}

export type CanvasModalBackdropPointerIntent =
  | {
      kind: 'dismiss'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }

export type CanvasModalKeyboardIntentInput = {
  key: string
}

export type CanvasModalKeyboardIntent =
  | {
      kind: 'close'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'trap-focus'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }

export type RunCanvasModalBackdropPointerIntentInput = {
  event: CanvasModalBackdropPointerEvent
  onDismiss: () => void
}

export type RunCanvasModalKeyboardIntentInput = {
  event: CanvasModalKeyboardEvent
  onClose: () => void
  root: HTMLElement | null
}
