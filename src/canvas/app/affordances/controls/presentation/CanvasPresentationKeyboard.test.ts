import { describe, expect, it, vi } from 'vitest'
import {
  getCanvasPresentationKeyboardIntent,
  runCanvasPresentationKeyboardIntent,
} from './CanvasPresentationKeyboard'

describe('CanvasPresentationKeyboard', () => {
  it('maps Escape to exit presentation intent', () => {
    expect(getCanvasPresentationKeyboardIntent({ key: 'Escape' })).toEqual({
      kind: 'exit',
      preventDefault: true,
      stopPropagation: true,
    })
  })

  it('maps forward presentation navigation keys', () => {
    for (const key of ['ArrowRight', 'PageDown', ' ']) {
      expect(getCanvasPresentationKeyboardIntent({ key })).toEqual({
        direction: 1,
        kind: 'navigate',
        preventDefault: true,
        stopPropagation: true,
      })
    }
  })

  it('maps backward presentation navigation keys', () => {
    for (const key of ['ArrowLeft', 'PageUp']) {
      expect(getCanvasPresentationKeyboardIntent({ key })).toEqual({
        direction: -1,
        kind: 'navigate',
        preventDefault: true,
        stopPropagation: true,
      })
    }
  })

  it('ignores unrelated presentation keys', () => {
    expect(getCanvasPresentationKeyboardIntent({ key: 'Enter' })).toEqual({
      kind: 'none',
      preventDefault: false,
      stopPropagation: false,
    })
  })

  it('runs exit presentation intents with event consumption', () => {
    const event = createKeyboardEvent({ key: 'Escape' })
    const onExit = vi.fn()
    const onNavigate = vi.fn()

    expect(runCanvasPresentationKeyboardIntent({
      event,
      onExit,
      onNavigate,
    })).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(onExit).toHaveBeenCalledTimes(1)
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('runs presentation navigation intents with event consumption', () => {
    const event = createKeyboardEvent({ key: 'PageDown' })
    const onExit = vi.fn()
    const onNavigate = vi.fn()

    expect(runCanvasPresentationKeyboardIntent({
      event,
      onExit,
      onNavigate,
    })).toBe(true)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith(1)
    expect(onExit).not.toHaveBeenCalled()
  })

  it('leaves unrelated presentation keys unhandled', () => {
    const event = createKeyboardEvent({ key: 'Enter' })
    const onExit = vi.fn()
    const onNavigate = vi.fn()

    expect(runCanvasPresentationKeyboardIntent({
      event,
      onExit,
      onNavigate,
    })).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(onExit).not.toHaveBeenCalled()
    expect(onNavigate).not.toHaveBeenCalled()
  })
})

function createKeyboardEvent({ key }: { key: string }) {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }
}
