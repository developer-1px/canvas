import { describe, expect, it } from 'vitest'
import { getCanvasMenuRovingKeyIndex } from './CanvasMenuRovingFocus'

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
})
