import { describe, expect, it } from 'vitest'
import {
  CANVAS_TOOLBAR_FOCUS_MODEL,
  CANVAS_TOOLBAR_KEYBOARD_MODEL,
  CANVAS_TOOLBAR_ROVING_FOCUS_MODEL,
  getCanvasToolbarRovingActiveIndex,
  getCanvasToolbarRovingKeyboardIntent,
  getCanvasToolbarRovingKeyIndex,
  runCanvasToolbarRovingKeyboardIntent,
} from './CanvasToolbarRovingFocus'

describe('CanvasToolbarRovingFocus', () => {
  it('exports toolbar roving focus metadata for host DOM contracts', () => {
    expect(CANVAS_TOOLBAR_ROVING_FOCUS_MODEL).toBe(
      'canvas-toolbar-roving-focus',
    )
    expect(CANVAS_TOOLBAR_FOCUS_MODEL).toBe('roving-tabindex')
    expect(CANVAS_TOOLBAR_KEYBOARD_MODEL).toBe('arrow-home-end')
  })

  it('resolves the active roving item from focus or preferred index', () => {
    expect(getCanvasToolbarRovingActiveIndex({
      count: 0,
      focusedIndex: -1,
      preferredIndex: 2,
    })).toBe(0)
    expect(getCanvasToolbarRovingActiveIndex({
      count: 3,
      focusedIndex: 1,
      preferredIndex: 2,
    })).toBe(1)
    expect(getCanvasToolbarRovingActiveIndex({
      count: 3,
      focusedIndex: -1,
      preferredIndex: 9,
    })).toBe(2)
  })

  it('maps arrow, Home, and End keys to roving toolbar indexes', () => {
    expect(getCanvasToolbarRovingKeyIndex({
      count: 3,
      currentIndex: 0,
      key: 'ArrowRight',
    })).toBe(1)
    expect(getCanvasToolbarRovingKeyIndex({
      count: 3,
      currentIndex: 0,
      key: 'ArrowLeft',
    })).toBe(2)
    expect(getCanvasToolbarRovingKeyIndex({
      count: 3,
      currentIndex: 2,
      key: 'Home',
    })).toBe(0)
    expect(getCanvasToolbarRovingKeyIndex({
      count: 3,
      currentIndex: 0,
      key: 'End',
    })).toBe(2)
    expect(getCanvasToolbarRovingKeyIndex({
      count: 3,
      currentIndex: 0,
      key: 'Escape',
    })).toBeNull()
  })

  it('returns a move-focus intent for toolbar navigation keys', () => {
    expect(getCanvasToolbarRovingKeyboardIntent({
      count: 3,
      currentIndex: 0,
      key: 'ArrowDown',
    })).toEqual({
      kind: 'move-focus',
      nextIndex: 1,
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('returns a none intent when toolbar navigation cannot move focus', () => {
    expect(getCanvasToolbarRovingKeyboardIntent({
      count: 0,
      currentIndex: -1,
      key: 'ArrowRight',
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
    expect(getCanvasToolbarRovingKeyboardIntent({
      count: 3,
      currentIndex: 0,
      key: 'Escape',
    })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('runs toolbar keyboard intents by consuming the event and moving focus', () => {
    let preventDefaultCount = 0
    let stopPropagationCount = 0
    let focusedIndex: number | null = null

    expect(runCanvasToolbarRovingKeyboardIntent({
      count: 4,
      currentIndex: 1,
      event: {
        key: 'End',
        preventDefault: () => {
          preventDefaultCount += 1
        },
        stopPropagation: () => {
          stopPropagationCount += 1
        },
      },
      onMoveFocus: (nextIndex) => {
        focusedIndex = nextIndex
      },
    })).toBe(true)

    expect(preventDefaultCount).toBe(1)
    expect(stopPropagationCount).toBe(1)
    expect(focusedIndex).toBe(3)
  })

  it('does not consume unsupported toolbar keys', () => {
    let preventDefaultCount = 0
    let stopPropagationCount = 0
    let moveFocusCount = 0

    expect(runCanvasToolbarRovingKeyboardIntent({
      count: 4,
      currentIndex: 1,
      event: {
        key: 'Tab',
        preventDefault: () => {
          preventDefaultCount += 1
        },
        stopPropagation: () => {
          stopPropagationCount += 1
        },
      },
      onMoveFocus: () => {
        moveFocusCount += 1
      },
    })).toBe(false)

    expect(preventDefaultCount).toBe(0)
    expect(stopPropagationCount).toBe(0)
    expect(moveFocusCount).toBe(0)
  })
})
