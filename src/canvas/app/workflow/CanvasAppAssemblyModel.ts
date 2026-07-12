import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import type { CanvasAppAssemblyModel } from './CanvasAppAssemblyModelContracts'

export function getCanvasAppAssemblyModel({
  affordanceConfig,
  componentLibrary,
  componentPresentationRenderers,
  customCommands,
  customCreationTools,
  customItemRenderers,
  customItemTextTargets,
  customItemValidators,
  documentAuthority,
  featurePackViewRenderers,
  foundationExtensionRuntime,
  installedFeaturePackIds,
  inspectorPanels,
  initialItems,
  initialSelection,
  itemAdapters,
  itemLayerAdapter,
  mediaImporters,
  presenceProvider,
  stageAdapter,
  textPasteImporters,
  workspaceStorageProvider,
}: CanvasAppAssembly): CanvasAppAssemblyModel {
  return {
    affordance: {
      config: affordanceConfig,
    },
    command: {
      commandAdapter: itemAdapters.command,
    },
    collaboration: {
      presenceProvider,
    },
    component: {
      componentLibrary,
      creationAdapter: itemAdapters.creation,
      foundationExtensionRuntime,
    },
    control: {
      components: componentLibrary.templates,
    },
    extension: {
      customCommands,
      customCreationTools,
      mediaImporters,
      textPasteImporters,
    },
    featurePack: {
      installedIds: installedFeaturePackIds,
      viewRenderers: featurePackViewRenderers,
    },
    inspector: {
      inspectorPanels,
    },
    pointer: {
      componentLibrary,
      foundationExtensionRuntime,
      itemAdapters: {
        creation: itemAdapters.creation,
        transform: itemAdapters.transform,
      },
    },
    rendering: {
      componentPresentationRenderers,
      customItemRenderers,
      getComponentPresentation: componentLibrary.getPresentation,
      itemLayerAdapter,
      stageAdapter,
    },
    workspace: {
      customItemTextTargets,
      customItemValidators,
      documentAuthority,
      foundationExtensionRuntime,
      initialItems,
      initialSelection,
      storageProvider: workspaceStorageProvider,
    },
  }
}
