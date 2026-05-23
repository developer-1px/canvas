import { describe, expect, it } from 'vitest'
import { DEFAULT_CANVAS_AFFORDANCE_CONFIG } from '../../engine'
import { createCanvasAppAffordanceAssembly } from './CanvasAppAffordanceAssembly'

describe('CanvasAppAffordanceAssembly', () => {
  it('uses default affordance config when product input is absent', () => {
    const defaults = {
      affordanceConfig: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    }

    expect(createCanvasAppAffordanceAssembly(
      {},
      defaults,
    ).affordanceConfig).toBe(DEFAULT_CANVAS_AFFORDANCE_CONFIG)
  })

  it('normalizes product affordance config overrides', () => {
    const defaults = {
      affordanceConfig: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    }
    const affordanceConfig = createCanvasAppAffordanceAssembly({
      affordanceConfig: {
        commands: { duplicate: false },
        gestures: { drawMarker: false },
        overlays: { grid: false },
        shortcuts: { markerTool: false },
        tools: { marker: false },
      },
    }, defaults).affordanceConfig

    expect(affordanceConfig.commands.duplicate).toBe(false)
    expect(affordanceConfig.gestures.drawMarker).toBe(false)
    expect(affordanceConfig.overlays.grid).toBe(false)
    expect(affordanceConfig.shortcuts.markerTool).toBe(false)
    expect(affordanceConfig.tools.marker).toBe(false)
    expect(affordanceConfig.tools.select).toBe(true)
    expect(Object.isFrozen(affordanceConfig)).toBe(true)
  })

  it('rejects malformed product affordance config before app runtime', () => {
    expect(() =>
      createCanvasAppAffordanceAssembly({
        affordanceConfig: {
          tools: { marker: 'off' },
        },
      } as unknown as Parameters<typeof createCanvasAppAffordanceAssembly>[0], {
        affordanceConfig: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
      }),
    ).toThrow('Canvas affordance config tools.marker must be boolean')
  })
})
