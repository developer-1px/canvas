export const CANVAS_TOOLBAR_ITEM_PROPS = {
  'data-canvas-toolbar-item': '',
} as const

export const CANVAS_TOOLBAR_ROVING_FOCUS_MODEL =
  'canvas-toolbar-roving-focus'
export const CANVAS_TOOLBAR_FOCUS_MODEL = 'roving-tabindex'
export const CANVAS_TOOLBAR_KEYBOARD_MODEL = 'arrow-home-end'

export type CanvasToolbarOrientation = 'both' | 'horizontal' | 'vertical'

export type CanvasToolbarRovingActiveIndexInput = {
  count: number
  focusedIndex: number
  preferredIndex: number
}

export type CanvasToolbarRovingKeyIndexInput = {
  count: number
  currentIndex: number
  key: string
  orientation?: CanvasToolbarOrientation
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
  orientation?: CanvasToolbarOrientation
}

export type CanvasToolbarRovingFocusOptions = {
  orientation?: CanvasToolbarOrientation
}
