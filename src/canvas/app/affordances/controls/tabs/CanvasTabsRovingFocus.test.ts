import { describe, expect, it } from 'vitest'
import {
  CANVAS_TABS_KEYBOARD_MODEL,
  CANVAS_TABS_ROVING_FOCUS_MODEL,
  createCanvasTabsDescriptor,
  getCanvasTabsKeyboardIntent,
  runCanvasTabsKeyboardIntent,
} from './CanvasTabsRovingFocus'

const tabs = [
  {
    id: 'slide',
    panelId: 'panel-slide',
    tabId: 'tab-slide',
  },
  {
    id: 'selection',
    panelId: 'panel-selection',
    tabId: 'tab-selection',
  },
  {
    id: 'notes',
    panelId: 'panel-notes',
    tabId: 'tab-notes',
  },
] as const

describe('CanvasTabsRovingFocus', () => {
  it('exposes a stable roving focus model metadata value', () => {
    expect(CANVAS_TABS_ROVING_FOCUS_MODEL).toBe('canvas-tabs-roving-focus')
  })

  it('creates APG tab and tabpanel relationships', () => {
    const descriptor = createCanvasTabsDescriptor({
      ariaLabel: 'Inspector panels',
      activeId: 'selection',
      tabs,
    })

    expect(descriptor.activation).toBe('automatic')
    expect(descriptor.activeId).toBe('selection')
    expect(descriptor.keyboardModel).toBe(CANVAS_TABS_KEYBOARD_MODEL)
    expect(descriptor.orientation).toBe('horizontal')
    expect(descriptor.tablistAttributes).toEqual({
      'aria-label': 'Inspector panels',
      'aria-orientation': undefined,
      role: 'tablist',
    })
    expect(descriptor.tabs).toEqual([
      {
        ...tabs[0],
        attributes: {
          'aria-controls': 'panel-slide',
          'aria-disabled': undefined,
          'aria-selected': false,
          id: 'tab-slide',
          role: 'tab',
          tabIndex: -1,
        },
        isActive: false,
      },
      {
        ...tabs[1],
        attributes: {
          'aria-controls': 'panel-selection',
          'aria-disabled': undefined,
          'aria-selected': true,
          id: 'tab-selection',
          role: 'tab',
          tabIndex: 0,
        },
        isActive: true,
      },
      {
        ...tabs[2],
        attributes: {
          'aria-controls': 'panel-notes',
          'aria-disabled': undefined,
          'aria-selected': false,
          id: 'tab-notes',
          role: 'tab',
          tabIndex: -1,
        },
        isActive: false,
      },
    ])
    expect(descriptor.panels).toEqual([
      {
        attributes: {
          'aria-labelledby': 'tab-slide',
          hidden: true,
          id: 'panel-slide',
          role: 'tabpanel',
        },
        id: 'slide',
        isActive: false,
      },
      {
        attributes: {
          'aria-labelledby': 'tab-selection',
          hidden: false,
          id: 'panel-selection',
          role: 'tabpanel',
        },
        id: 'selection',
        isActive: true,
      },
      {
        attributes: {
          'aria-labelledby': 'tab-notes',
          hidden: true,
          id: 'panel-notes',
          role: 'tabpanel',
        },
        id: 'notes',
        isActive: false,
      },
    ])
  })

  it('describes vertical tablists and keeps arrow navigation on the active axis', () => {
    const descriptor = createCanvasTabsDescriptor({
      activeId: 'slide',
      orientation: 'vertical',
      tabs,
    })

    expect(descriptor.orientation).toBe('vertical')
    expect(descriptor.tablistAttributes).toEqual({
      'aria-label': undefined,
      'aria-orientation': 'vertical',
      role: 'tablist',
    })
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'slide',
      key: 'ArrowDown',
      orientation: 'vertical',
      tabs,
    })).toMatchObject({
      id: 'selection',
      index: 1,
      kind: 'move-tab',
    })
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'slide',
      key: 'ArrowRight',
      orientation: 'vertical',
      tabs,
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'slide',
      key: 'ArrowDown',
      tabs,
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('moves and activates tabs with arrow home and end keys in automatic mode', () => {
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'slide',
      key: 'ArrowRight',
      tabs,
    })).toMatchObject({
      activate: true,
      id: 'selection',
      index: 1,
      kind: 'move-tab',
      preventDefault: true,
      stopPropagation: true,
    })
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'slide',
      key: 'ArrowLeft',
      tabs,
    })).toMatchObject({
      activate: true,
      id: 'notes',
      index: 2,
    })
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'notes',
      key: 'Home',
      tabs,
    })).toMatchObject({
      activate: true,
      id: 'slide',
      index: 0,
    })
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'slide',
      key: 'End',
      tabs,
    })).toMatchObject({
      activate: true,
      id: 'notes',
      index: 2,
    })
  })

  it('separates roving focus from activation in manual mode', () => {
    expect(getCanvasTabsKeyboardIntent({
      activation: 'manual',
      currentId: 'slide',
      key: 'ArrowRight',
      tabs,
    })).toMatchObject({
      activate: false,
      id: 'selection',
      index: 1,
      kind: 'move-tab',
      preventDefault: true,
    })
    expect(getCanvasTabsKeyboardIntent({
      activation: 'manual',
      currentId: 'selection',
      key: 'Enter',
      tabs,
    })).toMatchObject({
      activate: true,
      id: 'selection',
      index: 1,
    })
    expect(getCanvasTabsKeyboardIntent({
      activation: 'manual',
      currentId: 'selection',
      key: ' ',
      tabs,
    })).toMatchObject({
      activate: true,
      id: 'selection',
      index: 1,
    })
  })

  it('skips disabled tabs when moving focus', () => {
    const tabsWithDisabled = [
      tabs[0],
      {
        ...tabs[1],
        disabled: true,
      },
      tabs[2],
    ] as const

    const descriptor = createCanvasTabsDescriptor({
      activeId: 'selection',
      tabs: tabsWithDisabled,
    })

    expect(descriptor.activeId).toBe('slide')
    expect(descriptor.tabs[0].isActive).toBe(true)
    expect(descriptor.tabs[1].attributes).toMatchObject({
      'aria-disabled': true,
      'aria-selected': false,
      tabIndex: undefined,
    })
    expect(descriptor.panels[0].attributes.hidden).toBe(false)
    expect(descriptor.panels[1].attributes.hidden).toBe(true)
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'slide',
      key: 'ArrowRight',
      tabs: tabsWithDisabled,
    })).toMatchObject({
      id: 'notes',
      index: 2,
    })
  })

  it('returns a none intent for unrelated keys or invalid current tabs', () => {
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'slide',
      key: 'A',
      tabs,
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'missing',
      key: 'ArrowRight',
      tabs,
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('runs automatic tab keyboard intents by consuming the event, focusing, and activating', () => {
    let preventDefaultCount = 0
    let stopPropagationCount = 0
    let focusedId: string | null = null
    let focusedIndex: number | null = null
    let activatedId: string | null = null
    let activatedIndex: number | null = null

    expect(runCanvasTabsKeyboardIntent({
      currentId: 'slide',
      event: {
        key: 'ArrowRight',
        preventDefault: () => {
          preventDefaultCount += 1
        },
        stopPropagation: () => {
          stopPropagationCount += 1
        },
      },
      onActivateTab: (id, index) => {
        activatedId = id
        activatedIndex = index
      },
      onFocusTab: (id, index) => {
        focusedId = id
        focusedIndex = index
      },
      tabs,
    })).toBe(true)

    expect(preventDefaultCount).toBe(1)
    expect(stopPropagationCount).toBe(1)
    expect(focusedId).toBe('selection')
    expect(focusedIndex).toBe(1)
    expect(activatedId).toBe('selection')
    expect(activatedIndex).toBe(1)
  })

  it('runs manual tab keyboard intents without activating arrow navigation', () => {
    let activatedCount = 0
    let focusedId: string | null = null

    expect(runCanvasTabsKeyboardIntent({
      activation: 'manual',
      currentId: 'slide',
      event: {
        key: 'ArrowRight',
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
      },
      onActivateTab: () => {
        activatedCount += 1
      },
      onFocusTab: (id) => {
        focusedId = id
      },
      tabs,
    })).toBe(true)

    expect(focusedId).toBe('selection')
    expect(activatedCount).toBe(0)
  })

  it('runs manual tab activation keys against the current tab', () => {
    let activatedId: string | null = null
    let focusedId: string | null = null

    expect(runCanvasTabsKeyboardIntent({
      activation: 'manual',
      currentId: 'selection',
      event: {
        key: 'Enter',
        preventDefault: () => undefined,
        stopPropagation: () => undefined,
      },
      onActivateTab: (id) => {
        activatedId = id
      },
      onFocusTab: (id) => {
        focusedId = id
      },
      tabs,
    })).toBe(true)

    expect(focusedId).toBe('selection')
    expect(activatedId).toBe('selection')
  })

  it('does not consume unsupported tab keys', () => {
    let preventDefaultCount = 0
    let stopPropagationCount = 0
    let focusedCount = 0
    let activatedCount = 0

    expect(runCanvasTabsKeyboardIntent({
      currentId: 'slide',
      event: {
        key: 'Escape',
        preventDefault: () => {
          preventDefaultCount += 1
        },
        stopPropagation: () => {
          stopPropagationCount += 1
        },
      },
      onActivateTab: () => {
        activatedCount += 1
      },
      onFocusTab: () => {
        focusedCount += 1
      },
      tabs,
    })).toBe(false)

    expect(preventDefaultCount).toBe(0)
    expect(stopPropagationCount).toBe(0)
    expect(focusedCount).toBe(0)
    expect(activatedCount).toBe(0)
  })
})
