import type {
  CanvasTabsKeyboardIntent,
  CanvasTabsKeyboardIntentInput,
  RunCanvasTabsKeyboardIntentInput,
  CanvasTabsOrientation,
} from './CanvasTabsRovingFocusContracts'

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
