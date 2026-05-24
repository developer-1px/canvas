import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import type { CanvasAppAssemblyModel } from './CanvasAppAssemblyModelContracts'

export function getCanvasAppAssemblyModel({
  affordanceConfig,
  componentLibrary,
  componentPresentationRenderers,
  customCommands,
  customCreationTools,
  customItemRenderers,
  customItemValidators,
  inspectorPanels,
  initialItems,
  initialSelection,
  itemAdapters,
  itemLayerAdapter,
  stageAdapter,
  workspaceStorageProvider,
}: CanvasAppAssembly): CanvasAppAssemblyModel {
  return {
    affordance: {
      config: affordanceConfig,
    },
    command: {
      commandAdapter: itemAdapters.command,
    },
    component: {
      componentLibrary,
      creationAdapter: itemAdapters.creation,
    },
    control: {
      components: componentLibrary.templates,
    },
    extension: {
      customCommands,
      customCreationTools,
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
