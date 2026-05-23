import { describe, expect, it, vi } from 'vitest'
import {
  isCanvasKeyboardSystemIntent,
  runCanvasKeyboardSystemIntent,
  type CanvasKeyboardSystemHandlers,
} from './CanvasKeyboardSystemDispatch'

describe('CanvasKeyboardSystemDispatch', () => {
  it('recognizes system intents and ignores non-system intents', () => {
    expect(isCanvasKeyboardSystemIntent({
      kind: 'escape',
      preventDefault: false,
    })).toBe(true)
    expect(isCanvasKeyboardSystemIntent({
      kind: 'delete-selection',
      preventDefault: true,
    })).toBe(false)
  })

  it('routes simple system intents to their handlers', () => {
    const handlers = createHandlers()

    runCanvasKeyboardSystemIntent({
      handlers,
      intent: { kind: 'open-find-replace', preventDefault: true },
    })
    runCanvasKeyboardSystemIntent({
      handlers,
      intent: { kind: 'temporary-pan', preventDefault: true },
    })

    expect(handlers.openFindReplace).toHaveBeenCalledTimes(1)
    expect(handlers.setSpaceDown).toHaveBeenCalledWith(true)
  })

  it('owns escape cancellation side effects', () => {
    const handlers = createHandlers({
      interactionRef: {
        current: {
          kind: 'pan',
          origin: { x: 0, y: 0, scale: 1 },
          pointerId: 1,
          startScreen: { x: 0, y: 0 },
        },
      },
    })

    runCanvasKeyboardSystemIntent({
      handlers,
      intent: { kind: 'escape', preventDefault: false },
    })

    expect(handlers.interactionRef.current).toEqual({ kind: 'none' })
    expect(handlers.setGesture).toHaveBeenCalledWith('none')
    expect(handlers.setMarquee).toHaveBeenCalledWith(null)
    expect(handlers.setDraftArrow).toHaveBeenCalledWith(null)
    expect(handlers.setDraftRect).toHaveBeenCalledWith(null)
    expect(handlers.setDraftStroke).toHaveBeenCalledWith(null)
    expect(handlers.setEditing).toHaveBeenCalledWith(null)
    expect(handlers.commitSelection).toHaveBeenCalledWith([])
    expect(handlers.setTool).toHaveBeenCalledWith('select')
  })
})

function createHandlers(
  overrides: Partial<CanvasKeyboardSystemHandlers> = {},
): CanvasKeyboardSystemHandlers {
  return {
    commitSelection: vi.fn(() => true),
    interactionRef: { current: { kind: 'none' } },
    openFindReplace: vi.fn(),
    setDraftArrow: vi.fn(),
    setDraftRect: vi.fn(),
    setDraftStroke: vi.fn(),
    setEditing: vi.fn(),
    setGesture: vi.fn(),
    setMarquee: vi.fn(),
    setSpaceDown: vi.fn(),
    setTool: vi.fn(),
    ...overrides,
  }
}
