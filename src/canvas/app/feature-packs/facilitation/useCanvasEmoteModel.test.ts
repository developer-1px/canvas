import { describe, expect, it } from 'vitest'
import { CANVAS_DEFAULT_EMOTE } from './CanvasEmoteCatalog'
import {
  createCanvasEmoteBurstOverlay,
  getCanvasEmoteWorldPoint,
} from './useCanvasEmoteModel'

describe('CanvasEmoteModel', () => {
  it('creates a transient emote burst overlay without document state', () => {
    const burst = createCanvasEmoteBurstOverlay({
      emote: CANVAS_DEFAULT_EMOTE,
      id: 'emote-1',
      point: { x: 120, y: 80 },
    })

    expect(burst).toMatchObject({
      emote: 'thumbs-up',
      id: 'emote-1',
      label: '+1',
      point: { x: 120, y: 80 },
    })
    expect(burst.particles.length).toBeGreaterThan(1)
  })

  it('converts pointer screen coordinates into world coordinates', () => {
    expect(getCanvasEmoteWorldPoint({
      event: { clientX: 150, clientY: 90 },
      stageElement: {
        getScreenPoint: () => ({ x: 130, y: 70 }),
      },
      viewport: { scale: 2, x: 30, y: 10 },
    })).toEqual({ x: 50, y: 30 })
  })
})
