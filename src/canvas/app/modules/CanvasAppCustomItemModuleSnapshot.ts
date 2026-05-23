import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleAssembly,
  CanvasAppCustomItemModuleCreationTool,
} from './CanvasAppCustomItemModules'

export function snapshotCanvasAppCustomItemModuleAssembly(
  assembly: CanvasAppCustomItemModuleAssembly,
): CanvasAppCustomItemModuleAssembly {
  return Object.freeze({
    customCommands: freezeCanvasAppArray(
      assembly.customCommands.map((command) => Object.freeze({ ...command })),
    ),
    customCreationTools: freezeCanvasAppArray(
      assembly.customCreationTools.map(snapshotCanvasAppCustomCreationTool),
    ),
    customItemRenderers: freezeCanvasAppRecord(assembly.customItemRenderers),
    customItemValidators: freezeCanvasAppRecord(assembly.customItemValidators),
    inspectorPanels: freezeCanvasAppArray(
      assembly.inspectorPanels.map((panel) => Object.freeze({ ...panel })),
    ),
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
    snapshot.customCommands = freezeCanvasAppArray(
      module.customCommands.map((command) => Object.freeze({ ...command })),
    )
  }

  if (module.customCreationTools) {
    snapshot.customCreationTools = freezeCanvasAppArray(
      module.customCreationTools.map(
        snapshotCanvasAppCustomItemModuleCreationTool,
      ),
    )
  }

  if (module.inspectorPanels) {
    snapshot.inspectorPanels = freezeCanvasAppArray(
      module.inspectorPanels.map((panel) => Object.freeze({ ...panel })),
    )
  }

  return Object.freeze(snapshot)
}

function snapshotCanvasAppCustomItemModuleCreationTool(
  tool: CanvasAppCustomItemModuleCreationTool,
): CanvasAppCustomItemModuleCreationTool {
  const snapshot: CanvasAppCustomItemModuleCreationTool = { ...tool }

  if (tool.shortcut) {
    snapshot.shortcut = Object.freeze({ ...tool.shortcut })
  }

  return Object.freeze(snapshot)
}

function snapshotCanvasAppCustomCreationTool(
  tool: CanvasAppCustomCreationTool,
): CanvasAppCustomCreationTool {
  const snapshot: CanvasAppCustomCreationTool = { ...tool }

  if (tool.shortcut) {
    snapshot.shortcut = Object.freeze({ ...tool.shortcut })
  }

  return Object.freeze(snapshot)
}

function freezeCanvasAppRecord<TValue>(
  record: Readonly<Record<string, TValue>>,
) {
  return Object.freeze({ ...record })
}

function freezeCanvasAppArray<TValue>(items: readonly TValue[]) {
  return Object.freeze([...items]) as readonly TValue[]
}
