import {
  snapshotCanvasAppDescriptorArray,
  snapshotCanvasAppRecord,
  snapshotCanvasAppShortcutDescriptorArray,
} from '../extensions/CanvasAppDescriptorSnapshot'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleAssembly,
} from './CanvasAppCustomItemModules'

export function snapshotCanvasAppCustomItemModuleAssembly(
  assembly: CanvasAppCustomItemModuleAssembly,
): CanvasAppCustomItemModuleAssembly {
  return Object.freeze({
    customCommands: snapshotCanvasAppDescriptorArray(assembly.customCommands),
    customCreationTools: snapshotCanvasAppShortcutDescriptorArray(
      assembly.customCreationTools,
    ),
    customItemRenderers: snapshotCanvasAppRecord(assembly.customItemRenderers),
    customItemValidators: snapshotCanvasAppRecord(assembly.customItemValidators),
    inspectorPanels: snapshotCanvasAppDescriptorArray(assembly.inspectorPanels),
  })
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
