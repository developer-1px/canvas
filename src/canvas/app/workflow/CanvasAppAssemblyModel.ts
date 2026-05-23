import type { CanvasAppAssembly } from './CanvasAppAssembly'

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
  itemAdapters,
  itemLayerAdapter,
  stageAdapter,
}: CanvasAppAssembly) {
  return {
    affordance: {
      config: affordanceConfig,
    },
    command: {
      commandAdapter: itemAdapters.command,
    },
    component: {
      componentLibrary,
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
    },
  }
}
