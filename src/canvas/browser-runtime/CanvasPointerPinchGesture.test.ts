import { describe, expect, it, vi } from 'vitest'
import {
  bindCanvasPointerPinchGesture,
  type CanvasPointerPinchTarget,
} from './CanvasPointerPinchGesture'

describe('CanvasPointerPinchGesture', () => {
  it('converts two touch pointers into owned pan and zoom changes', () => {
    const target = createPointerTarget()
    const onChange = vi.fn()
    const cleanup = bindCanvasPointerPinchGesture(target, onChange)
    const firstDown = createPointerEvent('pointerdown', 1, 100, 100)
    const secondDown = createPointerEvent('pointerdown', 2, 200, 100)

    target.dispatchEvent(firstDown)
    target.dispatchEvent(secondDown)

    expect(firstDown.defaultPrevented).toBe(false)
    expect(secondDown.defaultPrevented).toBe(true)
    expect(target.dispatchedTypes).toContain('pointercancel')

    const firstMove = createPointerEvent('pointermove', 1, 80, 110)
    const secondMove = createPointerEvent('pointermove', 2, 220, 110)

    target.dispatchEvent(firstMove)
    target.dispatchEvent(secondMove)

    expect(firstMove.defaultPrevented).toBe(true)
    expect(secondMove.defaultPrevented).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith({
      clientX: 150,
      clientY: 110,
      deltaX: 10,
      deltaY: 5,
      scale: expect.any(Number),
    })
    expect(onChange.mock.lastCall?.[0].scale).toBeGreaterThan(1)

    target.dispatchEvent(createPointerEvent('pointerup', 1, 80, 110))
    target.dispatchEvent(createPointerEvent('pointerup', 2, 220, 110))

    expect(cleanup()).toBe(true)
    expect(cleanup()).toBe(false)
  })
})

function createPointerEvent(
  type: string,
  pointerId: number,
  clientX: number,
  clientY: number,
) {
  const event = new Event(type, { bubbles: true, cancelable: true })

  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: pointerId },
    pointerType: { value: 'touch' },
    stopPropagation: { value: vi.fn() },
  })

  return event
}

function createPointerTarget() {
  const listeners = new Map<string, Set<EventListener>>()
  const target: CanvasPointerPinchTarget & {
    readonly dispatchedTypes: string[]
  } = {
    addEventListener: vi.fn((type, listener) => {
      const current = listeners.get(type) ?? new Set<EventListener>()

      current.add(listener)
      listeners.set(type, current)
    }),
    dispatchedTypes: [],
    dispatchEvent(event) {
      target.dispatchedTypes.push(event.type)

      for (const listener of listeners.get(event.type) ?? []) {
        listener(event)
      }

      return !event.defaultPrevented
    },
    removeEventListener: vi.fn((type, listener) => {
      listeners.get(type)?.delete(listener)
    }),
  }

  return target
}
