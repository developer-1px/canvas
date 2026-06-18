import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
} from '../workflow'
import {
  createCanvasAppAiLabsFeaturePackManifest,
  createCanvasAppFeaturePackManifest,
  getCanvasAppFeaturePackMarketplaceSelectionControlModel,
  getCanvasAppFeaturePackMarketplaceTargetControl,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'
import {
  applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate,
  executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction,
  executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction,
  executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction,
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

  it('executes ready marketplace target transactions as assembly input sources', async () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-target-addon-pack',
      label: 'Shell target addon pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [addonManifest],
        featurePackStates: [{
          id: 'shell-target-addon-pack',
          status: 'uninstalled',
        }],
      },
      profiles: [],
      suiteManifests: [],
    })
    const sourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction({
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
        target: {
          featurePackId: 'shell-target-addon-pack',
          kind: 'pack',
        },
      })

    expect(sourceTransactionResult.status).toBe('applied')
    expect(sourceTransactionResult.applied).toBe(true)
    expect(sourceTransactionResult.actionKind).toBe('install')
    expect(sourceTransactionResult.updateMode).toBe('full-rebuild')
    expect(sourceTransactionResult.transactionResult.status).toBe('committed')
    expect(sourceTransactionResult.sourceResult.status).toBe('applied')
    expect(sourceTransactionResult.sourceResult.hostUpdate)
      .toBe(sourceTransactionResult.transactionResult.hostUpdate)
    expect(sourceTransactionResult.hostUpdate)
      .toBe(sourceTransactionResult.transactionResult.hostUpdate)
    expect(sourceTransactionResult.source).toEqual({
      assemblyInput: sourceTransactionResult.transactionResult.hostUpdate
        .nextAssemblyInput,
    })
    expect(Object.isFrozen(sourceTransactionResult)).toBe(true)
    expect(Object.isFrozen(sourceTransactionResult.source)).toBe(true)

    const nextAssembly =
      resolveCanvasAppAssemblySource(sourceTransactionResult.source)

    expect(nextAssembly.installedFeaturePackIds)
      .toContain('shell-target-addon-pack')
    expect(sourceTransactionResult.source.assemblyInput.featurePackStates)
      .toEqual([{
        id: 'shell-target-addon-pack',
        status: 'disabled',
      }])
  })

  it('executes ready marketplace target control transactions as assembly input sources', async () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-control-addon-pack',
      label: 'Shell control addon pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [addonManifest],
        featurePackStates: [{
          id: 'shell-control-addon-pack',
          status: 'uninstalled',
        }],
      },
      profiles: [],
      suiteManifests: [],
    })
    const control = getCanvasAppFeaturePackMarketplaceTargetControl({
      model: model.marketplaceModel,
      target: {
        featurePackId: 'shell-control-addon-pack',
        kind: 'pack',
      },
    })
    const sourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction({
        control,
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
      })

    expect(control).toMatchObject({
      actionKind: 'install',
      ready: true,
      status: 'ready',
    })
    expect(sourceTransactionResult.status).toBe('applied')
    expect(sourceTransactionResult.applied).toBe(true)
    expect(sourceTransactionResult.actionKind).toBe('install')
    expect(sourceTransactionResult.transactionResult?.status).toBe('committed')
    expect(sourceTransactionResult.source.assemblyInput?.featurePackStates)
      .toEqual([{
        id: 'shell-control-addon-pack',
        status: 'disabled',
      }])
  })

  it('keeps blocked marketplace target control transactions on the held source path', async () => {
    const paidManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-control-private-pack',
      label: 'Shell control private pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [paidManifest],
        featurePackStates: [{
          id: 'shell-control-private-pack',
          status: 'uninstalled',
        }],
      },
      listings: [{
        access: 'private',
        distribution: 'available',
        featurePackId: 'shell-control-private-pack',
      }],
      profiles: [],
      suiteManifests: [],
    })
    const control = getCanvasAppFeaturePackMarketplaceTargetControl({
      model: model.marketplaceModel,
      target: {
        featurePackId: 'shell-control-private-pack',
        kind: 'pack',
      },
    })
    const prebuiltSource = {
      assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
    } satisfies CanvasAppPrebuiltAssemblySource
    const sourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction({
        control,
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
        source: prebuiltSource,
      })

    expect(control).toMatchObject({
      actionKind: 'install',
      ready: false,
      status: 'blocked',
    })
    expect(sourceTransactionResult.status).toBe('held')
    expect(sourceTransactionResult.applied).toBe(false)
    expect(sourceTransactionResult.actionKind).toBe('install')
    expect(sourceTransactionResult.holdReason).toBe('blocked')
    expect(sourceTransactionResult.transactionResult.status).toBe('held')
    expect(sourceTransactionResult.source).toBe(prebuiltSource)
    expect(resolveCanvasAppAssemblySource(sourceTransactionResult.source))
      .toBe(DEFAULT_CANVAS_APP_ASSEMBLY)
  })

  it('preserves current sources for missing marketplace target controls', async () => {
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [],
      },
      profiles: [],
      suiteManifests: [],
    })
    const control = getCanvasAppFeaturePackMarketplaceTargetControl({
      model: model.marketplaceModel,
      target: {
        featurePackId: 'missing-control-pack',
        kind: 'pack',
      },
    })
    const prebuiltSource = {
      assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
    } satisfies CanvasAppPrebuiltAssemblySource
    const sourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetControlApplyTransaction({
        control,
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
        source: prebuiltSource,
      })

    expect(control).toMatchObject({
      actionKind: null,
      item: null,
      ready: false,
      status: 'missing',
    })
    expect(sourceTransactionResult).toMatchObject({
      actionKind: null,
      applied: false,
      control,
      holdReason: 'missing-target',
      hostUpdate: null,
      source: prebuiltSource,
      sourceResult: null,
      status: 'missing',
      target: {
        featurePackId: 'missing-control-pack',
        kind: 'pack',
      },
      transactionResult: null,
      update: null,
      updateMode: 'blocked',
    })
    expect(resolveCanvasAppAssemblySource(sourceTransactionResult.source))
      .toBe(DEFAULT_CANVAS_APP_ASSEMBLY)
    expect(Object.isFrozen(sourceTransactionResult)).toBe(true)
  })

  it('executes ready marketplace selection target control transactions as assembly input sources', async () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-selection-addon-pack',
      label: 'Shell selection addon pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [addonManifest],
        featurePackStates: [{
          id: 'shell-selection-addon-pack',
          status: 'uninstalled',
        }],
      },
      profiles: [],
      suiteManifests: [],
    })
    const selection = getCanvasAppFeaturePackMarketplaceSelectionControlModel({
      facetKind: 'all',
      model: model.marketplaceModel,
      sectionKind: 'packs',
    })
    const sourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction({
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
        selection,
        target: {
          featurePackId: 'shell-selection-addon-pack',
          kind: 'pack',
        },
      })

    expect(selection).toMatchObject({
      selectedFacetKind: 'all',
      selectedSectionKind: 'packs',
      status: 'selected',
    })
    expect(sourceTransactionResult.status).toBe('applied')
    expect(sourceTransactionResult.applied).toBe(true)
    expect(sourceTransactionResult.actionKind).toBe('install')
    expect(sourceTransactionResult.transactionResult?.status).toBe('committed')
    expect(sourceTransactionResult.source.assemblyInput?.featurePackStates)
      .toEqual([{
        id: 'shell-selection-addon-pack',
        status: 'disabled',
      }])
  })

  it('keeps blocked marketplace selection target control transactions on the held source path', async () => {
    const paidManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-selection-private-pack',
      label: 'Shell selection private pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [paidManifest],
        featurePackStates: [{
          id: 'shell-selection-private-pack',
          status: 'uninstalled',
        }],
      },
      listings: [{
        access: 'private',
        distribution: 'available',
        featurePackId: 'shell-selection-private-pack',
      }],
      profiles: [],
      suiteManifests: [],
    })
    const selection = getCanvasAppFeaturePackMarketplaceSelectionControlModel({
      facetKind: 'all',
      model: model.marketplaceModel,
      sectionKind: 'packs',
    })
    const prebuiltSource = {
      assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
    } satisfies CanvasAppPrebuiltAssemblySource
    const sourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction({
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
        selection,
        source: prebuiltSource,
        target: {
          featurePackId: 'shell-selection-private-pack',
          kind: 'pack',
        },
      })

    expect(sourceTransactionResult.status).toBe('held')
    expect(sourceTransactionResult.applied).toBe(false)
    expect(sourceTransactionResult.actionKind).toBe('install')
    expect(sourceTransactionResult.holdReason).toBe('blocked')
    expect(sourceTransactionResult.transactionResult.status).toBe('held')
    expect(sourceTransactionResult.source).toBe(prebuiltSource)
    expect(resolveCanvasAppAssemblySource(sourceTransactionResult.source))
      .toBe(DEFAULT_CANVAS_APP_ASSEMBLY)
  })

  it('preserves current sources when marketplace selection target controls are not selected', async () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-selection-runtime-pack',
      label: 'Shell selection runtime pack',
    })
    const privateManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-selection-filtered-private-pack',
      label: 'Shell selection filtered private pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [runtimeManifest, privateManifest],
        featurePackStates: [{
          id: 'shell-selection-filtered-private-pack',
          status: 'uninstalled',
        }],
      },
      listings: [{
        access: 'private',
        distribution: 'available',
        featurePackId: 'shell-selection-filtered-private-pack',
      }],
      profiles: [],
      suiteManifests: [],
    })
    const selection = getCanvasAppFeaturePackMarketplaceSelectionControlModel({
      facetKind: 'private',
      model: model.marketplaceModel,
      sectionKind: 'packs',
    })
    const prebuiltSource = {
      assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
    } satisfies CanvasAppPrebuiltAssemblySource
    const sourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceSelectionTargetControlApplyTransaction({
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
        selection,
        source: prebuiltSource,
        target: {
          featurePackId: 'shell-selection-runtime-pack',
          kind: 'pack',
        },
      })

    expect(selection.controls.map((control) => control.target)).toEqual([{
      featurePackId: 'shell-selection-filtered-private-pack',
      kind: 'pack',
    }])
    expect(sourceTransactionResult).toMatchObject({
      actionKind: null,
      applied: false,
      control: null,
      holdReason: 'missing-selection-target',
      hostUpdate: null,
      selection,
      source: prebuiltSource,
      sourceResult: null,
      status: 'missing-selection-target',
      target: {
        featurePackId: 'shell-selection-runtime-pack',
        kind: 'pack',
      },
      transactionResult: null,
      update: null,
      updateMode: 'blocked',
    })
    expect(resolveCanvasAppAssemblySource(sourceTransactionResult.source))
      .toBe(DEFAULT_CANVAS_APP_ASSEMBLY)
    expect(Object.isFrozen(sourceTransactionResult)).toBe(true)
    expect(Object.isFrozen(sourceTransactionResult.target)).toBe(true)
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

  it('preserves current sources for held marketplace target source transactions', async () => {
    const paidManifest = createCanvasAppFeaturePackManifest({
      id: 'shell-private-pack',
      label: 'Shell private pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [paidManifest],
        featurePackStates: [{
          id: 'shell-private-pack',
          status: 'uninstalled',
        }],
      },
      listings: [{
        access: 'private',
        distribution: 'available',
        featurePackId: 'shell-private-pack',
      }],
      profiles: [],
      suiteManifests: [],
    })
    const prebuiltSource = {
      assembly: DEFAULT_CANVAS_APP_ASSEMBLY,
    } satisfies CanvasAppPrebuiltAssemblySource
    const sourceTransactionResult =
      await executeCanvasAppAssemblySourceFeaturePackMarketplaceTargetApplyTransaction({
        executeCleanupEffect: () => ({ kind: 'not-run' as const }),
        model,
        source: prebuiltSource,
        target: {
          featurePackId: 'shell-private-pack',
          kind: 'pack',
        },
      })

    expect(sourceTransactionResult.status).toBe('held')
    expect(sourceTransactionResult.applied).toBe(false)
    expect(sourceTransactionResult.holdReason).toBe('blocked')
    expect(sourceTransactionResult.actionKind).toBe('install')
    expect(sourceTransactionResult.updateMode).toBe('blocked')
    expect(sourceTransactionResult.update).toBeNull()
    expect(sourceTransactionResult.transactionResult.status).toBe('held')
    expect(sourceTransactionResult.hostUpdate.ready).toBe(false)
    expect(sourceTransactionResult.sourceResult.status).toBe('held')
    expect(sourceTransactionResult.sourceResult.source).toBe(prebuiltSource)
    expect(sourceTransactionResult.source).toBe(prebuiltSource)
    expect(resolveCanvasAppAssemblySource(sourceTransactionResult.source))
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
