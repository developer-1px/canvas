import { describe, expect, it } from 'vitest'
import {
  createCanvasAppFeaturePackManifest,
  createCanvasAppFeaturePackProfile,
  createCanvasAppFeaturePackSuiteManifest,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
} from '../feature-packs'
import { createCanvasAppAssembly } from './CanvasAppAssembly'
import {
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

    expect(primaryAction.kind).toBe('install')
    expect(primaryAction.ready).toBe(false)
    expect(actionPlan).toMatchObject({
      marketplaceBlockedReasonCount: 1,
      status: 'blocked',
      totalBlockedReasonCount: 1,
    })
    expect('assemblyInput' in actionPlan).toBe(false)
    expect(() =>
      getCanvasAppFeaturePackMarketplaceAssemblyActionInput({
        action: primaryAction,
        model,
      })
    ).toThrow('Canvas app feature pack marketplace action is not ready: install')
  })
})
