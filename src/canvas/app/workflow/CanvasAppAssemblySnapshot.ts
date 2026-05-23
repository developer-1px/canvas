import {
  createCanvasComponentLibrary,
  normalizeCanvasItems,
} from '../../host'
import {
  snapshotCanvasAppArray,
  snapshotCanvasAppDescriptorArray,
  snapshotCanvasAppRecord,
  snapshotCanvasAppShortcutDescriptorArray,
} from '../extensions/CanvasAppDescriptorSnapshot'
import type {
  CanvasAppAssembly,
} from './CanvasAppAssemblyTypes'
import { snapshotCanvasAppAssemblyAdapters } from './CanvasAppAdapterSnapshot'

export function snapshotCanvasAppAssembly(
  assembly: CanvasAppAssembly,
): CanvasAppAssembly {
  const customItemValidators = snapshotCanvasAppRecord(
    assembly.customItemValidators,
  )
  const adapterSnapshot = snapshotCanvasAppAssemblyAdapters(assembly)

  return Object.freeze({
    affordanceConfig: snapshotCanvasAppAffordanceConfig(
      assembly.affordanceConfig,
    ),
    componentLibrary: snapshotCanvasAppComponentLibrary(
      assembly.componentLibrary,
    ),
    componentPresentationRenderers: snapshotCanvasAppRecord(
      assembly.componentPresentationRenderers,
    ),
    customCommands: snapshotCanvasAppDescriptorArray(assembly.customCommands),
    customCreationTools: snapshotCanvasAppShortcutDescriptorArray(
      assembly.customCreationTools,
    ),
    customItemRenderers: snapshotCanvasAppRecord(assembly.customItemRenderers),
    customItemValidators,
    inspectorPanels: snapshotCanvasAppDescriptorArray(assembly.inspectorPanels),
    initialItems: snapshotCanvasAppInitialItems(
      assembly.initialItems,
      customItemValidators,
    ),
    initialSelection: snapshotCanvasAppArray(assembly.initialSelection),
    itemAdapters: adapterSnapshot.itemAdapters,
    itemLayerAdapter: adapterSnapshot.itemLayerAdapter,
    stageAdapter: adapterSnapshot.stageAdapter,
    workspaceStorageProvider: assembly.workspaceStorageProvider,
  })
}

function snapshotCanvasAppAffordanceConfig(
  config: CanvasAppAssembly['affordanceConfig'],
): CanvasAppAssembly['affordanceConfig'] {
  return Object.freeze({
    commands: snapshotCanvasAppRecord(config.commands),
    gestures: snapshotCanvasAppRecord(config.gestures),
    overlays: snapshotCanvasAppRecord(config.overlays),
    shortcuts: snapshotCanvasAppRecord(config.shortcuts),
    tools: snapshotCanvasAppRecord(config.tools),
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

function snapshotCanvasAppInitialItems(
  items: CanvasAppAssembly['initialItems'],
  customItemValidators: CanvasAppAssembly['customItemValidators'],
) {
  return snapshotCanvasAppArray(
    normalizeCanvasItems(items, { customItemValidators })
      .map((item) => deepFreezeCanvasAppValue(structuredClone(item))),
  ) as CanvasAppAssembly['initialItems']
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
