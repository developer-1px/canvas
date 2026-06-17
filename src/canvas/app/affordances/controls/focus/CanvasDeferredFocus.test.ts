import { describe, expect, it, vi } from 'vitest'
import {
  cancelCanvasDeferredFocus,
  focusCanvasElement,
  focusCanvasElementOnNextFrame,
  type CanvasFocusableElement,
} from './CanvasDeferredFocus'

describe('CanvasDeferredFocus', () => {
  it('focuses an element and optionally selects its text', () => {
    const element = createElement()

    expect(focusCanvasElement({
      element,
      select: true,
    })).toBe(true)
    expect(element.focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(element.select).toHaveBeenCalledTimes(1)
  })

  it('schedules focus on the next animation frame', () => {
    const element = createElement()
    let pendingCallback: FrameRequestCallback | null = null
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      pendingCallback = callback

      return 7
    })

    expect(focusCanvasElementOnNextFrame({
      preventScroll: false,
      requestAnimationFrame,
      resolveElement: () => element,
      select: true,
    })).toBe(7)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(element.focus).not.toHaveBeenCalled()
    expect(element.select).not.toHaveBeenCalled()

    pendingCallback?.(0)

    expect(element.focus).toHaveBeenCalledWith({ preventScroll: false })
    expect(element.select).toHaveBeenCalledTimes(1)
  })

  it('cancels deferred focus frames', () => {
    const cancelAnimationFrame = vi.fn()

    expect(cancelCanvasDeferredFocus({
      cancelAnimationFrame,
      frame: 7,
    })).toBe(true)
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7)
  })

  it('returns fallback values when focus or frame APIs are unavailable', () => {
    expect(focusCanvasElement({
      element: null,
    })).toBe(false)
    expect(focusCanvasElementOnNextFrame({
      requestAnimationFrame: null,
      resolveElement: createElement,
    })).toBeNull()
    expect(cancelCanvasDeferredFocus({
      cancelAnimationFrame: null,
      frame: 1,
    })).toBe(false)
    expect(cancelCanvasDeferredFocus({
      cancelAnimationFrame: vi.fn(),
      frame: null,
    })).toBe(false)
  })
})

function createElement(): CanvasFocusableElement & {
  focus: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
} {
  return {
    focus: vi.fn(),
    select: vi.fn(),
  }
}
