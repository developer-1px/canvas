export const CANVAS_TABS_ROVING_FOCUS_MODEL = 'canvas-tabs-roving-focus'
export const CANVAS_TABS_KEYBOARD_MODEL = 'arrow-home-end-enter-space'

export type CanvasTabsActivationMode = 'automatic' | 'manual'

export type CanvasTabsTabInput<TId extends string = string> = {
  disabled?: boolean
  id: TId
  panelId: string
  tabId: string
}

export type CanvasTabsTabAttributes = {
  'aria-controls': string
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
  activeId: TId
  keyboardModel: typeof CANVAS_TABS_KEYBOARD_MODEL
  panels: CanvasTabsPanelDescriptor<TId>[]
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
  currentId: TId
  key: string
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

export function createCanvasTabsDescriptor<
  TId extends string,
  TTab extends CanvasTabsTabInput<TId> = CanvasTabsTabInput<TId>,
>({
  activation = 'automatic',
  activeId,
  tabs,
}: {
  activation?: CanvasTabsActivationMode
  activeId: TId
  tabs: readonly TTab[]
}): CanvasTabsDescriptor<TId, TTab> {
  return {
    activation,
    activeId,
    keyboardModel: CANVAS_TABS_KEYBOARD_MODEL,
    panels: tabs.map((tab) => ({
      attributes: getCanvasTabsPanelAttributes({ activeId, tab }),
      id: tab.id,
      isActive: tab.id === activeId,
    })),
    tabs: tabs.map((tab) => ({
      ...tab,
      attributes: getCanvasTabsTabAttributes({ activeId, tab }),
      isActive: tab.id === activeId,
    })),
  }
}

export function getCanvasTabsTabAttributes<TId extends string>({
  activeId,
  tab,
}: {
  activeId: TId
  tab: CanvasTabsTabInput<TId>
}): CanvasTabsTabAttributes {
  const isActive = tab.id === activeId

  return {
    'aria-controls': tab.panelId,
    'aria-selected': isActive,
    id: tab.tabId,
    role: 'tab',
    tabIndex: getCanvasTabsTabIndex({
      active: isActive,
      disabled: tab.disabled === true,
    }),
  }
}

export function getCanvasTabsPanelAttributes<TId extends string>({
  activeId,
  tab,
}: {
  activeId: TId
  tab: CanvasTabsTabInput<TId>
}): CanvasTabsPanelAttributes {
  const isActive = tab.id === activeId

  return {
    'aria-labelledby': tab.tabId,
    hidden: !isActive,
    id: tab.panelId,
    role: 'tabpanel',
  }
}

export function getCanvasTabsTabIndex({
  active,
  disabled,
}: {
  active: boolean
  disabled: boolean
}) {
  if (disabled) {
    return undefined
  }

  return active ? 0 : -1
}

export function getCanvasTabsKeyboardIntent<TId extends string>({
  activation = 'automatic',
  currentId,
  key,
  tabs,
}: CanvasTabsKeyboardIntentInput<TId>): CanvasTabsKeyboardIntent<TId> {
  const enabledTabs = tabs.filter((tab) => tab.disabled !== true)
  const currentEnabledIndex = enabledTabs.findIndex((tab) => tab.id === currentId)

  if (enabledTabs.length === 0 || currentEnabledIndex < 0) {
    return {
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    }
  }

  const nextEnabledIndex = getCanvasTabsKeyIndex({
    count: enabledTabs.length,
    currentIndex: currentEnabledIndex,
    key,
  })

  if (nextEnabledIndex === null) {
    return {
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    }
  }

  const nextTab = enabledTabs[nextEnabledIndex]
  const index = tabs.findIndex((tab) => tab.id === nextTab.id)

  return {
    activate: activation === 'automatic' || key === 'Enter' || key === ' ',
    id: nextTab.id,
    index,
    kind: 'move-tab',
    preventDefault: true,
    stopPropagation: true,
  }
}

export function runCanvasTabsKeyboardIntent<TId extends string>({
  activation,
  currentId,
  event,
  onActivateTab,
  onFocusTab,
  tabs,
}: RunCanvasTabsKeyboardIntentInput<TId>) {
  const intent = getCanvasTabsKeyboardIntent({
    activation,
    currentId,
    key: event.key,
    tabs,
  })

  if (intent.kind === 'none') {
    return false
  }

  if (intent.preventDefault) {
    event.preventDefault()
  }

  if (intent.stopPropagation) {
    event.stopPropagation()
  }

  onFocusTab(intent.id, intent.index)

  if (intent.activate) {
    onActivateTab(intent.id, intent.index)
  }

  return true
}

function getCanvasTabsKeyIndex({
  count,
  currentIndex,
  key,
}: {
  count: number
  currentIndex: number
  key: string
}) {
  if (count === 0 || currentIndex < 0) {
    return null
  }

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return (currentIndex + 1) % count
  }

  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return (currentIndex - 1 + count) % count
  }

  if (key === 'Home') {
    return 0
  }

  if (key === 'End') {
    return count - 1
  }

  if (key === 'Enter' || key === ' ') {
    return currentIndex
  }

  return null
}
