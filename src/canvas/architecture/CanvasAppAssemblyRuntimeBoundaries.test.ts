import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App Assembly runtime boundaries', () => {
  it('keeps App Assembly snapshot behavior behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const snapshotFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblySnapshot.ts',
    )
    const adapterSnapshotFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAdapterSnapshot.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppAssemblySnapshot'",
    )
    expect(assemblyFile.source).not.toContain('structuredClone')
    expect(assemblyFile.source).not.toContain('deepFreezeCanvasAppValue')
    expect(assemblyFile.source).not.toContain('snapshotCanvasAppRecord')
    expect(assemblyFile.source).not.toContain('snapshotCanvasAppArray')
    expect(snapshotFile.source).toContain('structuredClone')
    expect(snapshotFile.source).toContain('deepFreezeCanvasAppValue')
    expect(snapshotFile.source).toContain(
      "from '../extensions/CanvasAppDescriptorSnapshot'",
    )
    expect(snapshotFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(snapshotFile.source).toContain('snapshotCanvasAppExtensionBundle')
    expect(snapshotFile.source).toContain('snapshotCanvasAppRecord')
    expect(snapshotFile.source).toContain('snapshotCanvasAppArray')
    expect(snapshotFile.source).not.toContain(
      'customCommands: snapshotCanvasAppDescriptorArray',
    )
    expect(snapshotFile.source).not.toContain(
      'customCreationTools: snapshotCanvasAppShortcutDescriptorArray',
    )
    expect(snapshotFile.source).not.toContain(
      'inspectorPanels: snapshotCanvasAppDescriptorArray',
    )
    expect(snapshotFile.source).toContain(
      "from './CanvasAppAdapterSnapshot'",
    )
    expect(snapshotFile.source).not.toContain(
      'function snapshotCanvasAppItemAdapters',
    )
    expect(snapshotFile.source).not.toContain(
      'itemLayerAdapter: Object.freeze',
    )
    expect(snapshotFile.source).not.toContain(
      'stageAdapter: Object.freeze',
    )
    expect(adapterSnapshotFile.source).toContain(
      'export function snapshotCanvasAppAssemblyAdapters',
    )
    expect(adapterSnapshotFile.source).toContain(
      'function snapshotCanvasAppItemAdapters',
    )
    expect(adapterSnapshotFile.source).toContain(
      'itemLayerAdapter: Object.freeze',
    )
    expect(adapterSnapshotFile.source).toContain(
      'stageAdapter: Object.freeze',
    )
    expect(adapterSnapshotFile.source).not.toContain('Pick<')
    expect(adapterSnapshotFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(adapterSnapshotFile.source).toContain(
      'CanvasAppAssemblyAdapters',
    )
  })


  it('keeps App adapter assembly creation behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const adapterAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAdapterAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppAdapterAssembly'",
    )
    expect(assemblyFile.source).toContain(
      "from './CanvasAppFeaturePackAssembly'",
    )
    expect(assemblyFile.source).toContain(
      'createCanvasAppAdapterAssembly',
    )
    expect(assemblyFile.source).toContain(
      'createCanvasAppFeaturePackAssembly',
    )
    expect(assemblyFile.source).toContain(
      'DEFAULT_CANVAS_APP_BASE_EXTENSION_BUNDLE',
    )
    expect(assemblyFile.source).toContain(
      'featurePackAssembly.featurePackExtensionBundle',
    )
    expect(assemblyFile.source).not.toContain(
      'input.itemAdapters ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters',
    )
    expect(assemblyFile.source).not.toContain(
      'input.itemLayerAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemLayerAdapter',
    )
    expect(assemblyFile.source).not.toContain(
      'input.stageAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.stageAdapter',
    )
    expect(adapterAssemblyFile.source).toContain(
      'export function createCanvasAppAdapterAssembly',
    )
    expect(adapterAssemblyFile.source).toContain(
      "from './CanvasAppAssemblyInputTypes'",
    )
    expect(adapterAssemblyFile.source).toContain(
      'export type { CanvasAppAdapterAssemblyInput }',
    )
    expect(adapterAssemblyFile.source).not.toContain(
      'export type CanvasAppAdapterAssemblyInput = {',
    )
    expect(adapterAssemblyFile.source).not.toContain('Pick<')
    expect(adapterAssemblyFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(adapterAssemblyFile.source).toContain(
      'itemAdapters: input.itemAdapters ?? defaults.itemAdapters',
    )
    expect(adapterAssemblyFile.source).toContain(
      'itemLayerAdapter: input.itemLayerAdapter ?? defaults.itemLayerAdapter',
    )
    expect(adapterAssemblyFile.source).toContain(
      'stageAdapter: input.stageAdapter ?? defaults.stageAdapter',
    )
  })


  it('keeps the default App assembly baseline behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppDefaultAssembly'",
    )
    expect(assemblyFile.source).not.toContain(
      'DEFAULT_CANVAS_APP_INITIAL_SELECTION',
    )
    expect(assemblyFile.source).not.toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    expect(assemblyFile.source).not.toContain('CANVAS_COMPONENT_LIBRARY')
    expect(assemblyFile.source).not.toContain('CANVAS_ITEM_ENGINE_ADAPTERS')
    expect(assemblyFile.source).not.toContain('INITIAL_ITEMS')
    expect(defaultAssemblyFile.source).toContain(
      'export const DEFAULT_CANVAS_APP_ASSEMBLY',
    )
    expect(defaultAssemblyFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(defaultAssemblyFile.source).toContain(
      'createCanvasAppExtensionBundle',
    )
    expect(defaultAssemblyFile.source).toContain(
      'mergeCanvasAppExtensionBundle',
    )
    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE',
    )
    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS',
    )
    expect(defaultAssemblyFile.source).toContain(
      "from '../feature-packs'",
    )
    for (const featurePackImplementation of [
      'CANVAS_LINK_PREVIEW_INSPECTOR_PANEL',
      'CANVAS_ARROW_ROUTING_INSPECTOR_PANEL',
      'CANVAS_CHECKLIST_INSPECTOR_PANEL',
      'CANVAS_KANBAN_INSPECTOR_PANEL',
    ]) {
      expect(defaultAssemblyFile.source).not.toContain(
        featurePackImplementation,
      )
    }
    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_APP_INITIAL_SELECTION',
    )
    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    expect(defaultAssemblyFile.source).toContain('CANVAS_COMPONENT_LIBRARY')
    expect(defaultAssemblyFile.source).toContain('CANVAS_ITEM_ENGINE_ADAPTERS')
    expect(defaultAssemblyFile.source).toContain('INITIAL_ITEMS')
    expect(defaultAssemblyFile.source).toContain('snapshotCanvasAppAssembly')
    expect(defaultAssemblyFile.source).not.toContain('customCommands: []')
    expect(defaultAssemblyFile.source).not.toContain(
      'customCreationTools: []',
    )
    expect(defaultAssemblyFile.source).not.toContain('inspectorPanels: []')
  })


  it('keeps installed feature pack ids on the assembly model seam', () => {
    const assemblyModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModel.ts',
    )
    const assemblyModelContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModelContracts.ts',
    )
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const runtimeFeaturePackModelFile = getSourceFile(
      'src/canvas/app/feature-packs/CanvasAppFeaturePackRuntimeModel.ts',
    )

    expect(assemblyModelContractsFile.source).toContain(
      'CanvasAppAssemblyFeaturePackModel',
    )
    expect(assemblyModelContractsFile.source).toContain('installedIds')
    expect(assemblyModelContractsFile.source).toContain('enabledIds')
    expect(assemblyModelFile.source).toContain('featurePackViewRenderers')
    expect(assemblyModelFile.source).toContain('enabledFeaturePackIds')
    expect(assemblyModelFile.source).toContain('installedFeaturePackIds')
    expect(assemblyModelFile.source).toContain('featurePack: {')
    expect(appModelFile.source).toContain(
      'featurePackViewRenderers: appAssembly.featurePack.viewRenderers',
    )
    expect(appModelFile.source).toContain(
      'enabledFeaturePackIds = appAssembly.featurePack.enabledIds',
    )
    expect(appModelFile.source).toContain(
      'useCanvasAppTransientFeaturePackModel',
    )
    expect(appModelFile.source).toContain(
      'installedFeaturePackIds: enabledFeaturePackIds',
    )
    expect(runtimeFeaturePackModelFile.source).toContain(
      'installedFeaturePackIds',
    )
    expect(runtimeFeaturePackModelFile.source).toContain(
      'featurePack.featurePackId',
    )
    expect(runtimeFeaturePackModelFile.source).not.toContain(
      'viewRenderers[featurePack.viewRendererId]',
    )
    expect(runtimeFeaturePackModelFile.source).not.toContain(
      'viewRendererId',
    )
  })

})
