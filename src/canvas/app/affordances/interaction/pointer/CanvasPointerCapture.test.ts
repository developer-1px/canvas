import { describe, expect, it, vi } from 'vitest'
import {
  captureCanvasPointer,
  captureCanvasPointerFromEvent,
  releaseCanvasPointerCapture,
  type CanvasPointerCaptureTarget,
} from './CanvasPointerCapture'

describe('CanvasPointerCapture', () => {
  it('captures a pointer on the target', () => {
    const target = createPointerTarget()

    expect(captureCanvasPointer({ pointerId: 7, target })).toBe(true)
    expect(target.setPointerCapture).toHaveBeenCalledWith(7)
  })

  it('does not capture a pointer that is already captured', () => {
    const target = createPointerTarget({ capturedPointers: [7] })

    expect(captureCanvasPointer({ pointerId: 7, target })).toBe(false)
    expect(target.setPointerCapture).not.toHaveBeenCalled()
  })

  it('releases a captured pointer on the target', () => {
    const target = createPointerTarget({ capturedPointers: [7] })

    expect(releaseCanvasPointerCapture({ pointerId: 7, target })).toBe(true)
    expect(target.releasePointerCapture).toHaveBeenCalledWith(7)
  })

  it('returns false when target APIs are unavailable', () => {
    expect(captureCanvasPointer({
      pointerId: 7,
      target: null,
    })).toBe(false)
    expect(captureCanvasPointer({
      pointerId: 7,
      target: {},
    })).toBe(false)
    expect(releaseCanvasPointerCapture({
      pointerId: 7,
      target: {},
    })).toBe(false)
  })

  it('returns false when capture or release throws', () => {
    const target = createPointerTarget({
      capturedPointers: [7],
      releaseError: new Error('release failed'),
      setError: new Error('capture failed'),
    })

    expect(captureCanvasPointer({ pointerId: 8, target })).toBe(false)
    expect(releaseCanvasPointerCapture({ pointerId: 7, target })).toBe(false)
  })

  it('captures a pointer from an event-like input', () => {
    const target = createPointerTarget()

    expect(captureCanvasPointerFromEvent({
      currentTarget: target,
      pointerId: 7,
    })).toBe(true)
    expect(target.setPointerCapture).toHaveBeenCalledWith(7)
  })
})

function createPointerTarget({
  capturedPointers = [],
  releaseError,
  setError,
}: {
  capturedPointers?: number[]
  releaseError?: Error
  setError?: Error
} = {}) {
  const capturedPointerIds = new Set(capturedPointers)
  const target: CanvasPointerCaptureTarget & {
    releasePointerCapture: ReturnType<typeof vi.fn>
    setPointerCapture: ReturnType<typeof vi.fn>
  } = {
    hasPointerCapture: (pointerId) => capturedPointerIds.has(pointerId),
    releasePointerCapture: vi.fn((pointerId: number) => {
      if (releaseError) {
        throw releaseError
      }

      capturedPointerIds.delete(pointerId)
    }),
    setPointerCapture: vi.fn((pointerId: number) => {
      if (setError) {
        throw setError
      }

      capturedPointerIds.add(pointerId)
    }),
  }

  return target
}
