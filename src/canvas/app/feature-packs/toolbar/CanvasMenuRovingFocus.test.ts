import { describe, expect, it } from 'vitest'
import {
  getCanvasMenuRovingActiveIndex,
  getCanvasMenuRovingKeyIndex,
  getCanvasMenuTriggerKeyboardIntent,
} from './CanvasMenuRovingFocus'

describe('CanvasMenuRovingFocus', () => {
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
})
