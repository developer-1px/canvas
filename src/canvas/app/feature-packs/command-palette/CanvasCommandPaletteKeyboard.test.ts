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
    })

    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 1,
      itemCount: 3,
      key: 'ArrowUp',
    })).toEqual({
      activeIndex: 0,
      kind: 'move-active',
      preventDefault: true,
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
    })

    expect(getCanvasCommandPaletteKeyboardIntent({
      activeIndex: 0,
      itemCount: 3,
      key: 'ArrowUp',
    })).toEqual({
      activeIndex: 0,
      kind: 'move-active',
      preventDefault: true,
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
    })
  })
})
