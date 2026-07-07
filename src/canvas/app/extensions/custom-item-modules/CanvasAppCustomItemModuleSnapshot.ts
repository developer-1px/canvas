import {
  snapshotCanvasAppDescriptorArray,
  snapshotCanvasAppShortcutDescriptorArray,
} from '../CanvasAppDescriptorSnapshot'
import {
  snapshotCanvasAppExtensionBundle,
} from '../CanvasAppExtensionBundle'
import type { CanvasAppCustomItemModuleAssembly } from './CanvasAppCustomItemModuleAssembly'
import type { CanvasAppCustomItemModule } from './CanvasAppCustomItemModules'

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

  if (module.getRenderKey) {
    snapshot.getRenderKey = module.getRenderKey
  }

  if (module.inspectorPanels) {
    snapshot.inspectorPanels = snapshotCanvasAppDescriptorArray(
      module.inspectorPanels,
    )
  }

  if (module.mediaImporters) {
    snapshot.mediaImporters = snapshotCanvasAppDescriptorArray(
      module.mediaImporters,
    )
  }

  if (module.textPasteImporters) {
    snapshot.textPasteImporters = snapshotCanvasAppDescriptorArray(
      module.textPasteImporters,
    )
  }

  if (module.textTarget) {
    snapshot.textTarget = Object.freeze({ ...module.textTarget })
  }

  return Object.freeze(snapshot)
}
