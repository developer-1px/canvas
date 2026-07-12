import { describe, expect, it, vi } from 'vitest'
import {
  bindCanvasNativeGestureBoundary,
  type CanvasNativeGestureTarget,
} from './CanvasNativeGestureBoundary'

describe('CanvasNativeGestureBoundary', () => {
  it('blocks browser zoom gestures without swallowing ordinary wheel input', () => {
    const target = createGestureTarget()
    const cleanup = bindCanvasNativeGestureBoundary(target)

    expect(target.dispatch(createEvent('wheel'))).toBe(true)
    expect(target.dispatch(createEvent('wheel', { ctrlKey: true }))).toBe(false)
    expect(target.dispatch(createEvent('wheel', { metaKey: true }))).toBe(false)
    expect(target.dispatch(createEvent('keydown', { key: '+' }))).toBe(true)
    expect(target.dispatch(createEvent('keydown', {
      ctrlKey: true,
      key: '=',
    }))).toBe(false)
    expect(target.dispatch(createEvent('keydown', {
      key: '-',
      metaKey: true,
    }))).toBe(false)
    expect(target.dispatch(createEvent('keydown', {
      ctrlKey: true,
      key: '0',
    }))).toBe(false)
    expect(target.dispatch(createEvent('touchstart', {
      touches: [{}],
    }))).toBe(true)
    expect(target.dispatch(createEvent('touchmove', {
      touches: [{}, {}],
    }))).toBe(false)
    expect(target.dispatch(createEvent('gesturestart'))).toBe(false)
    expect(target.dispatch(createEvent('gesturechange'))).toBe(false)
    expect(target.dispatch(createEvent('gestureend'))).toBe(false)

    expect(target.addEventListener).toHaveBeenCalledTimes(7)
    expect(target.addEventListener).toHaveBeenCalledWith(
      'wheel',
      expect.any(Function),
      { capture: true, passive: false },
    )

    expect(cleanup()).toBe(true)
    expect(cleanup()).toBe(false)
    expect(target.dispatch(createEvent('gesturestart'))).toBe(true)
  })

  it('keeps each boundary binding alive until its owner cleans up', () => {
    const target = createGestureTarget()
    const cleanupFirst = bindCanvasNativeGestureBoundary(target)
    const cleanupSecond = bindCanvasNativeGestureBoundary(target)

    expect(target.dispatch(createEvent('wheel', { ctrlKey: true }))).toBe(false)

    cleanupFirst()

    expect(target.dispatch(createEvent('wheel', { ctrlKey: true }))).toBe(false)

    cleanupSecond()

    expect(target.dispatch(createEvent('wheel', { ctrlKey: true }))).toBe(true)
  })
})

function createEvent(
  type: string,
  properties: Record<string, unknown> = {},
) {
  const event = new Event(type, { bubbles: true, cancelable: true })

  for (const [key, value] of Object.entries(properties)) {
    Object.defineProperty(event, key, { value })
  }

  return event
}

function createGestureTarget() {
  const listeners = new Map<string, Set<EventListener>>()
  const target: CanvasNativeGestureTarget & {
    dispatch: (event: Event) => boolean
  } = {
    addEventListener: vi.fn((type, listener) => {
      const current = listeners.get(type) ?? new Set<EventListener>()

      current.add(listener)
      listeners.set(type, current)
    }),
    dispatch(event) {
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
