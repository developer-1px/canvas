import type {
  CanvasTabsActivationMode,
  CanvasTabsDescriptor,
  CanvasTabsOrientation,
  CanvasTabsPanelAttributes,
  CanvasTabsTabAttributes,
  CanvasTabsTabInput,
  CanvasTabsTablistAttributes,
} from './CanvasTabsRovingFocusContracts'
import {
  CANVAS_TABS_KEYBOARD_MODEL,
} from './CanvasTabsRovingFocusContracts'

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
