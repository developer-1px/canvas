import { describe, expect, it, vi } from 'vitest'
import {
  cancelCanvasDeferredFocus,
  focusCanvasElement,
  focusCanvasElementBySelectorOnNextFrame,
  focusCanvasElementOnNextFrame,
  resolveCanvasElementBySelector,
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

    const callback = pendingCallback as FrameRequestCallback | null

    callback?.(0)

    expect(element.focus).toHaveBeenCalledWith({ preventScroll: false })
    expect(element.select).toHaveBeenCalledTimes(1)
  })

  it('resolves selector targets from a root node', () => {
    const target = createElement()
    const root = createQueryRoot([target])

    expect(resolveCanvasElementBySelector({
      root,
      selector: '[data-canvas-focus-target]',
    })).toBe(target)
    expect(root.querySelector).toHaveBeenCalledWith('[data-canvas-focus-target]')
    expect(root.querySelectorAll).not.toHaveBeenCalled()
  })

  it('resolves selector targets with a match predicate', () => {
    const first = createElement()
    const second = createElement()
    const root = createQueryRoot([first, second])

    expect(resolveCanvasElementBySelector({
      match: ({ element, elements, index }) =>
        element === second && elements.length === 2 && index === 1,
      root,
      selector: '.canvas-focus-target',
    })).toBe(second)
    expect(root.querySelector).not.toHaveBeenCalled()
    expect(root.querySelectorAll).toHaveBeenCalledWith('.canvas-focus-target')
  })

  it('schedules selector focus on the next animation frame', () => {
    const element = createElement()
    const root = createQueryRoot([element])
    let pendingCallback: FrameRequestCallback | null = null
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      pendingCallback = callback

      return 8
    })

    expect(focusCanvasElementBySelectorOnNextFrame({
      requestAnimationFrame,
      root: () => root,
      select: true,
      selector: '[data-canvas-focus-target]',
    })).toBe(8)
    expect(element.focus).not.toHaveBeenCalled()
    expect(element.select).not.toHaveBeenCalled()

    const callback = pendingCallback as FrameRequestCallback | null

    callback?.(0)

    expect(root.querySelector).toHaveBeenCalledWith('[data-canvas-focus-target]')
    expect(element.focus).toHaveBeenCalledWith({ preventScroll: true })
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
    expect(focusCanvasElementBySelectorOnNextFrame({
      requestAnimationFrame: null,
      root: null,
      selector: '[data-canvas-focus-target]',
    })).toBeNull()
    expect(resolveCanvasElementBySelector({
      root: null,
      selector: '[data-canvas-focus-target]',
    })).toBeNull()
    expect(resolveCanvasElementBySelector({
      root: createThrowingQueryRoot(),
      selector: '[',
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

function createQueryRoot<TElement extends Element>(
  elements: TElement[],
) {
  const querySelector = vi.fn(() => elements[0] ?? null)
  const querySelectorAll = vi.fn(() => elements)

  return {
    querySelector,
    querySelectorAll,
  } as unknown as ParentNode & {
    querySelector: typeof querySelector
    querySelectorAll: typeof querySelectorAll
  }
}

function createThrowingQueryRoot() {
  const querySelector = vi.fn(() => {
    throw new Error('Invalid selector')
  })
  const querySelectorAll = vi.fn(() => {
    throw new Error('Invalid selector')
  })

  return {
    querySelector,
    querySelectorAll,
  } as unknown as ParentNode
}

function createElement(): Element & CanvasFocusableElement & {
  focus: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
} {
  return {
    focus: vi.fn(),
    select: vi.fn(),
  } as unknown as Element & CanvasFocusableElement & {
    focus: ReturnType<typeof vi.fn>
    select: ReturnType<typeof vi.fn>
  }
}
