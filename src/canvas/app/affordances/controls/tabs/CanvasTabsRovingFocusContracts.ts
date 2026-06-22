export const CANVAS_TABS_ROVING_FOCUS_MODEL = 'canvas-tabs-roving-focus'
export const CANVAS_TABS_KEYBOARD_MODEL = 'arrow-home-end-enter-space'

export type CanvasTabsActivationMode = 'automatic' | 'manual'
export type CanvasTabsOrientation = 'horizontal' | 'vertical'

export type CanvasTabsTabInput<TId extends string = string> = {
  disabled?: boolean
  id: TId
  panelId: string
  tabId: string
}

export type CanvasTabsTablistAttributes = {
  'aria-label': string | undefined
  'aria-orientation': CanvasTabsOrientation | undefined
  role: 'tablist'
}

export type CanvasTabsTabAttributes = {
  'aria-controls': string
  'aria-disabled': true | undefined
  'aria-selected': boolean
  id: string
  role: 'tab'
  tabIndex: number | undefined
}

export type CanvasTabsPanelAttributes = {
  'aria-labelledby': string
  hidden: boolean
  id: string
  role: 'tabpanel'
}

export type CanvasTabsTabDescriptor<
  TId extends string = string,
  TTab extends CanvasTabsTabInput<TId> = CanvasTabsTabInput<TId>,
> =
  TTab & {
    attributes: CanvasTabsTabAttributes
    isActive: boolean
  }

export type CanvasTabsPanelDescriptor<TId extends string = string> = {
  attributes: CanvasTabsPanelAttributes
  id: TId
  isActive: boolean
}

export type CanvasTabsDescriptor<
  TId extends string = string,
  TTab extends CanvasTabsTabInput<TId> = CanvasTabsTabInput<TId>,
> = {
  activation: CanvasTabsActivationMode
  activeId: string
  keyboardModel: typeof CANVAS_TABS_KEYBOARD_MODEL
  orientation: CanvasTabsOrientation
  panels: CanvasTabsPanelDescriptor<TId>[]
  tablistAttributes: CanvasTabsTablistAttributes
  tabs: CanvasTabsTabDescriptor<TId, TTab>[]
}

export type CanvasTabsKeyboardIntent<TId extends string = string> =
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }
  | {
      activate: boolean
      id: TId
      index: number
      kind: 'move-tab'
      preventDefault: true
      stopPropagation: true
    }

export type CanvasTabsKeyboardIntentInput<
  TId extends string = string,
> = {
  activation?: CanvasTabsActivationMode
  currentId: string
  key: string
  orientation?: CanvasTabsOrientation
  tabs: readonly CanvasTabsTabInput<TId>[]
}

export type CanvasTabsKeyboardEvent = {
  key: string
  preventDefault: () => void
  stopPropagation: () => void
}

export type RunCanvasTabsKeyboardIntentInput<
  TId extends string = string,
> = Omit<CanvasTabsKeyboardIntentInput<TId>, 'key'> & {
  event: CanvasTabsKeyboardEvent
  onActivateTab: (id: TId, index: number) => void
  onFocusTab: (id: TId, index: number) => void
}
