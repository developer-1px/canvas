import { describe, expect, it } from 'vitest'
import { DEFAULT_CANVAS_APP_ASSEMBLY } from '../workflow'
import { resolveCanvasAppAssemblySource } from './CanvasAppAssemblySource'

describe('CanvasAppAssemblySource', () => {
  it('resolves assembly input through the app assembly seam', () => {
    const assembly = resolveCanvasAppAssemblySource({
      assemblyInput: {
        affordanceConfig: {
          overlays: {
            toolbar: false,
          },
        },
      },
    })

    expect(assembly.affordanceConfig.overlays.toolbar).toBe(false)
    expect(assembly.affordanceConfig.tools.select).toBe(true)
    expect(Object.isFrozen(assembly)).toBe(true)
  })

  it('preserves prebuilt assemblies for advanced hosts', () => {
    expect(resolveCanvasAppAssemblySource({
      assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
    })).toBe(DEFAULT_CANVAS_APP_ASSEMBLY)
  })

  it('rejects ambiguous assembly sources', () => {
    expect(() =>
      resolveCanvasAppAssemblySource({
        assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
        assemblyInput: {},
      }),
    ).toThrow('CanvasApp accepts either assembly or assemblyInput, not both')
  })
})
