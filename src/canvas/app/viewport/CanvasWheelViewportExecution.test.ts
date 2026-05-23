import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  createCanvasAffordanceConfig,
  getCanvasWheelViewport,
  type CanvasWheelInput,
} from '../../engine'
import type { Viewport } from '../../entities'
import type { CanvasAppStageRect } from '../stage/CanvasAppStageElement'
import {
  runCanvasWheelViewport,
  type CanvasWheelViewportEvent,
  type CanvasWheelViewportSetter,
} from './CanvasWheelViewportExecution'

const baseViewport: Viewport = {
  scale: 1,
  x: 5,
  y: 10,
}

describe('CanvasWheelViewportExecution', () => {
  it('ignores ordinary wheel input when wheel pan is disabled', () => {
    const event = createWheelEvent({ deltaY: 20 })
    const setViewport = vi.fn<CanvasWheelViewportSetter>()

    runCanvasWheelViewport({
      config: createCanvasAffordanceConfig({
        gestures: { pan: false, wheelZoom: true },
      }),
      event,
      rect: createRect(),
      setViewport,
    })

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(setViewport).not.toHaveBeenCalled()
  })

  it('projects wheel pan input through the stage rect before updating the viewport', () => {
    const config = createCanvasAffordanceConfig()
    const event = createWheelEvent({
      clientX: 110,
      clientY: 80,
      deltaX: 10,
      deltaY: 20,
    })
    const rect = createRect({ left: 10, top: 20 })
    const setViewport = vi.fn<CanvasWheelViewportSetter>()

    runCanvasWheelViewport({
      config,
      event,
      rect,
      setViewport,
    })

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(getViewportUpdate(setViewport)(baseViewport)).toEqual(
      getCanvasWheelViewport({
        config,
        input: getExpectedWheelInput(event),
        point: { x: 100, y: 60 },
        viewport: baseViewport,
      }),
    )
  })

  it('uses pinch wheel input as zoom even when ordinary wheel pan is disabled', () => {
    const config = createCanvasAffordanceConfig({
      gestures: { pan: false, wheelZoom: true },
    })
    const event = createWheelEvent({
      clientX: 140,
      clientY: 90,
      ctrlKey: true,
      deltaY: -100,
    })
    const rect = createRect({ left: 40, top: 30 })
    const setViewport = vi.fn<CanvasWheelViewportSetter>()

    runCanvasWheelViewport({
      config,
      event,
      rect,
      setViewport,
    })

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(getViewportUpdate(setViewport)(baseViewport)).toEqual(
      getCanvasWheelViewport({
        config,
        input: getExpectedWheelInput(event),
        point: { x: 100, y: 60 },
        viewport: baseViewport,
      }),
    )
  })

  it('prevents default but preserves the current viewport when the engine has no next viewport', () => {
    const event = createWheelEvent()
    const setViewport = vi.fn<CanvasWheelViewportSetter>()

    runCanvasWheelViewport({
      config: createCanvasAffordanceConfig(),
      event,
      rect: createRect(),
      setViewport,
    })

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(getViewportUpdate(setViewport)(baseViewport)).toBe(baseViewport)
  })
})

function createWheelEvent(
  input: Partial<CanvasWheelViewportEvent> = {},
): CanvasWheelViewportEvent {
  return {
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    deltaMode: 0,
    deltaX: 0,
    deltaY: 0,
    metaKey: false,
    preventDefault: vi.fn(),
    shiftKey: false,
    ...input,
  }
}

function createRect(
  input: Partial<CanvasAppStageRect> = {},
): CanvasAppStageRect {
  return {
    height: 300,
    left: 0,
    top: 0,
    width: 500,
    ...input,
  }
}

function getExpectedWheelInput(
  event: CanvasWheelViewportEvent,
): CanvasWheelInput {
  return {
    ctrlKey: event.ctrlKey,
    deltaMode: event.deltaMode,
    deltaX: event.deltaX,
    deltaY: event.deltaY,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  }
}

function getViewportUpdate(
  setViewport: ReturnType<typeof vi.fn<CanvasWheelViewportSetter>>,
) {
  const viewportUpdate = setViewport.mock.calls[0][0]

  if (typeof viewportUpdate !== 'function') {
    throw new Error('expected viewport updater')
  }

  return viewportUpdate
}
