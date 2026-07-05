import { describe, expect, it, vi } from 'vitest'
import {
  cancelCanvasAnimationFrameTask,
  scheduleCanvasAnimationFrameTask,
} from './CanvasAnimationFrameTask'

describe('CanvasAnimationFrameTask', () => {
  it('schedules a task on the next animation frame', () => {
    let pendingCallback: FrameRequestCallback | null = null
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      pendingCallback = callback

      return 17
    })
    const task = vi.fn()

    expect(scheduleCanvasAnimationFrameTask({
      requestAnimationFrame,
      task,
    })).toBe(17)
    expect(task).not.toHaveBeenCalled()

    const callback = pendingCallback as FrameRequestCallback | null

    callback?.(123)

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(task).toHaveBeenCalledWith(123)
  })

  it('returns null when the frame request API is unavailable', () => {
    expect(scheduleCanvasAnimationFrameTask({
      requestAnimationFrame: null,
      task: vi.fn(),
    })).toBeNull()
  })

  it('cancels scheduled animation frame tasks', () => {
    const cancelAnimationFrame = vi.fn()

    expect(cancelCanvasAnimationFrameTask({
      cancelAnimationFrame,
      frame: 17,
    })).toBe(true)
    expect(cancelAnimationFrame).toHaveBeenCalledWith(17)
  })

  it('returns false when cancel is unavailable or frame is absent', () => {
    expect(cancelCanvasAnimationFrameTask({
      cancelAnimationFrame: null,
      frame: 17,
    })).toBe(false)
    expect(cancelCanvasAnimationFrameTask({
      cancelAnimationFrame: vi.fn(),
      frame: null,
    })).toBe(false)
  })
})
