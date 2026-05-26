import { describe, expect, it, vi } from 'vitest'
import {
  isCanvasKeyboardViewportIntent,
  runCanvasKeyboardViewportIntent,
  type CanvasKeyboardViewportHandlers,
} from './CanvasKeyboardViewportDispatch'

describe('CanvasKeyboardViewportDispatch', () => {
  it('recognizes viewport intents and ignores non-viewport intents', () => {
    expect(isCanvasKeyboardViewportIntent({
      kind: 'zoom-by',
      multiplier: 1.25,
      preventDefault: true,
    })).toBe(true)
    expect(isCanvasKeyboardViewportIntent({
      kind: 'delete-selection',
      preventDefault: true,
    })).toBe(false)
  })

  it('routes zoom and reset viewport intents to their handlers', () => {
    const handlers = createHandlers()

    runCanvasKeyboardViewportIntent({
      handlers,
      intent: { kind: 'zoom-by', multiplier: 0.8, preventDefault: true },
    })
    runCanvasKeyboardViewportIntent({
      handlers,
      intent: { kind: 'reset-viewport', preventDefault: true },
    })

    expect(handlers.zoomBy).toHaveBeenCalledWith(0.8)
    expect(handlers.resetViewport).toHaveBeenCalledTimes(1)
  })

  it('routes fit viewport intents with the expected selection scope', () => {
    const handlers = createHandlers()

    runCanvasKeyboardViewportIntent({
      handlers,
      intent: { kind: 'fit-all', preventDefault: true },
    })
    runCanvasKeyboardViewportIntent({
      handlers,
      intent: {
        ids: ['item-1', 'item-2'],
        kind: 'fit-selection',
        preventDefault: true,
      },
    })

    expect(handlers.fitToItems).toHaveBeenNthCalledWith(1)
    expect(handlers.fitToItems).toHaveBeenNthCalledWith(2, [
      'item-1',
      'item-2',
    ])
  })
})

function createHandlers(): CanvasKeyboardViewportHandlers {
  return {
    fitToItems: vi.fn(),
    resetViewport: vi.fn(),
    zoomBy: vi.fn(),
  }
}
