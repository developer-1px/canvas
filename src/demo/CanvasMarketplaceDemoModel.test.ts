import { describe, expect, it } from 'vitest'
import {
  createCanvasAppAssembly,
} from '../canvas'
import {
  applyCanvasMarketplaceDemoOperation,
  createCanvasMarketplaceDemoModel,
  createCanvasMarketplaceDemoSource,
  findCanvasMarketplaceDemoItem,
} from './CanvasMarketplaceDemoModel'

describe('CanvasMarketplaceDemoModel', () => {
  it('uses the existing CanvasApp feature pack marketplace', () => {
    const model = createCanvasMarketplaceDemoModel()
    const packIds = model.marketplaceModel.packs.items.map((item) =>
      item.featurePackId
    )
    const profileIds = model.marketplaceModel.profiles.items.map((item) =>
      item.profileId
    )
    const suiteIds = model.marketplaceModel.suites.items.map((item) =>
      item.suiteId
    )

    expect(packIds).toContain('component-library')
    expect(packIds).toContain('component-source-outline')
    expect(packIds).toContain('story-import')
    expect(packIds).not.toContain('component-runtime')
    expect(profileIds).toContain('minimal-viewer')
    expect(profileIds).toContain('component-editor')
    expect(suiteIds).toContain('component-system')
    expect(suiteIds).toContain('story-canvas')
  })

  it('starts from the minimal viewer profile as a real assembly source', () => {
    const model = createCanvasMarketplaceDemoModel()

    expect(model.runtimeStates).toContainEqual({
      id: 'zoom-controls',
      status: 'enabled',
    })
    expect(model.assemblyInput.featurePackProfileId).toBeUndefined()
    expect(createCanvasAppAssembly(model.assemblyInput).enabledFeaturePackIds)
      .toContain('zoom-controls')
  })

  it('installs and enables an existing feature pack through assembly transactions', async () => {
    const source = createCanvasMarketplaceDemoSource()
    const installResult = await applyCanvasMarketplaceDemoOperation({
      actionKind: 'install',
      itemId: 'pack:component-source-outline',
      source,
    })

    expect(installResult).toMatchObject({
      applied: true,
      status: 'applied',
    })
    expect(installResult.action?.changedFeaturePackIds).toContain(
      'component-source-outline',
    )

    const installedModel = createCanvasMarketplaceDemoModel(installResult.source)
    const installedItem = findCanvasMarketplaceDemoItem({
      itemId: 'pack:component-source-outline',
      sections: installedModel.sections,
    })

    expect(installedItem?.packageState.installed).toBe(true)
    expect(installedItem?.packageState.enabled).toBe(false)

    const enableResult = await applyCanvasMarketplaceDemoOperation({
      actionKind: 'enable',
      itemId: 'pack:component-source-outline',
      source: installResult.source,
    })
    const enabledAssembly = createCanvasAppAssembly(
      createCanvasMarketplaceDemoModel(enableResult.source).assemblyInput,
    )

    expect(enableResult).toMatchObject({
      applied: true,
      status: 'applied',
    })
    expect(enabledAssembly.enabledFeaturePackIds).toContain(
      'component-source-outline',
    )
  })

  it('applies existing suite and profile targets', async () => {
    const source = createCanvasMarketplaceDemoSource()
    const suiteResult = await applyCanvasMarketplaceDemoOperation({
      actionKind: 'install',
      itemId: 'suite:component-system',
      source,
    })

    expect(suiteResult).toMatchObject({
      applied: true,
      status: 'applied',
    })
    expect(suiteResult.action?.changedFeaturePackIds).toContain(
      'component-library',
    )

    const profileResult = await applyCanvasMarketplaceDemoOperation({
      actionKind: 'apply',
      itemId: 'profile:component-editor',
      source: suiteResult.source,
    })

    expect(profileResult).toMatchObject({
      applied: true,
      status: 'applied',
    })
    expect(profileResult.action?.changedFeaturePackIds).toContain(
      'component-source-outline',
    )
  })
})
