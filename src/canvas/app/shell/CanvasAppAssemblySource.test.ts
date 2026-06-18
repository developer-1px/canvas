import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
} from '../workflow'
import {
  createCanvasAppAiLabsFeaturePackManifest,
  createCanvasAppFeaturePackManifest,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'
import {
  applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate,
  resolveCanvasAppAssemblySource,
  type CanvasAppPrebuiltAssemblySource,
} from './CanvasAppAssemblySource'

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

  it('applies ready marketplace host updates as assembly input sources', async () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-addon-pack',
      label: 'Shell addon pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [addonManifest],
        featurePackStates: [{
          id: 'shell-addon-pack',
          status: 'uninstalled',
        }],
      },
      profiles: [],
      suiteManifests: [],
    })
    const addonItem = model.marketplaceModel.packs.items[0]

    if (!addonItem) {
      throw new Error('Expected shell addon marketplace item')
    }

    const installAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(addonItem)

    expect(installAction.kind).toBe('install')
    const transactionResult =
      await executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction({
        action: installAction,
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
      })
    const prebuiltSource = {
      assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
    } satisfies CanvasAppPrebuiltAssemblySource
    const sourceResult =
      applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate({
        hostUpdate: transactionResult.hostUpdate,
        source: prebuiltSource,
      })

    expect(sourceResult.status).toBe('applied')
    expect(sourceResult.applied).toBe(true)
    expect(sourceResult.application.hostUpdate)
      .toBe(transactionResult.hostUpdate)
    expect(sourceResult.hostUpdate).toBe(transactionResult.hostUpdate)
    expect(sourceResult.source).toEqual({
      assemblyInput: transactionResult.hostUpdate.nextAssemblyInput,
    })
    expect(Object.isFrozen(sourceResult)).toBe(true)
    expect(Object.isFrozen(sourceResult.source)).toBe(true)
    expect('assembly' in sourceResult.source).toBe(false)

    const nextAssembly = resolveCanvasAppAssemblySource(sourceResult.source)

    expect(nextAssembly.installedFeaturePackIds)
      .toContain('shell-addon-pack')
    expect(nextAssembly.enabledFeaturePackIds).toEqual([])
    expect(sourceResult.source.assemblyInput.featurePackStates).toEqual([{
      id: 'shell-addon-pack',
      status: 'disabled',
    }])
  })

  it('keeps current assembly input source for held marketplace host updates', async () => {
    const transactionResult = await getBlockedShellMarketplaceTransaction()
    const sourceResult =
      applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate({
        hostUpdate: transactionResult.hostUpdate,
      })

    expect(sourceResult.status).toBe('held')
    expect(sourceResult.applied).toBe(false)
    expect(sourceResult.holdReason).toBe('blocked')
    expect(sourceResult.application.hostUpdate)
      .toBe(transactionResult.hostUpdate)
    expect(sourceResult.source).toEqual({
      assemblyInput: transactionResult.model.assemblyInput,
    })
    expect(Object.isFrozen(sourceResult)).toBe(true)
    expect(Object.isFrozen(sourceResult.source)).toBe(true)

    const currentAssembly = resolveCanvasAppAssemblySource(sourceResult.source)

    expect(currentAssembly.enabledFeaturePackIds).toEqual([
      'shell-runtime-pack',
      'shell-addon-pack',
    ])
  })

  it('preserves prebuilt assembly sources for held marketplace host updates', async () => {
    const transactionResult = await getBlockedShellMarketplaceTransaction()
    const prebuiltSource = {
      assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
    } satisfies CanvasAppPrebuiltAssemblySource
    const sourceResult =
      applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate({
        hostUpdate: transactionResult.hostUpdate,
        source: prebuiltSource,
      })

    expect(sourceResult.status).toBe('held')
    expect(sourceResult.applied).toBe(false)
    expect(sourceResult.source).toBe(prebuiltSource)
    expect(resolveCanvasAppAssemblySource(sourceResult.source))
      .toBe(DEFAULT_CANVAS_APP_ASSEMBLY)
  })
})

async function getBlockedShellMarketplaceTransaction() {
  const runtimeManifest = createCanvasAppFeaturePackManifest({
    id: 'shell-runtime-pack',
    label: 'Shell runtime pack',
    lifecycle: {
      orphanedDataScopeIds: ['shell-runtime-data'],
      orphanedDataPolicy: 'host-managed',
    },
    provides: ['shell-runtime-capability'],
  })
  const addonManifest = createCanvasAppFeaturePackManifest({
    id: 'shell-addon-pack',
    label: 'Shell addon pack',
    requires: ['shell-runtime-capability'],
  })
  const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
    assemblyInput: {
      featurePackManifests: [runtimeManifest, addonManifest],
    },
    profiles: [],
    suiteManifests: [],
  })
  const runtimeItem = model.marketplaceModel.packs.items[0]

  if (!runtimeItem) {
    throw new Error('Expected shell runtime marketplace item')
  }

  const uninstallAction = runtimeItem.actions.find((action) =>
    action.kind === 'uninstall',
  )

  if (!uninstallAction) {
    throw new Error('Expected shell runtime uninstall action')
  }

  return executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction({
    action: uninstallAction,
    cleanupHandlers: [{
      createEffect: ({ scopeId }) => ({
        kind: 'remove-scope-data' as const,
        scopeId,
      }),
      scopeId: 'shell-runtime-data',
    }],
    executeCleanupEffect: ({ effect, scopeId }) => ({
      kind: effect.kind,
      scopeId,
    }),
    model,
  })
}
