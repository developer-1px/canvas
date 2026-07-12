// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import {
  bindCanvasNativeGestureBoundary,
  resolveCanvasNativeKeyboardZoom,
  resolveCanvasNativeWheelOwnership,
  type CanvasNativeGestureTarget,
} from './CanvasNativeGestureBoundary'

describe('CanvasNativeGestureBoundary', () => {
  it('blocks browser zoom gestures without swallowing ordinary wheel input', () => {
    const target = createGestureTarget()
    const cleanup = bindCanvasNativeGestureBoundary(target)
    const input = document.createElement('input')
    const stage = document.createElement('div')

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
    expect(target.dispatch(createEvent('keydown', {
      ctrlKey: true,
      key: '=',
      target: input,
    }))).toBe(false)
    expect(target.dispatch(createEvent('keydown', {
      ctrlKey: true,
      isComposing: true,
      key: '=',
      target: stage,
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

  it('blocks page zoom while suppressing canvas zoom for text entry and IME', () => {
    const input = document.createElement('input')
    const select = document.createElement('select')
    const textarea = document.createElement('textarea')
    const editor = document.createElement('div')
    const editorChild = document.createElement('span')
    const stage = document.createElement('div')

    editor.setAttribute('contenteditable', 'true')
    editor.append(editorChild)

    expect(resolveCanvasNativeKeyboardZoom({
      ctrlKey: true,
      key: '=',
      target: stage,
    })).toEqual({ intent: 'in', owner: 'canvas' })
    expect(resolveCanvasNativeKeyboardZoom({
      ctrlKey: true,
      key: '=',
      target: input,
    })).toEqual({ intent: 'in', owner: 'text-entry' })
    expect(resolveCanvasNativeKeyboardZoom({
      ctrlKey: true,
      key: '=',
      target: textarea,
    })).toEqual({ intent: 'in', owner: 'text-entry' })
    expect(resolveCanvasNativeKeyboardZoom({
      ctrlKey: true,
      key: '=',
      target: select,
    })).toEqual({ intent: 'in', owner: 'text-entry' })
    expect(resolveCanvasNativeKeyboardZoom({
      key: '-',
      metaKey: true,
      target: editorChild,
    })).toEqual({ intent: 'out', owner: 'text-entry' })
    expect(resolveCanvasNativeKeyboardZoom({
      ctrlKey: true,
      isComposing: true,
      key: '0',
      target: stage,
    })).toEqual({ intent: 'reset', owner: 'text-entry' })
    expect(resolveCanvasNativeKeyboardZoom({
      key: '=',
      target: stage,
    })).toBeNull()
  })

  it('gives an authored scroll surface only the wheel directions it can consume', () => {
    const scrollFrame = document.createElement('div')
    const child = document.createElement('span')
    const editor = document.createElement('textarea')

    scrollFrame.dataset.canvasWheelPassthrough = 'scroll'
    scrollFrame.append(child)
    editor.dataset.canvasWheelPassthrough = 'true'
    Object.defineProperties(scrollFrame, {
      clientHeight: { value: 100 },
      clientWidth: { value: 100 },
      scrollHeight: { value: 300 },
      scrollWidth: { value: 100 },
    })
    scrollFrame.scrollTop = 40

    expect(resolveCanvasNativeWheelOwnership({
      deltaX: 0,
      deltaY: 20,
      target: child,
    })).toBe('native')
    expect(resolveCanvasNativeWheelOwnership({
      ctrlKey: true,
      deltaX: 0,
      deltaY: 20,
      target: child,
    })).toBe('canvas')

    scrollFrame.scrollTop = 200

    expect(resolveCanvasNativeWheelOwnership({
      deltaX: 0,
      deltaY: 20,
      target: child,
    })).toBe('canvas')
    expect(resolveCanvasNativeWheelOwnership({
      deltaX: 0,
      deltaY: -20,
      target: child,
    })).toBe('native')
    expect(resolveCanvasNativeWheelOwnership({
      deltaX: 0,
      deltaY: 20,
      target: editor,
    })).toBe('native')

    const horizontalFrame = document.createElement('div')
    const horizontalChild = document.createElement('span')

    horizontalFrame.dataset.canvasWheelPassthrough = 'scroll'
    horizontalFrame.append(horizontalChild)
    Object.defineProperties(horizontalFrame, {
      clientHeight: { value: 100 },
      clientWidth: { value: 100 },
      scrollHeight: { value: 100 },
      scrollWidth: { value: 300 },
    })
    horizontalFrame.scrollLeft = 40

    expect(resolveCanvasNativeWheelOwnership({
      deltaX: 0,
      deltaY: 20,
      shiftKey: true,
      target: horizontalChild,
    })).toBe('native')

    horizontalFrame.scrollLeft = 200

    expect(resolveCanvasNativeWheelOwnership({
      deltaX: 0,
      deltaY: 20,
      shiftKey: true,
      target: horizontalChild,
    })).toBe('canvas')

    const outerFrame = document.createElement('div')

    outerFrame.dataset.canvasWheelPassthrough = 'scroll'
    outerFrame.append(scrollFrame)
    Object.defineProperties(outerFrame, {
      clientHeight: { value: 100 },
      scrollHeight: { value: 400 },
    })
    outerFrame.scrollTop = 60

    expect(resolveCanvasNativeWheelOwnership({
      deltaX: 0,
      deltaY: 20,
      target: child,
    })).toBe('native')
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
