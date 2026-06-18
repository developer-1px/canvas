import { describe, expect, it } from 'vitest'
import {
  createCanvasAppFeaturePackManifest,
  createCanvasAppFeaturePackProfile,
  createCanvasAppFeaturePackSuiteManifest,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'
import { createCanvasAppAssembly } from './CanvasAppAssembly'
import {
  createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction,
  executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyResult,
  getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyActionInput,
  getCanvasAppFeaturePackMarketplaceAssemblyActionPlan,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackAssembly'

describe('CanvasAppFeaturePackMarketplaceAssembly', () => {
  it('creates a marketplace model from host assembly input', () => {
    const baseManifest = createCanvasAppFeaturePackManifest({
      id: 'base-pack',
      label: 'Base pack',
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
    })
    const addonProfile = createCanvasAppFeaturePackProfile({
      id: 'addon-profile',
      installedFeaturePackIds: ['addon-pack'],
      label: 'Addon profile',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        additionalFeaturePackManifests: [addonManifest],
        disabledFeaturePackIds: ['base-pack'],
        featurePackManifests: [baseManifest],
        featurePackProfile: addonProfile,
      },
      profiles: [addonProfile],
      suiteManifests: [],
    })

    expect(model.featurePackManifests.map((manifest) => manifest.id)).toEqual([
      'base-pack',
      'addon-pack',
    ])
    expect(model.installOptions).toEqual({
      featurePackStates: [
        {
          id: 'base-pack',
          status: 'uninstalled',
        },
        {
          id: 'addon-pack',
          status: 'enabled',
        },
      ],
    })
    expect('disabledFeaturePackIds' in model.assemblyInput).toBe(false)
    expect('featurePackProfile' in model.assemblyInput).toBe(false)
    expect(model.assemblyInput.featurePackStates).toEqual(
      model.installOptions.featurePackStates,
    )
    expect(model.listings).toEqual([])
    expect(model.profiles).toEqual([addonProfile])
    expect(model.suiteManifests).toEqual([])
    expect(model.marketplaceModel.packs.items.map((item) => item.status))
      .toEqual(['uninstalled', 'enabled'])
    expect(model.marketplaceModel.profiles.items[0]?.status).toBe('active')
    expect(Object.isFrozen(model)).toBe(true)
    expect(Object.isFrozen(model.assemblyInput)).toBe(true)
  })

  it('applies pack marketplace actions from the assembly model', () => {
    const baseManifest = createCanvasAppFeaturePackManifest({
      id: 'base-pack',
      label: 'Base pack',
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [baseManifest, addonManifest],
        featurePackStates: [
          {
            id: 'base-pack',
            status: 'enabled',
          },
          {
            id: 'addon-pack',
            status: 'uninstalled',
          },
        ],
      },
      profiles: [],
      suiteManifests: [],
    })
    const addonPackItem = model.marketplaceModel.packs.items[1]

    if (!addonPackItem) {
      throw new Error('Expected addon pack item')
    }

    const primaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(addonPackItem)
    const actionPlan = getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
      action: primaryAction,
      model,
    })
    const assemblyInput = getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
      action: primaryAction,
      model,
    })
    const assembly = createCanvasAppAssembly(assemblyInput)

    expect(primaryAction.kind).toBe('install')
    expect(actionPlan.status).toBe('ready')
    if (actionPlan.status !== 'ready') {
      throw new Error('Expected ready action plan')
    }

    expect(actionPlan.assemblyInput).toEqual(assemblyInput)
    expect(assemblyInput.featurePackStates).toEqual([
      {
        id: 'base-pack',
        status: 'enabled',
      },
      {
        id: 'addon-pack',
        status: 'disabled',
      },
    ])
    expect(assembly.installedFeaturePackIds).toEqual([
      'base-pack',
      'addon-pack',
    ])
    expect(assembly.enabledFeaturePackIds).toEqual(['base-pack'])
  })

  it('marks runtime-toggle actions with partial surfaces as partial updates', () => {
    const overlayManifest = createCanvasAppFeaturePackManifest({
      id: 'overlay-pack',
      label: 'Overlay pack',
      lifecycle: {
        partialUpdate: ['overlay'],
        runtimeToggleable: true,
      },
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [overlayManifest],
      },
      profiles: [],
      suiteManifests: [],
    })
    const overlayItem = model.marketplaceModel.packs.items[0]

    if (!overlayItem) {
      throw new Error('Expected overlay pack item')
    }

    const primaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(overlayItem)
    const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan({
      action: primaryAction,
      model,
    })
    const applyResult = getCanvasAppFeaturePackMarketplaceAssemblyApplyResult({
      action: primaryAction,
      model,
    })

    expect(primaryAction.kind).toBe('disable')
    expect(applyPlan.status).toBe('ready')
    if (applyPlan.status !== 'ready') {
      throw new Error('Expected ready apply plan')
    }

    expect(applyPlan.updateMode).toBe('partial-update')
    expect(applyPlan.partialUpdateSurfaceIds).toEqual(['overlay'])
    expect(applyPlan.assemblyInput.featurePackStates).toEqual([{
      id: 'overlay-pack',
      status: 'disabled',
    }])
    expect(applyResult.status).toBe('ready')
    if (applyResult.status !== 'ready') {
      throw new Error('Expected ready apply result')
    }

    expect(applyResult.currentModel).toBe(model)
    expect(applyResult.updateMode).toBe('partial-update')
    expect(applyResult.nextModel.assemblyInput).toEqual(
      applyPlan.assemblyInput,
    )
    expect(applyResult.nextModel.marketplaceModel.packs.items[0])
      .toMatchObject({
        featurePackId: 'overlay-pack',
        primaryActionKind: 'enable',
        status: 'disabled',
      })
  })

  it('marks install actions without partial surfaces as full rebuilds', () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [addonManifest],
        featurePackStates: [{
          id: 'addon-pack',
          status: 'uninstalled',
        }],
      },
      listings: [{
        access: 'paid',
        entitlement: 'granted',
        featurePackId: 'addon-pack',
        priceLabel: '$4/mo',
      }],
      profiles: [],
      suiteManifests: [],
    })
    const addonItem = model.marketplaceModel.packs.items[0]

    if (!addonItem) {
      throw new Error('Expected addon pack item')
    }

    const primaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(addonItem)
    const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan({
      action: primaryAction,
      model,
    })
    const applyResult = getCanvasAppFeaturePackMarketplaceAssemblyApplyResult({
      action: primaryAction,
      model,
    })

    expect(primaryAction.kind).toBe('install')
    expect(applyPlan.status).toBe('ready')
    if (applyPlan.status !== 'ready') {
      throw new Error('Expected ready apply plan')
    }

    expect(applyPlan.updateMode).toBe('full-rebuild')
    expect(applyPlan.partialUpdateSurfaceIds).toEqual([])
    expect(applyPlan.assemblyInput.featurePackStates).toEqual([{
      id: 'addon-pack',
      status: 'disabled',
    }])
    expect(applyResult.status).toBe('ready')
    if (applyResult.status !== 'ready') {
      throw new Error('Expected ready apply result')
    }

    expect(applyResult.updateMode).toBe('full-rebuild')
    expect(applyResult.nextModel.listings).toEqual(model.listings)
    expect(applyResult.nextModel.marketplaceModel.packs.items[0])
      .toMatchObject({
        featurePackId: 'addon-pack',
        listing: {
          access: 'paid',
          entitlement: 'granted',
          priceLabel: '$4/mo',
        },
        primaryActionKind: 'enable',
        status: 'disabled',
      })
  })

  it('carries uninstall data policy through ready apply plans', async () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      lifecycle: {
        orphanedDataScopeIds: ['addon-data'],
        orphanedDataPolicy: 'remove',
      },
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [addonManifest],
      },
      profiles: [],
      suiteManifests: [],
    })
    const addonItem = model.marketplaceModel.packs.items[0]

    if (!addonItem) {
      throw new Error('Expected addon pack item')
    }

    const uninstallAction = addonItem.actions.find((action) =>
      action.kind === 'uninstall',
    )

    if (!uninstallAction) {
      throw new Error('Expected uninstall action')
    }

    const actionPlan = getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
      action: uninstallAction,
      model,
    })
    const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan({
      action: uninstallAction,
      model,
    })
    const applyResult = getCanvasAppFeaturePackMarketplaceAssemblyApplyResult({
      action: uninstallAction,
      model,
    })

    expect(uninstallAction.ready).toBe(true)
    expect(actionPlan).toMatchObject({
      actionKind: 'uninstall',
      status: 'ready',
      uninstallDataPlan: {
        entries: [{
          featurePackId: 'addon-pack',
          orphanedDataScopeIds: ['addon-data'],
          orphanedDataPolicy: 'remove',
        }],
        hostManagedFeaturePackIds: [],
        hostManagedScopeIds: [],
        preserveFeaturePackIds: [],
        preserveScopeIds: [],
        removeFeaturePackIds: ['addon-pack'],
        removeScopeIds: ['addon-data'],
        unscopedFeaturePackIds: [],
      },
      uninstallPolicyEntries: [{
        featurePackId: 'addon-pack',
        orphanedDataScopeIds: ['addon-data'],
        orphanedDataPolicy: 'remove',
      }],
    })
    expect(applyPlan).toMatchObject({
      actionKind: 'uninstall',
      status: 'ready',
      uninstallDataPlan: {
        removeFeaturePackIds: ['addon-pack'],
        removeScopeIds: ['addon-data'],
        unscopedFeaturePackIds: [],
      },
      uninstallPolicyEntries: [{
        featurePackId: 'addon-pack',
        orphanedDataScopeIds: ['addon-data'],
        orphanedDataPolicy: 'remove',
      }],
      updateMode: 'full-rebuild',
    })
    expect(applyResult).toMatchObject({
      actionKind: 'uninstall',
      status: 'ready',
      uninstallDataPlan: {
        removeFeaturePackIds: ['addon-pack'],
        removeScopeIds: ['addon-data'],
        unscopedFeaturePackIds: [],
      },
      uninstallPolicyEntries: [{
        featurePackId: 'addon-pack',
        orphanedDataScopeIds: ['addon-data'],
        orphanedDataPolicy: 'remove',
      }],
      updateMode: 'full-rebuild',
    })

    if (applyResult.status !== 'ready') {
      throw new Error('Expected ready apply result')
    }

    expect(applyResult.nextModel.assemblyInput.featurePackStates).toEqual([{
      id: 'addon-pack',
      status: 'uninstalled',
    }])

    const cleanupPlan =
      createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
        handlers: [{
          createEffect: ({ featurePackIds, scopeId }) => ({
            featurePackIds: [...featurePackIds],
            kind: 'remove-scope-data' as const,
            scopeId,
          }),
          scopeId: 'addon-data',
        }],
        uninstallDataPlan: applyPlan.uninstallDataPlan,
      })

    expect(cleanupPlan).toMatchObject({
      effects: [{
        effect: {
          featurePackIds: ['addon-pack'],
          kind: 'remove-scope-data',
          scopeId: 'addon-data',
        },
        featurePackIds: ['addon-pack'],
        scopeId: 'addon-data',
      }],
      handledScopeIds: ['addon-data'],
      missingHandlerScopeIds: [],
      status: 'ready',
    })

    const cleanupExecutionResult =
      await executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
        cleanupEffectPlan: cleanupPlan,
        executeEffect: ({ effect, scopeId }) => ({
          applied: true as const,
          effectKind: effect.kind,
          scopeId,
        }),
      })

    expect(cleanupExecutionResult).toMatchObject({
      effectResults: [{
        featurePackIds: ['addon-pack'],
        scopeId: 'addon-data',
        status: 'succeeded',
        value: {
          applied: true,
          effectKind: 'remove-scope-data',
          scopeId: 'addon-data',
        },
      }],
      failedScopeIds: [],
      results: [{
        featurePackIds: ['addon-pack'],
        scopeId: 'addon-data',
        status: 'succeeded',
      }],
      skippedScopeIds: [],
      status: 'succeeded',
      succeededScopeIds: ['addon-data'],
    })
    expect(cleanupExecutionResult.cleanupEffectPlan).toBe(cleanupPlan)

    const executionPlan =
      createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
        applyResult,
        cleanupHandlers: [{
          createEffect: ({ featurePackIds, scopeId }) => ({
            featurePackIds: [...featurePackIds],
            kind: 'remove-scope-data' as const,
            scopeId,
          }),
          scopeId: 'addon-data',
        }],
      })

    expect(executionPlan).toMatchObject({
      actionKind: 'uninstall',
      cleanupEffectPlan: {
        effects: [{
          effect: {
            featurePackIds: ['addon-pack'],
            kind: 'remove-scope-data',
            scopeId: 'addon-data',
          },
        }],
        status: 'ready',
      },
      nextAssemblyInput: applyResult.nextModel.assemblyInput,
      status: 'ready',
      updateMode: 'full-rebuild',
    })
    expect(executionPlan.applyResult).toBe(applyResult)
    expect(executionPlan.nextModel).toBe(applyResult.nextModel)

    const applyExecutionResult =
      await executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
        executeCleanupEffect: ({ effect, scopeId }) => ({
          applied: true as const,
          effectKind: effect.kind,
          scopeId,
        }),
        executionPlan,
      })

    expect(applyExecutionResult).toMatchObject({
      actionKind: 'uninstall',
      cleanupExecutionResult: {
        status: 'succeeded',
        succeededScopeIds: ['addon-data'],
      },
      nextAssemblyInput: applyResult.nextModel.assemblyInput,
      status: 'completed',
      updateMode: 'full-rebuild',
    })
    expect(applyExecutionResult.applyResult).toBe(applyResult)
    expect(applyExecutionResult.executionPlan).toBe(executionPlan)
    expect(applyExecutionResult.nextModel).toBe(applyResult.nextModel)

    expect(getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary({
      executionResult: applyExecutionResult,
    })).toMatchObject({
      actionKind: 'uninstall',
      blockedReasonCount: 0,
      changedFeaturePackIds: ['addon-pack'],
      cleanup: {
        effectCount: 1,
        failedScopeCount: 0,
        failedScopeIds: [],
        handledScopeCount: 1,
        handledScopeIds: ['addon-data'],
        missingHandlerScopeCount: 0,
        missingHandlerScopeIds: [],
        skippedScopeCount: 0,
        skippedScopeIds: [],
        status: 'succeeded',
        succeededScopeCount: 1,
        succeededScopeIds: ['addon-data'],
      },
      marketplaceBlockedReasonCount: 0,
      partialUpdateSurfaceIds: [],
      status: 'completed',
      totalBlockedReasonCount: 0,
      updateMode: 'full-rebuild',
    })
    const commitPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan({
        executionResult: applyExecutionResult,
      })

    expect(commitPlan).toMatchObject({
      actionKind: 'uninstall',
      canCommit: true,
      nextAssemblyInput: applyResult.nextModel.assemblyInput,
      status: 'ready-to-commit',
      summary: {
        status: 'completed',
      },
      updateMode: 'full-rebuild',
    })
    expect(commitPlan.executionResult).toBe(applyExecutionResult)

    if (!commitPlan.canCommit) {
      throw new Error('Expected ready commit plan')
    }

    expect(commitPlan.nextModel).toBe(applyResult.nextModel)
    const commitResult =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult({
        commitPlan,
      })

    expect(commitResult).toMatchObject({
      actionKind: 'uninstall',
      committed: true,
      nextAssemblyInput: applyResult.nextModel.assemblyInput,
      previousAssemblyInput: model.assemblyInput,
      status: 'committed',
      summary: {
        status: 'completed',
      },
      updateMode: 'full-rebuild',
    })
    expect(commitResult.commitPlan).toBe(commitPlan)
    expect(commitResult.previousModel).toBe(model)
    expect(commitResult.nextModel).toBe(applyResult.nextModel)

    const runtimeStatePatch =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch({
        commitResult,
      })

    expect(runtimeStatePatch).toMatchObject({
      actionKind: 'uninstall',
      currentFeaturePackStates: [{
        id: 'addon-pack',
        status: 'enabled',
      }],
      nextFeaturePackStates: [{
        id: 'addon-pack',
        status: 'uninstalled',
      }],
      patch: {
        changedFeaturePackIds: ['addon-pack'],
        featurePackStates: [{
          id: 'addon-pack',
          status: 'uninstalled',
        }],
        options: {
          featurePackStates: [{
            id: 'addon-pack',
            status: 'uninstalled',
          }],
        },
        stateChanges: [{
          from: {
            enabled: true,
            id: 'addon-pack',
            installed: true,
            status: 'enabled',
          },
          id: 'addon-pack',
          to: {
            enabled: false,
            id: 'addon-pack',
            installed: false,
            status: 'uninstalled',
          },
        }],
      },
      patched: true,
      status: 'patched',
      updateMode: 'full-rebuild',
    })
    expect(runtimeStatePatch.commitResult).toBe(commitResult)

    const transactionCleanupExecutions: string[] = []
    const transactionResult =
      await executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction({
        action: uninstallAction,
        cleanupHandlers: [{
          createEffect: ({ featurePackIds, scopeId }) => ({
            featurePackIds: [...featurePackIds],
            kind: 'remove-scope-data' as const,
            scopeId,
          }),
          scopeId: 'addon-data',
        }],
        executeCleanupEffect: ({ effect, scopeId }) => {
          transactionCleanupExecutions.push(scopeId)

          return {
            applied: true as const,
            effectKind: effect.kind,
            scopeId,
          }
        },
        model,
      })

    expect(transactionResult).toMatchObject({
      actionKind: 'uninstall',
      commitResult: {
        committed: true,
        status: 'committed',
      },
      runtimeStatePatch: {
        patch: {
          changedFeaturePackIds: ['addon-pack'],
        },
        patched: true,
        status: 'patched',
      },
      status: 'committed',
      summary: {
        status: 'completed',
      },
      updateMode: 'full-rebuild',
    })
    expect(transactionResult.action).toBe(uninstallAction)
    expect(transactionResult.model).toBe(model)
    expect(transactionResult.executionPlan.applyResult).toBe(
      transactionResult.applyResult,
    )
    expect(transactionResult.executionResult.executionPlan).toBe(
      transactionResult.executionPlan,
    )
    expect(transactionResult.commitPlan.executionResult).toBe(
      transactionResult.executionResult,
    )
    expect(transactionResult.commitResult.commitPlan).toBe(
      transactionResult.commitPlan,
    )
    expect(transactionResult.commitResult.committed).toBe(true)
    if (!transactionResult.commitResult.committed) {
      throw new Error('Expected committed transaction result')
    }

    if (!('nextModel' in transactionResult.applyResult)) {
      throw new Error('Expected ready transaction apply result')
    }

    expect(transactionResult.commitResult.nextModel).toBe(
      transactionResult.applyResult.nextModel,
    )
    expect(transactionCleanupExecutions).toEqual(['addon-data'])
    expect(transactionResult.runtimeStatePatch.commitResult)
      .toBe(transactionResult.commitResult)
    if (!transactionResult.runtimeStatePatch.patched) {
      throw new Error('Expected transaction runtime state patch')
    }
    expect(transactionResult.runtimeStatePatch.nextFeaturePackStates)
      .toEqual([{
        id: 'addon-pack',
        status: 'uninstalled',
      }])
    expect(getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch({
      commitResult: transactionResult.commitResult,
    })).toMatchObject({
      patched: true,
      status: 'patched',
    })

    const needsHandlerExecutionPlan =
      createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
        applyResult,
      })

    expect(needsHandlerExecutionPlan).toMatchObject({
      cleanupEffectPlan: {
        missingHandlerScopeIds: ['addon-data'],
        status: 'needs-handler',
      },
      status: 'needs-cleanup-handler',
    })

    const needsHandlerApplyExecutionResult =
      await executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
        executeCleanupEffect: ({ effect, scopeId }) => ({
          applied: true as const,
          effectKind: effect.kind,
          scopeId,
        }),
        executionPlan: needsHandlerExecutionPlan,
      })

    expect(needsHandlerApplyExecutionResult).toMatchObject({
      cleanupExecutionResult: {
        skippedScopeIds: ['addon-data'],
        status: 'needs-handler',
      },
      status: 'needs-cleanup-handler',
    })
    expect(getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary({
      executionResult: needsHandlerApplyExecutionResult,
    })).toMatchObject({
      cleanup: {
        effectCount: 0,
        missingHandlerScopeCount: 1,
        missingHandlerScopeIds: ['addon-data'],
        skippedScopeCount: 1,
        skippedScopeIds: ['addon-data'],
        status: 'needs-handler',
      },
      status: 'needs-cleanup-handler',
    })
    const needsHandlerCommitPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan({
        executionResult: needsHandlerApplyExecutionResult,
      })

    expect(needsHandlerCommitPlan).toMatchObject({
      canCommit: false,
      status: 'needs-cleanup-handler',
      summary: {
        cleanup: {
          missingHandlerScopeIds: ['addon-data'],
        },
        status: 'needs-cleanup-handler',
      },
    })
    expect('nextModel' in needsHandlerCommitPlan).toBe(false)
    const needsHandlerCommitResult =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult({
        commitPlan: needsHandlerCommitPlan,
      })

    expect(needsHandlerCommitResult).toMatchObject({
      actionKind: 'uninstall',
      committed: false,
      currentAssemblyInput: model.assemblyInput,
      holdReason: 'needs-cleanup-handler',
      status: 'held',
      summary: {
        status: 'needs-cleanup-handler',
      },
      updateMode: 'full-rebuild',
    })
    expect(needsHandlerCommitResult.commitPlan).toBe(needsHandlerCommitPlan)
    expect(needsHandlerCommitResult.currentModel).toBe(model)
    expect('nextModel' in needsHandlerCommitResult).toBe(false)
    expect('nextAssemblyInput' in needsHandlerCommitResult).toBe(false)
    const needsHandlerRuntimeStatePatch =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch({
        commitResult: needsHandlerCommitResult,
      })

    expect(needsHandlerRuntimeStatePatch).toMatchObject({
      actionKind: 'uninstall',
      currentFeaturePackStates: [{
        id: 'addon-pack',
        status: 'enabled',
      }],
      holdReason: 'needs-cleanup-handler',
      patch: null,
      patched: false,
      status: 'held',
      updateMode: 'full-rebuild',
    })
    expect(needsHandlerRuntimeStatePatch.commitResult)
      .toBe(needsHandlerCommitResult)
    expect('nextFeaturePackStates' in needsHandlerRuntimeStatePatch)
      .toBe(false)

    let needsHandlerCleanupExecuted = false
    const needsHandlerTransactionResult =
      await executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction({
        action: uninstallAction,
        executeCleanupEffect: () => {
          needsHandlerCleanupExecuted = true

          return {
            applied: true as const,
            effectKind: 'remove-scope-data' as const,
            scopeId: 'addon-data',
          }
        },
        model,
      })

    expect(needsHandlerTransactionResult).toMatchObject({
      actionKind: 'uninstall',
      commitResult: {
        committed: false,
        holdReason: 'needs-cleanup-handler',
        status: 'held',
      },
      executionPlan: {
        status: 'needs-cleanup-handler',
      },
      executionResult: {
        status: 'needs-cleanup-handler',
      },
      runtimeStatePatch: {
        holdReason: 'needs-cleanup-handler',
        patch: null,
        patched: false,
        status: 'held',
      },
      status: 'held',
      summary: {
        status: 'needs-cleanup-handler',
      },
    })
    expect(needsHandlerCleanupExecuted).toBe(false)
    expect(needsHandlerTransactionResult.commitResult.commitPlan).toBe(
      needsHandlerTransactionResult.commitPlan,
    )
    expect(needsHandlerTransactionResult.runtimeStatePatch.commitResult)
      .toBe(needsHandlerTransactionResult.commitResult)
    expect(
      'nextFeaturePackStates' in
        needsHandlerTransactionResult.runtimeStatePatch,
    ).toBe(false)
    expect('nextModel' in needsHandlerTransactionResult.commitResult).toBe(
      false,
    )

    const cleanupError = new Error('cleanup failed')
    const failedApplyExecutionResult =
      await executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
        executeCleanupEffect: () => {
          throw cleanupError
        },
        executionPlan,
      })

    expect(failedApplyExecutionResult).toMatchObject({
      cleanupExecutionResult: {
        failedScopeIds: ['addon-data'],
        status: 'failed',
      },
      status: 'cleanup-failed',
    })
    expect(failedApplyExecutionResult.cleanupExecutionResult.failedResults[0]
      ?.error).toBe(cleanupError)
    expect(getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary({
      executionResult: failedApplyExecutionResult,
    })).toMatchObject({
      cleanup: {
        failedScopeCount: 1,
        failedScopeIds: ['addon-data'],
        status: 'failed',
      },
      status: 'cleanup-failed',
    })
    const failedCommitPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan({
        executionResult: failedApplyExecutionResult,
      })

    expect(failedCommitPlan).toMatchObject({
      canCommit: false,
      status: 'cleanup-failed',
      summary: {
        cleanup: {
          failedScopeIds: ['addon-data'],
        },
        status: 'cleanup-failed',
      },
    })
    expect('nextAssemblyInput' in failedCommitPlan).toBe(false)
    const failedCommitResult =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult({
        commitPlan: failedCommitPlan,
      })

    expect(failedCommitResult).toMatchObject({
      committed: false,
      holdReason: 'cleanup-failed',
      status: 'held',
      summary: {
        status: 'cleanup-failed',
      },
      updateMode: 'full-rebuild',
    })
    expect(failedCommitResult.commitPlan).toBe(failedCommitPlan)
    expect(failedCommitResult.currentModel).toBe(model)
    expect('nextModel' in failedCommitResult).toBe(false)
  })

  it('keeps non-remove uninstall data out of cleanup effects', async () => {
    const cleanupPlan =
      createCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
        handlers: [{
          createEffect: ({ featurePackIds, scopeId }) => ({
            featurePackIds: [...featurePackIds],
            kind: 'remove-scope-data' as const,
            scopeId,
          }),
          scopeId: 'remove-data',
        }],
        uninstallDataPlan: {
          entries: [
            {
              featurePackId: 'remove-pack',
              orphanedDataPolicy: 'remove',
              orphanedDataScopeIds: ['remove-data'],
            },
            {
              featurePackId: 'missing-pack',
              orphanedDataPolicy: 'remove',
              orphanedDataScopeIds: ['missing-data'],
            },
            {
              featurePackId: 'preserve-pack',
              orphanedDataPolicy: 'preserve',
              orphanedDataScopeIds: ['preserve-data'],
            },
            {
              featurePackId: 'host-pack',
              orphanedDataPolicy: 'host-managed',
              orphanedDataScopeIds: ['host-data'],
            },
            {
              featurePackId: 'unscoped-pack',
              orphanedDataPolicy: 'remove',
              orphanedDataScopeIds: [],
            },
          ],
          hostManagedFeaturePackIds: ['host-pack'],
          hostManagedScopeIds: ['host-data'],
          preserveFeaturePackIds: ['preserve-pack'],
          preserveScopeIds: ['preserve-data'],
          removeFeaturePackIds: [
            'remove-pack',
            'missing-pack',
            'unscoped-pack',
          ],
          removeScopeIds: ['remove-data', 'missing-data'],
          unscopedFeaturePackIds: ['unscoped-pack'],
        },
      })

    expect(cleanupPlan).toMatchObject({
      effects: [{
        effect: {
          featurePackIds: ['remove-pack'],
          kind: 'remove-scope-data',
          scopeId: 'remove-data',
        },
        featurePackIds: ['remove-pack'],
        scopeId: 'remove-data',
      }],
      handledScopeIds: ['remove-data'],
      hostManagedFeaturePackIds: ['host-pack'],
      hostManagedScopeIds: ['host-data'],
      missingHandlerScopeIds: ['missing-data'],
      preserveFeaturePackIds: ['preserve-pack'],
      preserveScopeIds: ['preserve-data'],
      removeFeaturePackIds: [
        'remove-pack',
        'missing-pack',
        'unscoped-pack',
      ],
      removeScopeIds: ['remove-data', 'missing-data'],
      status: 'needs-handler',
      unscopedFeaturePackIds: ['unscoped-pack'],
    })
    expect(cleanupPlan.effects.map((effect) => effect.scopeId))
      .toEqual(['remove-data'])

    const cleanupExecutionResult =
      await executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
        cleanupEffectPlan: cleanupPlan,
        executeEffect: ({ effect, scopeId }) => ({
          effectKind: effect.kind,
          scopeId,
        }),
      })

    expect(cleanupExecutionResult).toMatchObject({
      failedScopeIds: [],
      skippedResults: [{
        featurePackIds: ['missing-pack'],
        reason: 'missing-handler',
        scopeId: 'missing-data',
        status: 'skipped',
      }],
      skippedScopeIds: ['missing-data'],
      status: 'needs-handler',
      succeededResults: [{
        featurePackIds: ['remove-pack'],
        scopeId: 'remove-data',
        status: 'succeeded',
        value: {
          effectKind: 'remove-scope-data',
          scopeId: 'remove-data',
        },
      }],
      succeededScopeIds: ['remove-data'],
    })

    const cleanupError = new Error('cleanup failed')
    const failedCleanupExecutionResult =
      await executeCanvasAppFeaturePackMarketplaceUninstallCleanupEffectPlan({
        cleanupEffectPlan: cleanupPlan,
        executeEffect: () => {
          throw cleanupError
        },
      })

    expect(failedCleanupExecutionResult).toMatchObject({
      failedScopeIds: ['remove-data'],
      skippedScopeIds: ['missing-data'],
      status: 'failed',
      succeededScopeIds: [],
    })
    expect(failedCleanupExecutionResult.failedResults[0]?.error)
      .toBe(cleanupError)
  })

  it('keeps unscoped uninstall packs visible in the data plan', () => {
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      lifecycle: {
        orphanedDataPolicy: 'preserve',
      },
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [addonManifest],
      },
      profiles: [],
      suiteManifests: [],
    })
    const addonItem = model.marketplaceModel.packs.items[0]

    if (!addonItem) {
      throw new Error('Expected addon pack item')
    }

    const uninstallAction = addonItem.actions.find((action) =>
      action.kind === 'uninstall',
    )

    if (!uninstallAction) {
      throw new Error('Expected uninstall action')
    }

    const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan({
      action: uninstallAction,
      model,
    })

    expect(applyPlan).toMatchObject({
      actionKind: 'uninstall',
      status: 'ready',
      uninstallDataPlan: {
        entries: [{
          featurePackId: 'addon-pack',
          orphanedDataScopeIds: [],
          orphanedDataPolicy: 'preserve',
        }],
        preserveFeaturePackIds: ['addon-pack'],
        preserveScopeIds: [],
        removeFeaturePackIds: [],
        removeScopeIds: [],
        unscopedFeaturePackIds: ['addon-pack'],
      },
    })
  })

  it('applies suite marketplace actions from the assembly model', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
    })
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: ['runtime-pack', 'addon-pack'],
      id: 'addon-suite',
      label: 'Addon suite',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [runtimeManifest, addonManifest],
        featurePackStates: [
          {
            id: 'runtime-pack',
            status: 'uninstalled',
          },
          {
            id: 'addon-pack',
            status: 'uninstalled',
          },
        ],
      },
      profiles: [],
      suiteManifests: [suiteManifest],
    })
    const suiteItem = model.marketplaceModel.suites.items[0]

    if (!suiteItem) {
      throw new Error('Expected suite item')
    }

    const primaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(suiteItem)
    const assemblyInput = getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
      action: primaryAction,
      model,
    })
    const assembly = createCanvasAppAssembly(assemblyInput)

    expect(primaryAction.kind).toBe('install')
    expect(primaryAction.ready).toBe(true)
    expect(assemblyInput.featurePackStates).toEqual([
      {
        id: 'runtime-pack',
        status: 'disabled',
      },
      {
        id: 'addon-pack',
        status: 'disabled',
      },
    ])
    expect(assembly.installedFeaturePackIds).toEqual([
      'runtime-pack',
      'addon-pack',
    ])
    expect(assembly.enabledFeaturePackIds).toEqual([])
  })

  it('keeps uninstall data policy on blocked apply plans', async () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        orphanedDataScopeIds: ['runtime-data'],
        orphanedDataPolicy: 'host-managed',
      },
      provides: ['runtime-capability'],
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      requires: ['runtime-capability'],
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
      throw new Error('Expected runtime pack item')
    }

    const uninstallAction = runtimeItem.actions.find((action) =>
      action.kind === 'uninstall',
    )

    if (!uninstallAction) {
      throw new Error('Expected uninstall action')
    }

    const actionPlan = getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
      action: uninstallAction,
      model,
    })
    const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan({
      action: uninstallAction,
      model,
    })
    const applyResult = getCanvasAppFeaturePackMarketplaceAssemblyApplyResult({
      action: uninstallAction,
      model,
    })
    const policyEntries = [{
      featurePackId: 'runtime-pack',
      orphanedDataScopeIds: ['runtime-data'],
      orphanedDataPolicy: 'host-managed',
    }]

    expect(uninstallAction.ready).toBe(false)
    expect(uninstallAction.blockedReasons).toContainEqual({
      dependentFeaturePackId: 'addon-pack',
      featurePackId: 'runtime-pack',
      kind: 'required-by-installed-pack',
      requiredId: 'runtime-capability',
    })
    expect(actionPlan).toMatchObject({
      actionKind: 'uninstall',
      status: 'blocked',
      uninstallDataPlan: {
        hostManagedFeaturePackIds: ['runtime-pack'],
        hostManagedScopeIds: ['runtime-data'],
        preserveFeaturePackIds: [],
        preserveScopeIds: [],
        removeFeaturePackIds: [],
        removeScopeIds: [],
        unscopedFeaturePackIds: [],
      },
      uninstallPolicyEntries: policyEntries,
    })
    expect(applyPlan).toMatchObject({
      actionKind: 'uninstall',
      status: 'blocked',
      uninstallDataPlan: {
        hostManagedFeaturePackIds: ['runtime-pack'],
        hostManagedScopeIds: ['runtime-data'],
        unscopedFeaturePackIds: [],
      },
      uninstallPolicyEntries: policyEntries,
      updateMode: 'blocked',
    })
    expect(applyResult).toMatchObject({
      actionKind: 'uninstall',
      currentModel: model,
      status: 'blocked',
      uninstallDataPlan: {
        hostManagedFeaturePackIds: ['runtime-pack'],
        hostManagedScopeIds: ['runtime-data'],
        unscopedFeaturePackIds: [],
      },
      uninstallPolicyEntries: policyEntries,
      updateMode: 'blocked',
    })
    expect('assemblyInput' in actionPlan).toBe(false)
    expect('assemblyInput' in applyPlan).toBe(false)
    expect('nextModel' in applyResult).toBe(false)

    const executionPlan =
      createCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
        applyResult,
        cleanupHandlers: [{
          createEffect: ({ scopeId }) => ({
            kind: 'remove-scope-data' as const,
            scopeId,
          }),
          scopeId: 'runtime-data',
        }],
      })

    expect(executionPlan).toMatchObject({
      actionKind: 'uninstall',
      blockedReasonCount: 1,
      currentModel: model,
      marketplaceBlockedReasonCount: 0,
      status: 'blocked',
      totalBlockedReasonCount: 1,
      updateMode: 'blocked',
    })
    expect(executionPlan.applyResult).toBe(applyResult)
    expect('cleanupEffectPlan' in executionPlan).toBe(false)

    let cleanupExecuted = false
    const applyExecutionResult =
      await executeCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionPlan({
        executeCleanupEffect: () => {
          cleanupExecuted = true
          return {
            kind: 'remove-scope-data' as const,
            scopeId: 'runtime-data',
          }
        },
        executionPlan,
      })

    expect(applyExecutionResult).toMatchObject({
      actionKind: 'uninstall',
      blockedReasonCount: 1,
      currentModel: model,
      marketplaceBlockedReasonCount: 0,
      status: 'blocked',
      totalBlockedReasonCount: 1,
      updateMode: 'blocked',
    })
    expect(applyExecutionResult.applyResult).toBe(applyResult)
    expect(applyExecutionResult.executionPlan).toBe(executionPlan)
    expect(cleanupExecuted).toBe(false)
    expect(getCanvasAppFeaturePackMarketplaceAssemblyApplyExecutionSummary({
      executionResult: applyExecutionResult,
    })).toMatchObject({
      actionKind: 'uninstall',
      blockedReasonCount: 1,
      changedFeaturePackIds: ['runtime-pack'],
      cleanup: {
        effectCount: 0,
        failedScopeCount: 0,
        handledScopeCount: 0,
        missingHandlerScopeCount: 0,
        skippedScopeCount: 0,
        status: 'not-run',
        succeededScopeCount: 0,
      },
      marketplaceBlockedReasonCount: 0,
      status: 'blocked',
      totalBlockedReasonCount: 1,
      updateMode: 'blocked',
    })
    const commitPlan =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitPlan({
        executionResult: applyExecutionResult,
      })

    expect(commitPlan).toMatchObject({
      actionKind: 'uninstall',
      canCommit: false,
      status: 'blocked',
      summary: {
        cleanup: {
          status: 'not-run',
        },
        status: 'blocked',
      },
      updateMode: 'blocked',
    })
    expect(commitPlan.executionResult).toBe(applyExecutionResult)
    expect('nextModel' in commitPlan).toBe(false)
    const commitResult =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyCommitResult({
        commitPlan,
      })

    expect(commitResult).toMatchObject({
      actionKind: 'uninstall',
      committed: false,
      currentAssemblyInput: model.assemblyInput,
      holdReason: 'blocked',
      status: 'held',
      summary: {
        cleanup: {
          status: 'not-run',
        },
        status: 'blocked',
      },
      updateMode: 'blocked',
    })
    expect(commitResult.commitPlan).toBe(commitPlan)
    expect(commitResult.currentModel).toBe(model)
    expect('nextAssemblyInput' in commitResult).toBe(false)
    const runtimeStatePatch =
      getCanvasAppFeaturePackMarketplaceAssemblyApplyRuntimeStatePatch({
        commitResult,
      })

    expect(runtimeStatePatch).toMatchObject({
      actionKind: 'uninstall',
      currentFeaturePackStates: [{
        id: 'runtime-pack',
        status: 'enabled',
      }, {
        id: 'addon-pack',
        status: 'enabled',
      }],
      holdReason: 'blocked',
      patch: null,
      patched: false,
      status: 'held',
      updateMode: 'blocked',
    })
    expect(runtimeStatePatch.commitResult).toBe(commitResult)
    expect('nextFeaturePackStates' in runtimeStatePatch).toBe(false)

    let transactionCleanupExecuted = false
    const blockedTransactionResult =
      await executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction({
        action: uninstallAction,
        cleanupHandlers: [{
          createEffect: ({ scopeId }) => ({
            kind: 'remove-scope-data' as const,
            scopeId,
          }),
          scopeId: 'runtime-data',
        }],
        executeCleanupEffect: () => {
          transactionCleanupExecuted = true

          return {
            kind: 'remove-scope-data' as const,
            scopeId: 'runtime-data',
          }
        },
        model,
      })

    expect(blockedTransactionResult).toMatchObject({
      actionKind: 'uninstall',
      commitResult: {
        committed: false,
        holdReason: 'blocked',
        status: 'held',
      },
      executionPlan: {
        status: 'blocked',
      },
      executionResult: {
        status: 'blocked',
      },
      runtimeStatePatch: {
        holdReason: 'blocked',
        patch: null,
        patched: false,
        status: 'held',
      },
      status: 'held',
      summary: {
        cleanup: {
          status: 'not-run',
        },
        status: 'blocked',
      },
      updateMode: 'blocked',
    })
    expect(blockedTransactionResult.action).toBe(uninstallAction)
    expect(blockedTransactionResult.model).toBe(model)
    expect(transactionCleanupExecuted).toBe(false)
    expect(blockedTransactionResult.commitResult.commitPlan).toBe(
      blockedTransactionResult.commitPlan,
    )
    expect(blockedTransactionResult.runtimeStatePatch.commitResult)
      .toBe(blockedTransactionResult.commitResult)
    expect(
      'nextFeaturePackStates' in blockedTransactionResult.runtimeStatePatch,
    ).toBe(false)
    expect('nextModel' in blockedTransactionResult.commitResult).toBe(false)
  })

  it('keeps blocked marketplace actions from changing assembly input', () => {
    const paidManifest = createCanvasAppFeaturePackManifest({
      id: 'paid-pack',
      label: 'Paid pack',
    })
    const model = getCanvasAppFeaturePackMarketplaceAssemblyModel({
      assemblyInput: {
        featurePackManifests: [paidManifest],
        featurePackStates: [{
          id: 'paid-pack',
          status: 'uninstalled',
        }],
      },
      listings: [{
        access: 'private',
        distribution: 'available',
        featurePackId: 'paid-pack',
      }],
      profiles: [],
      suiteManifests: [],
    })
    const paidPackItem = model.marketplaceModel.packs.items[0]

    if (!paidPackItem) {
      throw new Error('Expected paid pack item')
    }

    const primaryAction =
      getCanvasAppFeaturePackMarketplacePrimaryAction(paidPackItem)
    const actionPlan = getCanvasAppFeaturePackMarketplaceAssemblyActionPlan({
      action: primaryAction,
      model,
    })
    const applyPlan = getCanvasAppFeaturePackMarketplaceAssemblyApplyPlan({
      action: primaryAction,
      model,
    })
    const applyResult = getCanvasAppFeaturePackMarketplaceAssemblyApplyResult({
      action: primaryAction,
      model,
    })

    expect(primaryAction.kind).toBe('install')
    expect(primaryAction.ready).toBe(false)
    expect(actionPlan).toMatchObject({
      marketplaceBlockedReasonCount: 1,
      status: 'blocked',
      totalBlockedReasonCount: 1,
    })
    expect(applyPlan).toMatchObject({
      marketplaceBlockedReasonCount: 1,
      status: 'blocked',
      totalBlockedReasonCount: 1,
      updateMode: 'blocked',
    })
    expect(applyResult).toMatchObject({
      currentModel: model,
      marketplaceBlockedReasonCount: 1,
      status: 'blocked',
      totalBlockedReasonCount: 1,
      updateMode: 'blocked',
    })
    expect('assemblyInput' in actionPlan).toBe(false)
    expect('assemblyInput' in applyPlan).toBe(false)
    expect('nextModel' in applyResult).toBe(false)
    expect(() =>
      getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
        action: primaryAction,
        model,
      })
    ).toThrow('Canvas app feature pack marketplace action is not ready: install')
  })
})
