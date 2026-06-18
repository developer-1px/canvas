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
  enabledFeaturePackIds,
  featurePackViewRenderers,
  installedFeaturePackIds,
  inspectorPanels,
  itemsChangeTransformers,
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
      itemsChangeTransformers,
      mediaImporters,
      textPasteImporters,
    },
    featurePack: {
      enabledIds: enabledFeaturePackIds,
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
      componentDefinitionRegistry,
      customItemValidators,
      initialItems,
      initialSelection,
      itemsChangeTransformers,
      storageProvider: workspaceStorageProvider,
    },
  }
}
