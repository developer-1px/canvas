export const CANVAS_MENU_ITEM_PROPS = {
  'data-canvas-menu-item': '',
} as const

export const CANVAS_MENU_ROVING_FOCUS_MODEL = 'canvas-menu-roving-focus'
export const CANVAS_MENU_FOCUS_MODEL = 'enabled-menuitem-roving'
export const CANVAS_MENU_FOCUS_RESTORE_MODEL = 'canvas-menu-focus-restore'
export const CANVAS_MENU_KEYBOARD_KEYS =
  'arrow-left-right-up-down-home-end-enter-space-escape'
export const CANVAS_SELECTION_TOOLBAR_DROPDOWN_MENU_MODEL =
  'canvas-selection-toolbar-dropdown-menu'

export const CANVAS_MENU_ITEM_SELECTOR = '[data-canvas-menu-item]'

export type CanvasMenuItem = HTMLElement & {
  disabled?: boolean
}

export type CanvasMenuFocusTarget = HTMLElement & {
  disabled?: boolean
}

export type CanvasMenuRovingKeyIndexInput = {
  count: number
  currentIndex: number
  key: string
}

export type CanvasMenuRovingKeyboardIntentInput =
  CanvasMenuRovingKeyIndexInput

export type CanvasMenuRovingKeyboardIntent =
  | {
      kind: 'move-focus'
      nextIndex: number
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'close-menu'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'activate-item'
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }

export type CanvasMenuRovingKeyboardEvent = {
  key: string
  preventDefault: () => void
  stopPropagation: () => void
}

export type RunCanvasMenuRovingKeyboardIntentInput = {
  count: number
  currentIndex: number
  event: CanvasMenuRovingKeyboardEvent
  onActivateItem: (currentIndex: number) => void
  onClose: () => void
  onMoveFocus: (nextIndex: number) => void
}

export type CanvasMenuRovingActiveIndexInput = {
  count: number
  focusedIndex: number
  preferredIndex: number
}

export type CanvasMenuTriggerKeyboardIntentInput = {
  key: string
}

export type CanvasMenuTriggerKeyboardIntent =
  | {
      kind: 'open-menu'
      preventDefault: true
    }
  | {
      kind: 'none'
      preventDefault: false
    }

export type CanvasMenuRovingFocusOptions = {
  autoFocus?: boolean
  initialActiveIndex?: number
  onClose?: () => void
  preventScroll?: boolean
  restoreFocus?: boolean
}
