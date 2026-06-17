import { describe, expect, it, vi } from 'vitest'
import {
  focusCanvasModalElement,
  getCanvasModalFocusableElements,
  getCanvasModalBackdropPointerIntent,
  getCanvasModalKeyboardIntent,
  getCanvasModalNextFocusIndex,
  restoreCanvasModalFocus,
  trapCanvasModalTabFocus,
} from './CanvasModalFocusLifecycle'

describe('CanvasModalFocusLifecycle', () => {
  it('maps backdrop pointer targets to dismiss intent only for the backdrop itself', () => {
    const backdrop = {}
    const child = {}

    expect(getCanvasModalBackdropPointerIntent({
      currentTarget: backdrop as EventTarget,
      target: backdrop as EventTarget,
    })).toEqual({ kind: 'dismiss' })
    expect(getCanvasModalBackdropPointerIntent({
      currentTarget: backdrop as EventTarget,
      target: child as EventTarget,
    })).toEqual({ kind: 'none' })
    expect(getCanvasModalBackdropPointerIntent({
      currentTarget: null,
      target: null,
    })).toEqual({ kind: 'none' })
  })

  it('maps modal keyboard keys to close and trap focus intents', () => {
    expect(getCanvasModalKeyboardIntent({ key: 'Escape' })).toEqual({
      kind: 'close',
      preventDefault: true,
      stopPropagation: true,
    })
    expect(getCanvasModalKeyboardIntent({ key: 'Tab' })).toEqual({
      kind: 'trap-focus',
      preventDefault: true,
      stopPropagation: true,
    })
    expect(getCanvasModalKeyboardIntent({ key: 'Enter' })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('wraps modal focus indexes in both Tab directions', () => {
    expect(getCanvasModalNextFocusIndex({
      count: 3,
      currentIndex: 0,
      shiftKey: false,
    })).toBe(1)
    expect(getCanvasModalNextFocusIndex({
      count: 3,
      currentIndex: 2,
      shiftKey: false,
    })).toBe(0)
    expect(getCanvasModalNextFocusIndex({
      count: 3,
      currentIndex: 0,
      shiftKey: true,
    })).toBe(2)
    expect(getCanvasModalNextFocusIndex({
      count: 3,
      currentIndex: -1,
      shiftKey: true,
    })).toBe(0)
    expect(getCanvasModalNextFocusIndex({
      count: 0,
      currentIndex: 0,
      shiftKey: false,
    })).toBeNull()
  })

  it('filters disconnected disabled and aria-hidden modal focus targets', () => {
    const visible = createFocusableElement()
    const disconnected = createFocusableElement({ isConnected: false })
    const disabled = createFocusableElement({ disabled: true })
    const hidden = createFocusableElement({ ariaHidden: true })
    const root = createRoot({
      activeElement: visible,
      elements: [visible, disconnected, disabled, hidden],
    })

    expect(getCanvasModalFocusableElements(root)).toEqual([visible])
  })

  it('traps Tab focus inside the modal root', () => {
    const first = createFocusableElement()
    const second = createFocusableElement()
    const event = createKeyboardEvent({ key: 'Tab', shiftKey: false })
    const root = createRoot({
      activeElement: first,
      elements: [first, second],
    })

    expect(trapCanvasModalTabFocus({ event, root })).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(second.focus).toHaveBeenCalledTimes(1)
  })

  it('traps Shift Tab focus to the final modal focus target', () => {
    const first = createFocusableElement()
    const second = createFocusableElement()
    const event = createKeyboardEvent({ key: 'Tab', shiftKey: true })
    const root = createRoot({
      activeElement: first,
      elements: [first, second],
    })

    expect(trapCanvasModalTabFocus({ event, root })).toBe(true)
    expect(second.focus).toHaveBeenCalledTimes(1)
  })

  it('restores and focuses only safe connected targets', () => {
    const focusable = createFocusableElement()
    const disconnected = createFocusableElement({ isConnected: false })
    const disabled = createFocusableElement({ disabled: true })

    expect(focusCanvasModalElement(focusable)).toBe(true)
    expect(focusable.focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(restoreCanvasModalFocus(disconnected)).toBe(false)
    expect(restoreCanvasModalFocus(disabled)).toBe(false)
    expect(disconnected.focus).not.toHaveBeenCalled()
    expect(disabled.focus).not.toHaveBeenCalled()
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

function createRoot({
  activeElement,
  elements,
}: {
  activeElement: HTMLElement
  elements: readonly HTMLElement[]
}) {
  return {
    ownerDocument: {
      activeElement,
    },
    querySelectorAll: vi.fn(() => elements),
  } as unknown as HTMLElement
}

function createKeyboardEvent({
  key,
  shiftKey,
}: {
  key: string
  shiftKey: boolean
}) {
  return {
    key,
    preventDefault: vi.fn(),
    shiftKey,
    stopPropagation: vi.fn(),
  }
}
