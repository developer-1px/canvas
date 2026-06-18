import { describe, expect, it, vi } from 'vitest'
import {
  bindCanvasEventListener,
  bindCanvasEventListeners,
  type CanvasEventListenerTarget,
} from './CanvasEventListener'

describe('CanvasEventListener', () => {
  it('binds an event listener and removes it during cleanup', () => {
    const target = createEventTarget()
    const listener = vi.fn()

    const cleanup = bindCanvasEventListener({
      listener,
      target,
      type: 'resize',
    })

    target.dispatch('resize', new Event('resize'))
    expect(listener).toHaveBeenCalledTimes(1)
    expect(target.listenerCount()).toBe(1)

    expect(cleanup()).toBe(true)
    expect(cleanup()).toBe(false)
    target.dispatch('resize', new Event('resize'))

    expect(listener).toHaveBeenCalledTimes(1)
    expect(target.listenerCount()).toBe(0)
  })

  it('passes add and remove options to the target', () => {
    const target = createEventTarget()
    const addOptions = { capture: true, passive: true }
    const removeOptions = { capture: true }

    const cleanup = bindCanvasEventListener({
      listener: vi.fn(),
      options: addOptions,
      removeOptions,
      target,
      type: 'pointerdown',
    })
    cleanup()

    expect(target.addEventListener).toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function),
      addOptions,
    )
    expect(target.removeEventListener).toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function),
      removeOptions,
    )
  })

  it('returns a noop cleanup when the target is unavailable', () => {
    const cleanup = bindCanvasEventListener({
      listener: vi.fn(),
      target: null,
      type: 'resize',
    })

    expect(cleanup()).toBe(false)
  })

  it('binds and cleans up multiple listeners', () => {
    const target = createEventTarget()
    const first = vi.fn()
    const second = vi.fn()
    const keyboardListener = vi.fn((event: KeyboardEvent) => event.type)
    const pointerListener = vi.fn((event: PointerEvent) => event.type)

    const cleanup = bindCanvasEventListeners({
      listeners: [
        { listener: first, target, type: 'keydown' },
        { listener: second, target, type: 'keyup' },
        { listener: keyboardListener, target, type: 'keydown' },
        { listener: pointerListener, target, type: 'pointerdown' },
      ],
    })

    target.dispatch('keydown', new Event('keydown'))
    target.dispatch('keyup', new Event('keyup'))
    target.dispatch('pointerdown', new Event('pointerdown'))

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(keyboardListener).toHaveBeenCalledTimes(1)
    expect(pointerListener).toHaveBeenCalledTimes(1)
    expect(target.listenerCount()).toBe(4)

    expect(cleanup()).toBe(true)
    expect(cleanup()).toBe(false)
    expect(target.listenerCount()).toBe(0)
  })
})

function createEventTarget() {
  const listeners = new Map<string, Set<EventListener>>()
  const target: CanvasEventListenerTarget & {
    dispatch: (type: string, event: Event) => void
    listenerCount: () => number
  } = {
    addEventListener: vi.fn((type, listener) => {
      const currentListeners = listeners.get(type) ?? new Set<EventListener>()
      currentListeners.add(listener)
      listeners.set(type, currentListeners)
    }),
    dispatch(type, event) {
      for (const listener of listeners.get(type) ?? []) {
        listener(event)
      }
    },
    listenerCount() {
      return [...listeners.values()].reduce(
        (count, currentListeners) => count + currentListeners.size,
        0,
      )
    },
    removeEventListener: vi.fn((type, listener) => {
      listeners.get(type)?.delete(listener)
    }),
  }

  return target
}
