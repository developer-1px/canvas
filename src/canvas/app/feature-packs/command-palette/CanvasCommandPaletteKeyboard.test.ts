import { describe, expect, it } from 'vitest'
import {
  getCanvasCommandPaletteKeyboardIntent,
} from './CanvasCommandPaletteKeyboard'

describe('CanvasCommandPaletteKeyboard', () => {
  it('moves active index with arrow keys inside item bounds', () => {
    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 1,
      itemCount: 3,
      key: 'ArrowDown',
    })).toEqual({
      activeIndex: 2,
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    })

    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 1,
      itemCount: 3,
      key: 'ArrowUp',
    })).toEqual({
      activeIndex: 0,
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('clamps arrow navigation to the first and last item', () => {
    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 2,
      itemCount: 3,
      key: 'ArrowDown',
    })).toEqual({
      activeIndex: 2,
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    })

    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 0,
      itemCount: 3,
      key: 'ArrowUp',
    })).toEqual({
      activeIndex: 0,
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('skips disabled command results when moving with arrow keys', () => {
    const items = [
      { disabled: false },
      { disabled: true },
      { disabled: false },
    ]

    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 0,
      itemCount: items.length,
      items,
      key: 'ArrowDown',
    })).toEqual({
      activeIndex: 2,
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    })

    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 2,
      itemCount: items.length,
      items,
      key: 'ArrowUp',
    })).toEqual({
      activeIndex: 0,
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('runs the clamped active item on enter', () => {
    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 99,
      itemCount: 3,
      key: 'Enter',
    })).toEqual({
      activeIndex: 2,
      kind: 'run-active',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('runs the nearest enabled command result instead of a disabled active index', () => {
    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 0,
      itemCount: 2,
      items: [
        { disabled: true },
        { disabled: false },
      ],
      key: 'Enter',
    })).toEqual({
      activeIndex: 1,
      kind: 'run-active',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('does not run when every command result is disabled', () => {
    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 0,
      itemCount: 2,
      items: [
        { disabled: true },
        { disabled: true },
      ],
      key: 'Enter',
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('does not run an empty result set', () => {
    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 0,
      itemCount: 0,
      key: 'Enter',
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('ignores unrelated keys', () => {
    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 0,
      itemCount: 3,
      key: 'Tab',
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })
})
