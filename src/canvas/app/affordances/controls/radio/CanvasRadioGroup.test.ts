import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_RADIO_GROUP_FOCUS_MODEL,
  CANVAS_RADIO_GROUP_KEYBOARD_MODEL,
  CANVAS_RADIO_GROUP_MODEL,
  createCanvasRadioGroupDescriptor,
  getCanvasRadioGroupRootAttributes,
  getCanvasRadioItemAttributes,
  getCanvasRadioGroupKeyboardIntent,
  runCanvasRadioGroupKeyboardIntent,
} from './CanvasRadioGroup'

describe('CanvasRadioGroup', () => {
  it('exports radio group metadata for host DOM contracts', () => {
    expect(CANVAS_RADIO_GROUP_MODEL).toBe('canvas-radio-group')
    expect(CANVAS_RADIO_GROUP_FOCUS_MODEL).toBe('roving-tabindex')
    expect(CANVAS_RADIO_GROUP_KEYBOARD_MODEL).toBe('arrow-home-end')
  })

  it('creates radiogroup and radio attributes for segmented controls', () => {
    expect(createCanvasRadioGroupDescriptor({
      ariaLabel: 'Connector routing',
      checkedId: 'straight',
      groupId: 'connector-routing',
      items: [
        { id: 'elbow' },
        { id: 'straight' },
        { disabled: true, id: 'curved' },
      ],
    })).toEqual({
      checkedId: 'straight',
      checkedRadioId: 'connector-routing-radio-1',
      focusModel: CANVAS_RADIO_GROUP_FOCUS_MODEL,
      focusableId: 'straight',
      focusableRadioId: 'connector-routing-radio-1',
      keyboardModel: CANVAS_RADIO_GROUP_KEYBOARD_MODEL,
      model: CANVAS_RADIO_GROUP_MODEL,
      items: [
        {
          attributes: {
            'aria-checked': false,
            'aria-disabled': undefined,
            id: 'connector-routing-radio-0',
            role: 'radio',
            tabIndex: -1,
          },
          id: 'elbow',
          index: 0,
          isChecked: false,
          isDisabled: false,
          isFocusable: false,
          radioId: 'connector-routing-radio-0',
        },
        {
          attributes: {
            'aria-checked': true,
            'aria-disabled': undefined,
            id: 'connector-routing-radio-1',
            role: 'radio',
            tabIndex: 0,
          },
          id: 'straight',
          index: 1,
          isChecked: true,
          isDisabled: false,
          isFocusable: true,
          radioId: 'connector-routing-radio-1',
        },
        {
          attributes: {
            'aria-checked': false,
            'aria-disabled': true,
            id: 'connector-routing-radio-2',
            role: 'radio',
            tabIndex: undefined,
          },
          disabled: true,
          id: 'curved',
          index: 2,
          isChecked: false,
          isDisabled: true,
          isFocusable: false,
          radioId: 'connector-routing-radio-2',
        },
      ],
      rootAttributes: {
        'aria-label': 'Connector routing',
        id: 'connector-routing',
        role: 'radiogroup',
      },
    })
  })

  it('keeps checked disabled radios visible while focusing the first enabled item', () => {
    const descriptor = createCanvasRadioGroupDescriptor({
      ariaLabel: 'Size mode',
      checkedId: 'fixed',
      items: [
        { disabled: true, id: 'fixed' },
        { id: 'fill' },
      ],
    })

    expect(descriptor.checkedId).toBe('fixed')
    expect(descriptor.checkedRadioId).toBe('canvas-radio-0')
    expect(descriptor.focusableId).toBe('fill')
    expect(descriptor.items[0]).toMatchObject({
      attributes: {
        'aria-checked': true,
        'aria-disabled': true,
        tabIndex: undefined,
      },
      isChecked: true,
      isDisabled: true,
      isFocusable: false,
    })
    expect(descriptor.items[1]).toMatchObject({
      attributes: {
        'aria-checked': false,
        'aria-disabled': undefined,
        tabIndex: 0,
      },
      isChecked: false,
      isDisabled: false,
      isFocusable: true,
    })
  })

  it('creates radiogroup root and radio attributes directly', () => {
    expect(getCanvasRadioGroupRootAttributes({
      ariaLabel: 'Text align',
      groupId: 'text-align',
    })).toEqual({
      'aria-label': 'Text align',
      id: 'text-align',
      role: 'radiogroup',
    })
    expect(getCanvasRadioItemAttributes({
      checked: true,
      disabled: true,
      focusable: false,
      radioId: 'text-align-center',
    })).toEqual({
      'aria-checked': true,
      'aria-disabled': true,
      id: 'text-align-center',
      role: 'radio',
      tabIndex: undefined,
    })
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
