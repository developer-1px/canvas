import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import type { CanvasAppAssemblyModel } from './CanvasAppAssemblyModelContracts'

export function getCanvasAppAssemblyModel({
  affordanceConfig,
  capabilities,
  componentDefinitionRegistry,
  componentLibrary,
  componentPresentationRenderers,
  customCommands,
  customCreationTools,
  customItemRenderers,
  customItemValidators,
  featurePackViewRenderers,
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
      capabilities,
      commandAdapter: itemAdapters.command,
    },
    collaboration: {
      presenceProvider,
    },
    component: {
      componentDefinitionRegistry,
      componentLibrary,
      creationAdapter: itemAdapters.creation,
    },
    control: {
      componentSets: componentDefinitionRegistry.listSets(),
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
      customItemValidators,
      initialItems,
      initialSelection,
      storageProvider: workspaceStorageProvider,
    },
  }
}
