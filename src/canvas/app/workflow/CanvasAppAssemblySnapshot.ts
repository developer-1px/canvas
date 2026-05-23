import {
  createCanvasComponentLibrary,
  normalizeCanvasItems,
} from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type {
  CanvasAppAssembly,
  CanvasAppItemAdapters,
} from './CanvasAppAssembly'

export function snapshotCanvasAppAssembly(
  assembly: CanvasAppAssembly,
): CanvasAppAssembly {
  const customItemValidators = freezeCanvasAppRecord(
    assembly.customItemValidators,
  )

  return Object.freeze({
    affordanceConfig: snapshotCanvasAppAffordanceConfig(
      assembly.affordanceConfig,
    ),
    componentLibrary: snapshotCanvasAppComponentLibrary(
      assembly.componentLibrary,
    ),
    componentPresentationRenderers: freezeCanvasAppRecord(
      assembly.componentPresentationRenderers,
    ),
    customCommands: freezeCanvasAppArray(
      assembly.customCommands.map(snapshotCanvasAppCustomCommand),
    ),
    customCreationTools: freezeCanvasAppArray(
      assembly.customCreationTools.map(snapshotCanvasAppCustomCreationTool),
    ),
    customItemRenderers: freezeCanvasAppRecord(assembly.customItemRenderers),
    customItemValidators,
    inspectorPanels: freezeCanvasAppArray(
      assembly.inspectorPanels.map(snapshotCanvasAppInspectorPanel),
    ),
    initialItems: snapshotCanvasAppInitialItems(
      assembly.initialItems,
      customItemValidators,
    ),
    itemAdapters: snapshotCanvasAppItemAdapters(assembly.itemAdapters),
    itemLayerAdapter: Object.freeze({ ...assembly.itemLayerAdapter }),
    stageAdapter: Object.freeze({ ...assembly.stageAdapter }),
  })
}

function snapshotCanvasAppAffordanceConfig(
  config: CanvasAppAssembly['affordanceConfig'],
): CanvasAppAssembly['affordanceConfig'] {
  return Object.freeze({
    commands: freezeCanvasAppRecord(config.commands),
    gestures: freezeCanvasAppRecord(config.gestures),
    overlays: freezeCanvasAppRecord(config.overlays),
    shortcuts: freezeCanvasAppRecord(config.shortcuts),
    tools: freezeCanvasAppRecord(config.tools),
  }) as CanvasAppAssembly['affordanceConfig']
}

function snapshotCanvasAppComponentLibrary(
  componentLibrary: CanvasAppAssembly['componentLibrary'],
): CanvasAppAssembly['componentLibrary'] {
  const templates = createCanvasComponentLibrary({
    templates: componentLibrary.templates,
  }).templates
  const createItem = componentLibrary.createItem
  const getPresentation = componentLibrary.getPresentation
  const getTemplate = componentLibrary.getTemplate

  return Object.freeze({
    createItem,
    getPresentation,
    getTemplate,
    templates,
  })
}

function snapshotCanvasAppCustomCommand(
  command: CanvasAppCustomCommand,
): CanvasAppCustomCommand {
  return Object.freeze({ ...command })
}

function snapshotCanvasAppCustomCreationTool(
  tool: CanvasAppCustomCreationTool,
): CanvasAppCustomCreationTool {
  const snapshot: CanvasAppCustomCreationTool = {
    ...tool,
  }

  if (tool.shortcut) {
    snapshot.shortcut = Object.freeze({ ...tool.shortcut })
  }

  return Object.freeze(snapshot)
}

function snapshotCanvasAppInspectorPanel(
  panel: CanvasAppInspectorPanel,
): CanvasAppInspectorPanel {
  return Object.freeze({ ...panel })
}

function snapshotCanvasAppInitialItems(
  items: CanvasAppAssembly['initialItems'],
  customItemValidators: CanvasAppAssembly['customItemValidators'],
) {
  return freezeCanvasAppArray(
    normalizeCanvasItems(items, { customItemValidators })
      .map((item) => deepFreezeCanvasAppValue(structuredClone(item))),
  ) as CanvasAppAssembly['initialItems']
}

function snapshotCanvasAppItemAdapters(
  itemAdapters: CanvasAppItemAdapters,
): CanvasAppItemAdapters {
  return Object.freeze({
    command: Object.freeze({ ...itemAdapters.command }),
    creation: Object.freeze({ ...itemAdapters.creation }),
    transform: Object.freeze({ ...itemAdapters.transform }),
  })
}

function freezeCanvasAppRecord<TValue>(
  record: Readonly<Record<string, TValue>>,
) {
  return Object.freeze({ ...record })
}

function freezeCanvasAppArray<TValue>(items: readonly TValue[]) {
  return Object.freeze([...items]) as readonly TValue[]
}

function deepFreezeCanvasAppValue<TValue>(value: TValue): TValue {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value
  }

  for (const nested of Object.values(value)) {
    deepFreezeCanvasAppValue(nested)
  }

  return Object.freeze(value)
}
