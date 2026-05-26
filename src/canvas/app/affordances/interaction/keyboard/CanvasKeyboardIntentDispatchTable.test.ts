import { describe, expect, it, vi } from 'vitest'
import { createCanvasKeyboardIntentDispatchTable } from './CanvasKeyboardIntentDispatchTable'

type TestIntent =
  | { kind: 'alpha' }
  | { kind: 'beta'; value: number }
  | { kind: 'ignored' }

type TestHandlers = {
  alpha: () => void
  beta: (value: number) => void
}

describe('CanvasKeyboardIntentDispatchTable', () => {
  it('derives supported intent recognition and execution from one table', () => {
    const dispatch = createCanvasKeyboardIntentDispatchTable<
      TestIntent,
      TestHandlers
    >()({
      alpha: ({ handlers }) => {
        handlers.alpha()
      },
      beta: ({ handlers, intent }) => {
        handlers.beta(intent.value)
      },
    })
    const handlers = {
      alpha: vi.fn(),
      beta: vi.fn(),
    }

    expect(dispatch.hasKind('alpha')).toBe(true)
    expect(dispatch.hasKind('ignored')).toBe(false)

    dispatch.run({ handlers, intent: { kind: 'alpha' } })
    dispatch.run({ handlers, intent: { kind: 'beta', value: 3 } })

    expect(handlers.alpha).toHaveBeenCalledTimes(1)
    expect(handlers.beta).toHaveBeenCalledWith(3)
  })
})
