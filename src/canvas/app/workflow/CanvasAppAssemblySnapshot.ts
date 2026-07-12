import {
  createCanvasComponentLibrary,
  normalizeCanvasItems,
} from '../../host'
import {
  snapshotCanvasAppArray,
  snapshotCanvasAppRecord,
} from '../extensions/CanvasAppDescriptorSnapshot'
import { snapshotCanvasAppExtensionBundle } from '../extensions/CanvasAppExtensionBundle'
import type {
  CanvasAppAssembly,
} from './CanvasAppAssemblyTypes'
import { snapshotCanvasAppAssemblyAdapters } from './CanvasAppAdapterSnapshot'
import {
  snapshotCanvasAppInstalledFeaturePackIds,
  snapshotCanvasAppFeaturePackViewRenderers,
} from './CanvasAppFeaturePackAssembly'
import { createCanvasAppDocumentAuthorityRead } from './CanvasAppDocumentAuthority'

export function snapshotCanvasAppAssembly(
  assembly: CanvasAppAssembly,
): CanvasAppAssembly {
  const extensionBundle = snapshotCanvasAppExtensionBundle(assembly)
  const adapterSnapshot = snapshotCanvasAppAssemblyAdapters(assembly)
  const capabilities = Object.freeze({ ...assembly.capabilities })

  return Object.freeze({
    affordanceConfig: snapshotCanvasAppAffordanceConfig(
      assembly.affordanceConfig,
    ),
    capabilities,
    componentLibrary: snapshotCanvasAppComponentLibrary(
      assembly.componentLibrary,
    ),
    componentPresentationRenderers: snapshotCanvasAppRecord(
      assembly.componentPresentationRenderers,
    ),
    documentAuthority: createCanvasAppDocumentAuthorityRead(capabilities),
    featurePackViewRenderers: snapshotCanvasAppFeaturePackViewRenderers(
      assembly.featurePackViewRenderers,
    ),
    foundationExtensionRuntime: assembly.foundationExtensionRuntime,
    installedFeaturePackIds: snapshotCanvasAppInstalledFeaturePackIds(
      assembly.installedFeaturePackIds,
    ),
    ...extensionBundle,
    initialItems: snapshotCanvasAppInitialItems(
      assembly.initialItems,
      extensionBundle.customItemValidators,
    ),
    initialSelection: snapshotCanvasAppArray(assembly.initialSelection),
    itemAdapters: adapterSnapshot.itemAdapters,
    itemLayerAdapter: adapterSnapshot.itemLayerAdapter,
    presenceProvider: assembly.presenceProvider,
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
