import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAppStageElement,
  type CanvasAppStageRect,
} from './CanvasAppStageElement'

type CreateCanvasAppStageElementInput = Parameters<
  typeof createCanvasAppStageElement
>[0]
type CanvasAppStageDomElement = NonNullable<
  ReturnType<CreateCanvasAppStageElementInput['getElement']>
>

describe('CanvasAppStageElement', () => {
  it('keeps missing stage element behavior local and harmless', () => {
    const stageElement = createCanvasAppStageElement({
      getElement: () => null,
      setElement: () => undefined,
    })

    expect(stageElement.getRect()).toBeNull()
    expect(stageElement.getScreenPoint({ clientX: 40, clientY: 60 })).toEqual({
      x: 0,
      y: 0,
    })
    expect(
      stageElement.getViewportCenter({ scale: 2, x: 10, y: 20 }),
    ).toBeNull()
    expect(stageElement.getSelectionSvgSnapshot?.({
      bounds: { h: 1, w: 1, x: 0, y: 0 },
      ids: ['item-1'],
    })).toBeNull()

    expect(() => stageElement.capturePointer(1)).not.toThrow()
    expect(() => stageElement.releasePointer(1)).not.toThrow()
    expect(() => stageElement.addWheelListener(vi.fn())()).not.toThrow()
  })

  it('exposes stage mounting as a controller concern', () => {
    const setElement = vi.fn()
    const stageElement = createCanvasAppStageElement({
      getElement: () => null,
      setElement,
    })
    const svgElement = {} as SVGSVGElement

    stageElement.mount.ref(svgElement)

    expect(setElement).toHaveBeenCalledWith(svgElement)
  })

  it('calculates stage geometry from the stage element rect', () => {
    const { element } = createStageElementFake({
      height: 200,
      left: 10,
      top: 20,
      width: 300,
    })
    const stageElement = createCanvasAppStageElement({
      getElement: () => element,
      setElement: () => undefined,
    })

    expect(stageElement.getRect()).toEqual({
      height: 200,
      left: 10,
      top: 20,
      width: 300,
    })
    expect(stageElement.getScreenPoint({ clientX: 40, clientY: 65 })).toEqual({
      x: 30,
      y: 45,
    })
    expect(stageElement.getViewportCenter({ scale: 2, x: 10, y: 20 }))
      .toEqual({
        x: 70,
        y: 40,
      })
    expect(stageElement.getViewportCenter({ scale: 0, x: 10, y: 20 }))
      .toEqual({
        x: 1400,
        y: 800,
      })
  })

  it('captures and releases pointer ownership through the stage element', () => {
    const { capturedPointers, element } = createStageElementFake()
    const stageElement = createCanvasAppStageElement({
      getElement: () => element,
      setElement: () => undefined,
    })

    stageElement.capturePointer(7)
    stageElement.capturePointer(7)
    expect([...capturedPointers]).toEqual([7])

    stageElement.releasePointer(7)
    expect([...capturedPointers]).toEqual([])
  })

  it('owns wheel listener registration and cleanup', () => {
    const { element, parentWheelListeners } = createStageElementFake()
    const stageElement = createCanvasAppStageElement({
      getElement: () => element,
      setElement: () => undefined,
    })
    const handler = vi.fn()
    const wheelEvent = {
      clientX: 31,
      clientY: 47,
    } as globalThis.WheelEvent

    const cleanup = stageElement.addWheelListener(handler)

    expect(parentWheelListeners.size).toBe(2)

    for (const listener of parentWheelListeners) {
      listener(wheelEvent)
    }

    expect(handler).toHaveBeenCalledWith(wheelEvent, {
      height: 100,
      left: 8,
      top: 12,
      width: 160,
    })

    cleanup()

    expect(parentWheelListeners.size).toBe(0)
  })

  it('routes Safari gesture scale changes through canvas zoom input', () => {
    const { dispatchParent, element } = createStageElementFake()
    const stageElement = createCanvasAppStageElement({
      getElement: () => element,
      setElement: () => undefined,
    })
    const handler = vi.fn()
    const cleanup = stageElement.addWheelListener(handler)
    const gestureStart = createGestureEvent('gesturestart', 1)
    const gestureChange = createGestureEvent('gesturechange', 1.2)

    dispatchParent('gesturestart', gestureStart)
    dispatchParent('gesturechange', gestureChange)

    expect(gestureStart.defaultPrevented).toBe(true)
    expect(gestureChange.defaultPrevented).toBe(true)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        ctrlKey: true,
        deltaY: expect.any(Number),
      }),
      {
        height: 100,
        left: 8,
        top: 12,
        width: 160,
      },
    )

    cleanup()
  })

  it('lets wheel passthrough targets keep native scroll', () => {
    class FakeNode {
      parentElement: FakeElement | null = null
    }

    class FakeElement extends FakeNode {
      private readonly isPassthrough: boolean

      constructor(isPassthrough: boolean) {
        super()
        this.isPassthrough = isPassthrough
      }

      closest(selector: string) {
        return selector === '[data-canvas-wheel-passthrough="true"]' &&
          this.isPassthrough
          ? this
          : null
      }
    }

    const previousNode = globalThis.Node
    const previousElement = globalThis.Element
    vi.stubGlobal('Node', FakeNode)
    vi.stubGlobal('Element', FakeElement)

    try {
      const { element, parentWheelListeners } = createStageElementFake()
      const stageElement = createCanvasAppStageElement({
        getElement: () => element,
        setElement: () => undefined,
      })
      const handler = vi.fn()
      const cleanup = stageElement.addWheelListener(handler)
      const wheelEvent = {
        target: new FakeElement(true),
      } as unknown as globalThis.WheelEvent

      for (const listener of parentWheelListeners) {
        listener(wheelEvent)
      }

      expect(handler).not.toHaveBeenCalled()

      cleanup()
    } finally {
      vi.stubGlobal('Node', previousNode)
      vi.stubGlobal('Element', previousElement)
    }
  })

  it('cleans up wheel listeners from the element active at registration', () => {
    const first = createStageElementFake()
    const second = createStageElementFake()
    let currentElement: CanvasAppStageDomElement | null = first.element
    const stageElement = createCanvasAppStageElement({
      getElement: () => currentElement,
      setElement: () => undefined,
    })

    const cleanup = stageElement.addWheelListener(vi.fn())

    currentElement = second.element

    expect(first.parentWheelListeners.size).toBe(2)
    expect(second.parentWheelListeners.size).toBe(0)

    cleanup()

    expect(first.parentWheelListeners.size).toBe(0)
    expect(second.parentWheelListeners.size).toBe(0)
  })
})

