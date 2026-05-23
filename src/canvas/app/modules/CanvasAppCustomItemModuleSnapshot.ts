import {
  snapshotCanvasAppDescriptorArray,
  snapshotCanvasAppShortcutDescriptorArray,
} from '../extensions/CanvasAppDescriptorSnapshot'
import {
  snapshotCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleAssembly,
} from './CanvasAppCustomItemModules'

export function snapshotCanvasAppCustomItemModuleAssembly(
  assembly: CanvasAppCustomItemModuleAssembly,
): CanvasAppCustomItemModuleAssembly {
  return snapshotCanvasAppExtensionBundle(assembly)
}

export function snapshotCanvasAppCustomItemModule(
  module: CanvasAppCustomItemModule,
): CanvasAppCustomItemModule {
  const snapshot: CanvasAppCustomItemModule = {
    id: module.id,
    presentation: module.presentation,
    renderItem: module.renderItem,
    validateItem: module.validateItem,
  }

  if (module.customCommands) {
    snapshot.customCommands = snapshotCanvasAppDescriptorArray(
      module.customCommands,
    )
  }

  if (module.customCreationTools) {
    snapshot.customCreationTools = snapshotCanvasAppShortcutDescriptorArray(
      module.customCreationTools,
    )
  }

  if (module.inspectorPanels) {
    snapshot.inspectorPanels = snapshotCanvasAppDescriptorArray(
      module.inspectorPanels,
    )
  }

  return Object.freeze(snapshot)
}
