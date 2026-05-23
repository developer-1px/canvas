import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAppEventInput,
  createCanvasAppPointerInput,
} from './CanvasAppPointerInput'

describe('CanvasAppPointerInput', () => {
  it('projects React pointer events into the app pointer interface', () => {
    const preventDefault = vi.fn()
    const stopPropagation = vi.fn()
    const input = createCanvasAppPointerInput({
      altKey: true,
      button: 0,
      clientX: 12,
      clientY: 34,
      ctrlKey: false,
      metaKey: true,
      pointerId: 7,
      preventDefault,
      shiftKey: true,
      stopPropagation,
    })

    expect(input).toMatchObject({
      altKey: true,
      button: 0,
      clientX: 12,
      clientY: 34,
      ctrlKey: false,
      metaKey: true,
      pointerId: 7,
      shiftKey: true,
    })

    input.preventDefault()
    input.stopPropagation()

    expect(preventDefault).toHaveBeenCalledOnce()
    expect(stopPropagation).toHaveBeenCalledOnce()
  })

  it('projects non-pointer DOM events into the app event interface', () => {
    const preventDefault = vi.fn()
    const stopPropagation = vi.fn()
    const input = createCanvasAppEventInput({
      preventDefault,
      stopPropagation,
    })

    input.preventDefault()
    input.stopPropagation()

    expect(preventDefault).toHaveBeenCalledOnce()
    expect(stopPropagation).toHaveBeenCalledOnce()
  })
})
