import { describe, expect, it } from 'vitest'
import {
  createCanvasAppAiLabsFeaturePackManifest,
} from '@interactive-os/canvas-pack-ai-labs'
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

  it('installs optional feature pack manifests through assembly input', () => {
    const aiLabsManifest = createCanvasAppAiLabsFeaturePackManifest({
      provider: {
        complete: () => ({ text: 'Summary' }),
        id: 'shell-ai',
      },
      requestReview: () => ({ kind: 'cancel' }),
    })
    const assembly = resolveCanvasAppAssemblySource({
      assemblyInput: {
        additionalFeaturePackManifests: [aiLabsManifest],
      },
    })

    expect(assembly.installedFeaturePackIds).toContain('toolbar')
    expect(assembly.installedFeaturePackIds).toContain('ai-labs')
    expect(assembly.customCommands.map((command) => command.id))
      .toContain('ai-labs-summarize-selection')
  })

  it('uninstalls optional feature pack manifests through assembly input', () => {
    const aiLabsManifest = createCanvasAppAiLabsFeaturePackManifest({
      provider: {
        complete: () => ({ text: 'Summary' }),
        id: 'shell-ai',
      },
      requestReview: () => ({ kind: 'cancel' }),
    })
    const assembly = resolveCanvasAppAssemblySource({
      assemblyInput: {
        additionalFeaturePackManifests: [aiLabsManifest],
        disabledFeaturePackIds: ['ai-labs'],
      },
    })

    expect(assembly.installedFeaturePackIds).not.toContain('ai-labs')
    expect(assembly.installedFeaturePackIds).toContain('toolbar')
    expect(assembly.customCommands.map((command) => command.id))
      .not.toContain('ai-labs-summarize-selection')
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
