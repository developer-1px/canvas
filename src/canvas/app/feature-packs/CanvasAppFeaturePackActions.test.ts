import { describe, expect, it } from 'vitest'
import {
  getCanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActions'
import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'

describe('CanvasAppFeaturePackActions', () => {
  it('describes actions for an enabled runtime-toggleable pack', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'overlay-pack',
      label: 'Overlay pack',
      lifecycle: {
        partialUpdate: ['overlay'],
        runtimeToggleable: true,
      },
    })

    const item = getCanvasAppFeaturePackMarketplaceActionModel({
      manifests: [manifest],
    }).items[0]

    expect(item).toMatchObject({
      enabled: true,
      featurePackId: 'overlay-pack',
      installed: true,
      listing: {
        access: 'free',
        distribution: 'available',
        featurePackId: 'overlay-pack',
      },
      primaryActionKind: 'disable',
      status: 'enabled',
    })
    expect(item?.actions.map((action) => ({
      applicable: action.applicable,
      changedFeaturePackIds: action.changedFeaturePackIds,
      kind: action.kind,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      ready: action.ready,
      status: action.status,
    }))).toEqual([
      {
        applicable: false,
        changedFeaturePackIds: [],
        kind: 'install',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
      },
      {
        applicable: false,
        changedFeaturePackIds: [],
        kind: 'enable',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
      },
      {
        applicable: true,
        changedFeaturePackIds: ['overlay-pack'],
        kind: 'disable',
        partialUpdateSurfaceIds: ['overlay'],
        ready: true,
        status: 'ready',
      },
      {
        applicable: true,
        changedFeaturePackIds: ['overlay-pack'],
        kind: 'uninstall',
        partialUpdateSurfaceIds: [],
        ready: true,
        status: 'ready',
      },
    ])
  })

  it('describes install and enable actions for an uninstalled pack', () => {
    const manifest = createCanvasAppFeaturePackManifest({
      id: 'command-pack',
      label: 'Command pack',
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })

    const item = getCanvasAppFeaturePackMarketplaceActionModel({
      listings: [{
        access: 'paid',
        distribution: 'available',
        featurePackId: 'command-pack',
        priceLabel: '$9/mo',
        vendor: 'Interactive OS',
      }],
      manifests: [manifest],
      options: {
        featurePackStates: [{
          id: 'command-pack',
          status: 'uninstalled',
        }],
      },
    }).items[0]

    expect(item).toMatchObject({
      enabled: false,
      installed: false,
      listing: {
        access: 'paid',
        distribution: 'available',
        featurePackId: 'command-pack',
        priceLabel: '$9/mo',
        vendor: 'Interactive OS',
      },
      primaryActionKind: 'install',
      status: 'uninstalled',
    })
    expect(item?.actions.map((action) => ({
      applicable: action.applicable,
      changedFeaturePackIds: action.changedFeaturePackIds,
      featurePackStates: action.featurePackStates,
      kind: action.kind,
      partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
      ready: action.ready,
      status: action.status,
    }))).toEqual([
      {
        applicable: true,
        changedFeaturePackIds: ['command-pack'],
        featurePackStates: [{
          id: 'command-pack',
          status: 'disabled',
        }],
        kind: 'install',
        partialUpdateSurfaceIds: [],
        ready: true,
        status: 'ready',
      },
      {
        applicable: true,
        changedFeaturePackIds: ['command-pack'],
        featurePackStates: [{
          id: 'command-pack',
          status: 'enabled',
        }],
        kind: 'enable',
        partialUpdateSurfaceIds: ['command'],
        ready: true,
        status: 'ready',
      },
      {
        applicable: false,
        changedFeaturePackIds: [],
        featurePackStates: [{
          id: 'command-pack',
          status: 'uninstalled',
        }],
        kind: 'disable',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
      },
      {
        applicable: false,
        changedFeaturePackIds: [],
        featurePackStates: [{
          id: 'command-pack',
          status: 'uninstalled',
        }],
        kind: 'uninstall',
        partialUpdateSurfaceIds: [],
        ready: false,
        status: 'blocked',
      },
    ])
    expect(item?.actions.find((action) => action.kind === 'enable')
      ?.installOptions).toEqual({
      featurePackStates: [{
        id: 'command-pack',
        status: 'enabled',
      }],
    })
  })

  it('keeps catalog and transition blockers available per action', () => {
    const providerManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        partialUpdate: ['runtime-model'],
        runtimeToggleable: true,
      },
      provides: ['runtime-capability'],
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      requires: ['runtime-capability'],
    })

    const model = getCanvasAppFeaturePackMarketplaceActionModel({
      manifests: [
        providerManifest,
        addonManifest,
      ],
      options: {
        featurePackStates: [{
          id: 'runtime-pack',
          status: 'disabled',
        }],
      },
    })
    const providerItem = model.items.find((item) =>
      item.featurePackId === 'runtime-pack',
    )
    const addonItem = model.items.find((item) =>
      item.featurePackId === 'addon-pack',
    )

    expect(addonItem?.catalogBlockedReasons).toEqual([{
      featurePackId: 'addon-pack',
      kind: 'disabled-required-pack',
      requiredId: 'runtime-capability',
      scope: 'enabled',
    }])
    expect(providerItem?.primaryActionKind).toBe('enable')
    expect(providerItem?.actions.find((action) => action.kind === 'uninstall')
      ?.blockedReasons).toEqual([{
      dependentFeaturePackId: 'addon-pack',
      featurePackId: 'runtime-pack',
      kind: 'required-by-installed-pack',
      requiredId: 'runtime-capability',
    }])
  })
})
