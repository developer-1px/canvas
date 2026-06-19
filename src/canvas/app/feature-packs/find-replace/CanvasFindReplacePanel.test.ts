import { describe, expect, it, vi } from 'vitest'
import {
  runCanvasFindReplacePanelKeyboardIntent,
} from './CanvasFindReplacePanelKeyboard'

describe('CanvasFindReplacePanel', () => {
  it('closes and consumes Escape inside the find replace panel', () => {
    const event = createKeyboardEvent({ key: 'Escape' })
    const onClose = vi.fn()

    const handled = runCanvasFindReplacePanelKeyboardIntent({
      event,
      onClose,
    })

    expect(handled).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('leaves Enter for the form submit flow', () => {
    const event = createKeyboardEvent({ key: 'Enter' })
    const onClose = vi.fn()

    const handled = runCanvasFindReplacePanelKeyboardIntent({
      event,
      onClose,
    })

    expect(handled).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})

function createKeyboardEvent({
  key,
  shiftKey,
}: {
  key: string
  shiftKey?: boolean
}) {
  return {
    key,
    preventDefault: vi.fn(),
    shiftKey,
    stopPropagation: vi.fn(),
  }
}
