import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_KEYBOARD_TOOL_DISPATCH_MODEL,
  isCanvasKeyboardToolIntent,
  runCanvasKeyboardToolIntent,
  type CanvasKeyboardToolHandlers,
} from './CanvasKeyboardToolDispatch'

describe('CanvasKeyboardToolDispatch', () => {
  it('exports tool dispatch metadata for host DOM contracts', () => {
    expect(CANVAS_KEYBOARD_TOOL_DISPATCH_MODEL).toBe(
      'canvas-keyboard-tool-dispatch',
    )
  })

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
