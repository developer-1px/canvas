import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  CanvasMarketplacePanel,
  createCanvasMarketplaceFeaturePackManifest,
  createCanvasMarketplaceFeaturePackProfile,
  createCanvasMarketplaceFeaturePackSuiteManifest,
  getCanvasMarketplaceModel,
} from './index'

describe('CanvasMarketplacePanel', () => {
  it('renders a reusable VS Code style marketplace surface with stack history', () => {
    const runtimePack = createCanvasMarketplaceFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        runtimeToggleable: true,
      },
    })
    const addonPack = createCanvasMarketplaceFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
      lifecycle: {
        partialUpdate: ['inspector'],
        runtimeToggleable: true,
      },
      package: {
        name: '@example/canvas-addon-pack',
      },
      requires: ['runtime-pack'],
    })
    const suite = createCanvasMarketplaceFeaturePackSuiteManifest({
      featurePackIds: ['runtime-pack', 'addon-pack'],
      id: 'addon-suite',
      label: 'Addon suite',
    })
    const profile = createCanvasMarketplaceFeaturePackProfile({
      enabledSuiteIds: ['addon-suite'],
      id: 'addon-profile',
      installedSuiteIds: ['addon-suite'],
      label: 'Addon profile',
      suiteManifests: [suite],
    })
    const model = getCanvasMarketplaceModel({
      manifests: [runtimePack, addonPack],
      options: {
        featurePackStates: [
          {
            id: 'runtime-pack',
            status: 'enabled',
          },
          {
            id: 'addon-pack',
            status: 'disabled',
          },
        ],
      },
      profiles: [profile],
      suiteManifests: [suite],
    })
    const markup = renderToStaticMarkup(
      <CanvasMarketplacePanel
        baselineLabel="Core"
        model={model}
        onApplyAction={vi.fn()}
        runtimeStates={[
          {
            id: 'runtime-pack',
            status: 'enabled',
          },
          {
            id: 'addon-pack',
            status: 'disabled',
          },
        ]}
        transactions={[{
          actionKind: 'enable',
          changedFeaturePackIds: ['addon-pack'],
          id: '1',
          itemId: 'pack:addon-pack',
          status: 'applied',
        }]}
      />,
    )

    expect(markup).toContain('canvas-marketplace-panel')
    expect(markup).toContain('Profiles')
    expect(markup).toContain('Addon profile')
    expect(markup).toContain('Current stack')
    expect(markup).toContain('Core')
    expect(markup).toContain('runtime-pack')
    expect(markup).toContain('addon-pack')
    expect(markup).toContain('History')
    expect(markup).toContain('pack:addon-pack')
  })
})
