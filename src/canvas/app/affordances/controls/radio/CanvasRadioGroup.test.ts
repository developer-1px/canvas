import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_RADIO_GROUP_FOCUS_MODEL,
  CANVAS_RADIO_GROUP_KEYBOARD_MODEL,
  CANVAS_RADIO_GROUP_MODEL,
  getCanvasRadioGroupKeyboardIntent,
  runCanvasRadioGroupKeyboardIntent,
} from './CanvasRadioGroup'

describe('CanvasRadioGroup', () => {
  it('exports radio group metadata for host DOM contracts', () => {
    expect(CANVAS_RADIO_GROUP_MODEL).toBe('canvas-radio-group')
    expect(CANVAS_RADIO_GROUP_FOCUS_MODEL).toBe('roving-tabindex')
    expect(CANVAS_RADIO_GROUP_KEYBOARD_MODEL).toBe('arrow-home-end')
  })

  it('maps arrow home and end keys to consumed radio movement intents', () => {
    expect(getCanvasRadioGroupKeyboardIntent({
      count: 3,
      currentIndex: 0,
      key: 'ArrowRight',
    })).toEqual({
      kind: 'move-radio',
      nextIndex: 1,
      preventDefault: true,
      stopPropagation: true,
    })
    expect(getCanvasRadioGroupKeyboardIntent({
      count: 3,
      currentIndex: 0,
      key: 'ArrowLeft',
    })).toMatchObject({
      nextIndex: 2,
    })
    expect(getCanvasRadioGroupKeyboardIntent({
      count: 3,
      currentIndex: 2,
      key: 'Home',
    })).toMatchObject({
      nextIndex: 0,
    })
    expect(getCanvasRadioGroupKeyboardIntent({
      count: 3,
      currentIndex: 0,
      key: 'End',
    })).toMatchObject({
      nextIndex: 2,
    })
  })

  it('returns an unconsumed radio intent when the key or current item is invalid', () => {
    expect(getCanvasRadioGroupKeyboardIntent({
      count: 3,
      currentIndex: 0,
      key: 'Enter',
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
    expect(getCanvasRadioGroupKeyboardIntent({
      count: 3,
      currentIndex: -1,
      key: 'ArrowRight',
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('runs radio movement intents by consuming the event and selecting the next enabled radio', () => {
    const first = createRadioItem()
    const disabled = createRadioItem({ disabled: true })
    const third = createRadioItem()
    const root = createRadioRoot({
      activeElement: first,
      items: [first, disabled, third],
    })
    const event = createKeyboardEvent({ key: 'ArrowRight', root })

    expect(runCanvasRadioGroupKeyboardIntent({ event })).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(first.focus).not.toHaveBeenCalled()
    expect(disabled.focus).not.toHaveBeenCalled()
    expect(third.focus).toHaveBeenCalledTimes(1)
    expect(third.click).toHaveBeenCalledTimes(1)
  })

  it('leaves unrelated radio group keys unhandled', () => {
    const first = createRadioItem()
    const second = createRadioItem()
    const root = createRadioRoot({
      activeElement: first,
      items: [first, second],
    })
    const event = createKeyboardEvent({ key: 'Enter', root })

    expect(runCanvasRadioGroupKeyboardIntent({ event })).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(first.focus).not.toHaveBeenCalled()
    expect(second.focus).not.toHaveBeenCalled()
    expect(second.click).not.toHaveBeenCalled()
  })
})

function createRadioItem({
  ariaDisabled = false,
  disabled = false,
}: {
  ariaDisabled?: boolean
  disabled?: boolean
} = {}) {
  return {
    click: vi.fn(),
    disabled,
    focus: vi.fn(),
    getAttribute: vi.fn((name: string) =>
      name === 'aria-disabled' && ariaDisabled ? 'true' : null,
    ),
  } as unknown as HTMLElement & {
    click: ReturnType<typeof vi.fn>
    disabled: boolean
    focus: ReturnType<typeof vi.fn>
  }
}

function createRadioRoot({
  activeElement,
  items,
}: {
  activeElement: HTMLElement
  items: HTMLElement[]
}) {
  return {
    ownerDocument: {
      activeElement,
    },
    querySelectorAll: vi.fn(() => items),
  } as unknown as HTMLElement
}

function createKeyboardEvent({
  key,
  root,
}: {
  key: string
  root: HTMLElement
}) {
  return {
    currentTarget: root,
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }
}
