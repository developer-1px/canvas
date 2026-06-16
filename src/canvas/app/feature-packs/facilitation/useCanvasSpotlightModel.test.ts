import { describe, expect, it } from 'vitest'
import {
  createCanvasSpotlightState,
  startCanvasSpotlight,
  stopCanvasSpotlight,
} from './useCanvasSpotlightModel'

describe('CanvasSpotlightModel', () => {
  it('starts and stops spotlight without document state', () => {
    const idle = createCanvasSpotlightState()
    const active = startCanvasSpotlight(idle)
    const stopped = stopCanvasSpotlight(active)

    expect(idle.active).toBe(false)
    expect(active.active).toBe(true)
    expect(stopped.active).toBe(false)
  })

  it('keeps no-op spotlight transitions referentially stable', () => {
    const idle = createCanvasSpotlightState()
    const active = startCanvasSpotlight(idle)

    expect(stopCanvasSpotlight(idle)).toBe(idle)
    expect(startCanvasSpotlight(active)).toBe(active)
  })
})
