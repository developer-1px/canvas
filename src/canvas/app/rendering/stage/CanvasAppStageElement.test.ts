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

    expect(parentWheelListeners.size).toBe(1)

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

    expect(first.parentWheelListeners.size).toBe(1)
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
  const wheelListeners = new Set<(event: globalThis.WheelEvent) => void>()
  const parentWheelListeners = new Set<(event: globalThis.WheelEvent) => void>()
  const parentElement = {
    addEventListener: (
      _type: 'wheel',
      listener: (event: globalThis.WheelEvent) => void,
    ) => {
      parentWheelListeners.add(listener)
    },
    removeEventListener: (
      _type: 'wheel',
      listener: (event: globalThis.WheelEvent) => void,
    ) => {
      parentWheelListeners.delete(listener)
    },
  }
  const element: CanvasAppStageDomElement = {
    addEventListener: (_type, listener) => {
      wheelListeners.add(listener)
    },
    contains: () => true,
    getBoundingClientRect: () => rect,
    hasPointerCapture: (pointerId) => capturedPointers.has(pointerId),
    parentElement,
    releasePointerCapture: (pointerId) => {
      capturedPointers.delete(pointerId)
    },
    removeEventListener: (_type, listener) => {
      wheelListeners.delete(listener)
    },
    setPointerCapture: (pointerId) => {
      capturedPointers.add(pointerId)
    },
  }

  return {
    capturedPointers,
    element,
    parentWheelListeners,
    wheelListeners,
  }
}
