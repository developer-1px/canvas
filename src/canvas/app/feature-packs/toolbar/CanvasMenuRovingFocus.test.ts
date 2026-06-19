import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_MENU_FOCUS_MODEL,
  CANVAS_MENU_FOCUS_RESTORE_MODEL,
  getCanvasMenuRovingActiveIndex,
  getCanvasMenuRovingKeyIndex,
  CANVAS_MENU_KEYBOARD_KEYS,
  CANVAS_MENU_ROVING_FOCUS_MODEL,
  CANVAS_SELECTION_TOOLBAR_DROPDOWN_MENU_MODEL,
  getCanvasMenuRestoreFocusTarget,
  getCanvasMenuTriggerKeyboardIntent,
  restoreCanvasMenuFocus,
} from './CanvasMenuRovingFocus'

describe('CanvasMenuRovingFocus', () => {
  it('exports menu roving focus metadata for host DOM contracts', () => {
    expect(CANVAS_MENU_ROVING_FOCUS_MODEL).toBe('canvas-menu-roving-focus')
    expect(CANVAS_MENU_FOCUS_MODEL).toBe('enabled-menuitem-roving')
    expect(CANVAS_MENU_FOCUS_RESTORE_MODEL).toBe('canvas-menu-focus-restore')
    expect(CANVAS_MENU_KEYBOARD_KEYS).toBe(
      'arrow-left-right-up-down-home-end-enter-space-escape',
    )
    expect(CANVAS_SELECTION_TOOLBAR_DROPDOWN_MENU_MODEL).toBe(
      'canvas-selection-toolbar-dropdown-menu',
    )
  })

  it('moves menu focus indexes with arrow keys and wraps', () => {
    expect(getCanvasMenuRovingKeyIndex({
      count: 3,
      currentIndex: 0,
      key: 'ArrowDown',
    })).toBe(1)
    expect(getCanvasMenuRovingKeyIndex({
      count: 3,
      currentIndex: 2,
      key: 'ArrowRight',
    })).toBe(0)
    expect(getCanvasMenuRovingKeyIndex({
      count: 3,
      currentIndex: 0,
      key: 'ArrowUp',
    })).toBe(2)
    expect(getCanvasMenuRovingKeyIndex({
      count: 3,
      currentIndex: 2,
      key: 'ArrowLeft',
    })).toBe(1)
  })

  it('moves menu focus indexes with Home and End', () => {
    expect(getCanvasMenuRovingKeyIndex({
      count: 4,
      currentIndex: 2,
      key: 'Home',
    })).toBe(0)
    expect(getCanvasMenuRovingKeyIndex({
      count: 4,
      currentIndex: 1,
      key: 'End',
    })).toBe(3)
  })

  it('ignores unknown keys and missing current indexes', () => {
    expect(getCanvasMenuRovingKeyIndex({
      count: 0,
      currentIndex: 0,
      key: 'ArrowDown',
    })).toBeNull()
    expect(getCanvasMenuRovingKeyIndex({
      count: 3,
      currentIndex: -1,
      key: 'ArrowDown',
    })).toBeNull()
    expect(getCanvasMenuRovingKeyIndex({
      count: 3,
      currentIndex: 0,
      key: 'Tab',
    })).toBeNull()
  })

  it('resolves active index from focused item before preferred index', () => {
    expect(getCanvasMenuRovingActiveIndex({
      count: 4,
      focusedIndex: 2,
      preferredIndex: 1,
    })).toBe(2)
  })

  it('clamps preferred active index to enabled item bounds', () => {
    expect(getCanvasMenuRovingActiveIndex({
      count: 4,
      focusedIndex: -1,
      preferredIndex: 99,
    })).toBe(3)
    expect(getCanvasMenuRovingActiveIndex({
      count: 4,
      focusedIndex: -1,
      preferredIndex: -99,
    })).toBe(0)
    expect(getCanvasMenuRovingActiveIndex({
      count: 0,
      focusedIndex: -1,
      preferredIndex: 2,
    })).toBe(0)
  })

  it('maps menu trigger open keys to open-menu intent', () => {
    for (const key of ['ArrowDown', 'Enter', ' ']) {
      expect(getCanvasMenuTriggerKeyboardIntent({ key })).toEqual({
        kind: 'open-menu',
        preventDefault: true,
      })
    }
  })

  it('ignores unrelated menu trigger keys', () => {
    expect(getCanvasMenuTriggerKeyboardIntent({ key: 'Tab' })).toEqual({
      kind: 'none',
      preventDefault: false,
    })
  })

  it('resolves focus restore targets outside the menu root', () => {
    const previousFocus = createFocusableElement()
    const menuItem = createFocusableElement()
    const body = createFocusableElement()

    expect(getCanvasMenuRestoreFocusTarget({
      root: createMenuRoot({
        activeElement: previousFocus,
        body,
        containedElement: menuItem,
      }),
    })).toBe(previousFocus)
    expect(getCanvasMenuRestoreFocusTarget({
      root: createMenuRoot({
        activeElement: menuItem,
        body,
        containedElement: menuItem,
      }),
    })).toBeNull()
    expect(getCanvasMenuRestoreFocusTarget({
      root: createMenuRoot({
        activeElement: body,
        body,
        containedElement: menuItem,
      }),
    })).toBeNull()
  })

  it('restores only connected enabled menu focus targets', () => {
    const focusable = createFocusableElement()
    const disconnected = createFocusableElement({ isConnected: false })
    const disabled = createFocusableElement({ disabled: true })
    const hidden = createFocusableElement({ ariaHidden: true })

    expect(restoreCanvasMenuFocus(focusable, { preventScroll: false }))
      .toBe(true)
    expect(focusable.focus).toHaveBeenCalledWith({ preventScroll: false })
    expect(restoreCanvasMenuFocus(disconnected)).toBe(false)
    expect(restoreCanvasMenuFocus(disabled)).toBe(false)
    expect(restoreCanvasMenuFocus(hidden)).toBe(false)
    expect(disconnected.focus).not.toHaveBeenCalled()
    expect(disabled.focus).not.toHaveBeenCalled()
    expect(hidden.focus).not.toHaveBeenCalled()
  })
})

function createFocusableElement({
  ariaHidden = false,
  disabled = false,
  isConnected = true,
}: {
  ariaHidden?: boolean
  disabled?: boolean
  isConnected?: boolean
} = {}) {
  return {
    disabled,
    focus: vi.fn(),
    getAttribute: vi.fn((name: string) =>
      name === 'aria-hidden' && ariaHidden ? 'true' : null),
    isConnected,
  } as unknown as HTMLElement
}

function createMenuRoot({
  activeElement,
  body,
  containedElement,
}: {
  activeElement: HTMLElement
  body: HTMLElement
  containedElement: HTMLElement
}) {
  return {
    contains: vi.fn((element: Element) => element === containedElement),
    ownerDocument: {
      activeElement,
      body,
    },
  } as unknown as HTMLElement
}
