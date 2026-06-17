import { describe, expect, it } from 'vitest'
import {
  CANVAS_TABS_KEYBOARD_MODEL,
  CANVAS_TABS_ROVING_FOCUS_MODEL,
  createCanvasTabsDescriptor,
  getCanvasTabsKeyboardIntent,
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
      activeId: 'selection',
      tabs,
    })

    expect(descriptor.activation).toBe('automatic')
    expect(descriptor.keyboardModel).toBe(CANVAS_TABS_KEYBOARD_MODEL)
    expect(descriptor.tabs).toEqual([
      {
        ...tabs[0],
        attributes: {
          'aria-controls': 'panel-slide',
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
      activeId: 'slide',
      tabs: tabsWithDisabled,
    })

    expect(descriptor.tabs[1].attributes.tabIndex).toBeUndefined()
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
    })
    expect(getCanvasTabsKeyboardIntent({
      currentId: 'missing',
      key: 'ArrowRight',
      tabs,
    })).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })
})