function createStageElementFake(
  rect: CanvasAppStageRect = {
    height: 100,
    left: 8,
    top: 12,
    width: 160,
  },
) {
  const capturedPointers = new Set<number>()
  const wheelListeners = new Set<EventListener>()
  const parentWheelListeners = new Set<EventListener>()
  const parentListeners = new Map<string, Set<EventListener>>()
  const parentElement = {
    addEventListener: (
      type: string,
      listener: EventListener,
    ) => {
      const listeners = parentListeners.get(type) ?? new Set<EventListener>()

      listeners.add(listener)
      parentListeners.set(type, listeners)

      if (type === 'wheel') {
        parentWheelListeners.add(listener)
      }
    },
    removeEventListener: (
      type: string,
      listener: EventListener,
    ) => {
      parentListeners.get(type)?.delete(listener)

      if (type === 'wheel') {
        parentWheelListeners.delete(listener)
      }
    },
  }
  const element: CanvasAppStageDomElement = {
    addEventListener: (type, listener) => {
      if (type === 'wheel') {
        wheelListeners.add(listener)
      }
    },
    contains: () => true,
    dispatchEvent: () => true,
    getBoundingClientRect: () => rect,
    hasPointerCapture: (pointerId) => capturedPointers.has(pointerId),
    parentElement,
    releasePointerCapture: (pointerId) => {
      capturedPointers.delete(pointerId)
    },
    removeEventListener: (type, listener) => {
      if (type === 'wheel') {
        wheelListeners.delete(listener)
      }
    },
    setPointerCapture: (pointerId) => {
      capturedPointers.add(pointerId)
    },
  }

  return {
    capturedPointers,
    dispatchParent(type: string, event: Event) {
      for (const listener of parentListeners.get(type) ?? []) {
        listener(event)
      }
    },
    element,
    parentWheelListeners,
    wheelListeners,
  }
}

function createGestureEvent(type: string, scale: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })

  Object.defineProperties(event, {
    clientX: { value: 88 },
    clientY: { value: 62 },
    scale: { value: scale },
  })

  return event
}
