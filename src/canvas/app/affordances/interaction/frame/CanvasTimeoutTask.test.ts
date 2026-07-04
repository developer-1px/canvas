import { describe, expect, it, vi } from 'vitest'
import {
  cancelCanvasTimeoutTask,
  scheduleCanvasTimeoutTask,
} from './CanvasTimeoutTask'

describe('CanvasTimeoutTask', () => {
  it('schedules a timeout task after the provided delay', () => {
    let pendingCallback: (() => void) | null = null
    const setTimeout = vi.fn((callback: () => void, delayMs: number) => {
      pendingCallback = callback

      return delayMs + 1
    })
    const task = vi.fn()

    expect(scheduleCanvasTimeoutTask({
      delayMs: 120,
      setTimeout,
      task,
    })).toBe(121)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 120)
    expect(task).not.toHaveBeenCalled()

    const callback = pendingCallback as (() => void) | null

    callback?.()

    expect(task).toHaveBeenCalledTimes(1)
  })

  it('normalizes negative delays to zero', () => {
    const setTimeout = vi.fn(() => 1)

    expect(scheduleCanvasTimeoutTask({
      delayMs: -20,
      setTimeout,
      task: vi.fn(),
    })).toBe(1)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 0)
  })

  it('returns null when the timeout schedule API is unavailable', () => {
    expect(scheduleCanvasTimeoutTask({
      setTimeout: null,
      task: vi.fn(),
    })).toBeNull()
  })

  it('cancels scheduled timeout tasks', () => {
    const clearTimeout = vi.fn()

    expect(cancelCanvasTimeoutTask({
      clearTimeout,
      timeout: 17,
    })).toBe(true)
    expect(clearTimeout).toHaveBeenCalledWith(17)
  })

  it('returns false when cancel is unavailable or timeout is absent', () => {
    expect(cancelCanvasTimeoutTask({
      clearTimeout: null,
      timeout: 17,
    })).toBe(false)
    expect(cancelCanvasTimeoutTask({
      clearTimeout: vi.fn(),
      timeout: null,
    })).toBe(false)
  })
})
