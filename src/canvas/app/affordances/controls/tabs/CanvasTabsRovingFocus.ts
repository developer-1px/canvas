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

export function createCanvasTabsDescriptor<
  TTab extends CanvasTabsTabInput<string>,
>({
  ariaLabel,
  activation = 'automatic',
  activeId,
  orientation = 'horizontal',
  tabs,
}: {
  ariaLabel?: string
  activation?: CanvasTabsActivationMode
  activeId: string
  orientation?: CanvasTabsOrientation
  tabs: readonly TTab[]
}): CanvasTabsDescriptor<TTab['id'], TTab> {
  const resolvedActiveId = getCanvasTabsResolvedActiveId({ activeId, tabs })

  return {
    activation,
    activeId: resolvedActiveId,
    keyboardModel: CANVAS_TABS_KEYBOARD_MODEL,
    orientation,
    panels: tabs.map((tab) => ({
      attributes: getCanvasTabsPanelAttributes({
        activeId: resolvedActiveId,
        tab,
      }),
      id: tab.id,
      isActive: isCanvasTabsTabActive({
        activeId: resolvedActiveId,
        tab,
      }),
    })),
    tablistAttributes: getCanvasTabsTablistAttributes({
      ariaLabel,
      orientation,
    }),
    tabs: tabs.map((tab) => ({
      ...tab,
      attributes: getCanvasTabsTabAttributes({
        activeId: resolvedActiveId,
        tab,
      }),
      isActive: isCanvasTabsTabActive({
        activeId: resolvedActiveId,
        tab,
      }),
    })),
  }
}

export function getCanvasTabsTablistAttributes({
  ariaLabel,
  orientation = 'horizontal',
}: {
  ariaLabel?: string
  orientation?: CanvasTabsOrientation
}): CanvasTabsTablistAttributes {
  return {
    'aria-label': ariaLabel,
    'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
    role: 'tablist',
  }
}

export function getCanvasTabsTabAttributes<TId extends string>({
  activeId,
  tab,
}: {
  activeId: string
  tab: CanvasTabsTabInput<TId>
}): CanvasTabsTabAttributes {
  const isActive = isCanvasTabsTabActive({ activeId, tab })

  return {
    'aria-controls': tab.panelId,
    'aria-disabled': tab.disabled === true ? true : undefined,
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
  activeId: string
  tab: CanvasTabsTabInput<TId>
}): CanvasTabsPanelAttributes {
  const isActive = isCanvasTabsTabActive({ activeId, tab })

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
  orientation = 'horizontal',
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
    orientation,
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
  orientation,
  tabs,
}: RunCanvasTabsKeyboardIntentInput<TId>) {
  const intent = getCanvasTabsKeyboardIntent({
    activation,
    currentId,
    key: event.key,
    orientation,
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
  orientation,
}: {
  count: number
  currentIndex: number
  key: string
  orientation: CanvasTabsOrientation
}) {
  if (count === 0 || currentIndex < 0) {
    return null
  }

  if (
    (orientation === 'horizontal' && key === 'ArrowRight') ||
    (orientation === 'vertical' && key === 'ArrowDown')
  ) {
    return (currentIndex + 1) % count
  }

  if (
    (orientation === 'horizontal' && key === 'ArrowLeft') ||
    (orientation === 'vertical' && key === 'ArrowUp')
  ) {
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

function getCanvasTabsResolvedActiveId<TId extends string>({
  activeId,
  tabs,
}: {
  activeId: string
  tabs: readonly CanvasTabsTabInput<TId>[]
}) {
  const activeTab = tabs.find((tab) => tab.id === activeId)

  if (activeTab && activeTab.disabled !== true) {
    return activeId
  }

  return tabs.find((tab) => tab.disabled !== true)?.id ?? activeId
}

function isCanvasTabsTabActive<TId extends string>({
  activeId,
  tab,
}: {
  activeId: string
  tab: CanvasTabsTabInput<TId>
}) {
  return tab.disabled !== true && tab.id === activeId
}
