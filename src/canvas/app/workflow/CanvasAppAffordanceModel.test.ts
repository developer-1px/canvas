import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  createCanvasAffordanceConfig,
} from '../../engine'
import { getCanvasAppAffordanceModel } from './CanvasAppAffordanceModel'

describe('CanvasAppAffordanceModel', () => {
  it('routes one affordance config to every consumer context', () => {
    const config = createCanvasAffordanceConfig({
      tools: {
        pan: false,
      },
    })
    const model = getCanvasAppAffordanceModel(config)

    expect(model.command.config).toBe(config)
    expect(model.control.config).toBe(config)
    expect(model.drawing.config).toBe(config)
    expect(model.image.config).toBe(config)
    expect(model.interaction.config).toBe(config)
    expect(model.inspector.config).toBe(config)
    expect(model.keyboard.config).toBe(config)
    expect(model.pointer.config).toBe(config)
    expect(model.stamp.config).toBe(config)
    expect(model.text.config).toBe(config)
    expect(model.viewport.config).toBe(config)
  })

  it('uses the default affordance config when none is provided', () => {
    const model = getCanvasAppAffordanceModel()

    expect(model.command.config).toBe(DEFAULT_CANVAS_AFFORDANCE_CONFIG)
    expect(model.drawing.config).toBe(DEFAULT_CANVAS_AFFORDANCE_CONFIG)
    expect(model.image.config).toBe(DEFAULT_CANVAS_AFFORDANCE_CONFIG)
    expect(model.pointer.config).toBe(DEFAULT_CANVAS_AFFORDANCE_CONFIG)
    expect(model.stamp.config).toBe(DEFAULT_CANVAS_AFFORDANCE_CONFIG)
    expect(model.viewport.config).toBe(DEFAULT_CANVAS_AFFORDANCE_CONFIG)
  })
})
