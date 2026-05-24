import { describe, expect, it } from 'vitest'
import {
  assertCanvasAffordanceConfig,
  createCanvasAffordanceConfig,
} from './CanvasAffordances'
import type {
  CanvasAffordanceConfig,
  CanvasAffordanceConfigInput,
} from './CanvasAffordanceTypes'
import { CANVAS_AFFORDANCE_CONFIG_DEFAULTS } from './CanvasAffordanceCatalog'

describe('CanvasAffordanceConfig', () => {
  it('merges feature toggle overrides with complete defaults', () => {
    const config = createCanvasAffordanceConfig({
      commands: { duplicate: false },
      overlays: {
        componentPalette: false,
        inspector: false,
      },
      tools: { marker: false },
    })

    expect(config.commands.duplicate).toBe(false)
    expect(config.commands.delete).toBe(true)
    expect(config.overlays.componentPalette).toBe(false)
    expect(config.overlays.inspector).toBe(false)
    expect(config.overlays.toolbar).toBe(true)
    expect(config.shortcuts.findReplace).toBe(true)
    expect(config.tools.marker).toBe(false)
    expect(config.tools.select).toBe(true)
  })

  it('snapshots generated configs against caller mutation', () => {
    const tools: NonNullable<CanvasAffordanceConfigInput['tools']> = {
      marker: false,
    }
    const config = createCanvasAffordanceConfig({ tools })

    tools.marker = true

    expect(config.tools.marker).toBe(false)
    expect(Object.isFrozen(config)).toBe(true)
    expect(Object.isFrozen(config.commands)).toBe(true)
    expect(Object.isFrozen(config.tools)).toBe(true)
  })

  it('keeps the built-in affordance catalog immutable', () => {
    expect(Object.isFrozen(CANVAS_AFFORDANCE_CONFIG_DEFAULTS)).toBe(true)
    expect(Object.isFrozen(CANVAS_AFFORDANCE_CONFIG_DEFAULTS.commands)).toBe(
      true,
    )
    expect(Object.isFrozen(CANVAS_AFFORDANCE_CONFIG_DEFAULTS.tools)).toBe(true)
  })

  it('rejects malformed config input at the engine seam', () => {
    expect(() =>
      createCanvasAffordanceConfig({
        tools: { marker: 'off' },
      } as unknown as CanvasAffordanceConfigInput),
    ).toThrow('Canvas affordance config tools.marker must be boolean')

    expect(() =>
      createCanvasAffordanceConfig({
        tools: { beam: false },
      } as unknown as CanvasAffordanceConfigInput),
    ).toThrow('Unknown canvas affordance config tools: beam')

    expect(() =>
      createCanvasAffordanceConfig({
        panels: {},
      } as unknown as CanvasAffordanceConfigInput),
    ).toThrow('Unknown canvas affordance config group: panels')
  })

  it('validates complete configs before runtime use', () => {
    const config = createCanvasAffordanceConfig()

    expect(assertCanvasAffordanceConfig(config)).toBe(config)
    expect(() =>
      assertCanvasAffordanceConfig({
        ...config,
        tools: {
          ...config.tools,
          marker: undefined,
        },
      } as unknown as CanvasAffordanceConfig),
    ).toThrow('Canvas affordance config tools.marker must be boolean')
  })
})
