import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasEditableFieldKeyboardIntent,
  runCanvasEditableFieldKeyboardIntent,
} from './CanvasEditableFieldKeyboard'

describe('CanvasEditableFieldKeyboard', () => {
  it('maps Enter to commit', () => {
    expect(getCanvasEditableFieldKeyboardIntent({ key: 'Enter' })).toEqual({
      kind: 'commit',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('maps Escape to cancel', () => {
    expect(getCanvasEditableFieldKeyboardIntent({ key: 'Escape' })).toEqual({
      kind: 'cancel',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('ignores other keys', () => {
    expect(getCanvasEditableFieldKeyboardIntent({ key: 'Tab' })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('runs commit intents with event consumption', () => {
    const event = createKeyboardEvent({ key: 'Enter' })
    const onCommit = vi.fn()
    const onCancel = vi.fn()

    expect(runCanvasEditableFieldKeyboardIntent({
      event,
      onCancel,
      onCommit,
    })).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('runs cancel intents with event consumption', () => {
    const event = createKeyboardEvent({ key: 'Escape' })
    const onCommit = vi.fn()
    const onCancel = vi.fn()

    expect(runCanvasEditableFieldKeyboardIntent({
      event,
      onCancel,
      onCommit,
    })).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('leaves unrelated keys unhandled', () => {
    const event = createKeyboardEvent({ key: 'Tab' })
    const onCommit = vi.fn()
    const onCancel = vi.fn()

    expect(runCanvasEditableFieldKeyboardIntent({
      event,
      onCancel,
      onCommit,
    })).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(onCommit).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })
})

function createKeyboardEvent({ key }: { key: string }) {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }
}
