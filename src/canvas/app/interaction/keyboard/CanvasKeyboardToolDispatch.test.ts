import { describe, expect, it, vi } from 'vitest'
import {
  isCanvasKeyboardToolIntent,
  runCanvasKeyboardToolIntent,
  type CanvasKeyboardToolHandlers,
} from './CanvasKeyboardToolDispatch'

describe('CanvasKeyboardToolDispatch', () => {
  it('recognizes tool intents and ignores non-tool intents', () => {
    expect(isCanvasKeyboardToolIntent({
      kind: 'set-tool',
      preventDefault: false,
      tool: 'rect',
    })).toBe(true)
    expect(isCanvasKeyboardToolIntent({
      kind: 'delete-selection',
      preventDefault: true,
    })).toBe(false)
  })

  it('routes tool intents to the tool handler', () => {
    const handlers = createHandlers()

    runCanvasKeyboardToolIntent({
      handlers,
      intent: {
        kind: 'set-tool',
        preventDefault: false,
        tool: 'custom:risk',
      },
    })

    expect(handlers.setTool).toHaveBeenCalledWith('custom:risk')
  })
})

function createHandlers(): CanvasKeyboardToolHandlers {
  return {
    setTool: vi.fn(),
  }
}
