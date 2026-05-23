import type {
  CanvasAffordanceConfig,
  CanvasAffordanceConfigInput,
} from '../../engine'
import {
  type CanvasComponentLibrary,
  type CanvasCustomItemValidators,
  type CanvasItem,
} from '../../host'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppCustomItemRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import {
  type CanvasAppItemLayerAdapter,
} from '../rendering/CanvasAppItemLayerAdapter'
import {
  type CanvasAppStageAdapter,
} from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import {
  type CanvasWorkspaceStorageProvider,
} from '../document/CanvasWorkspacePersistence'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import { createCanvasAppAdapterAssembly } from './CanvasAppAdapterAssembly'
import { createCanvasAppAffordanceAssembly } from './CanvasAppAffordanceAssembly'
import { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
import { createCanvasAppComponentAssembly } from './CanvasAppComponentAssembly'
import { DEFAULT_CANVAS_APP_ASSEMBLY } from './CanvasAppDefaultAssembly'
import { createCanvasAppExtensionAssembly } from './CanvasAppExtensionAssembly'
import { createCanvasAppWorkspaceAssembly } from './CanvasAppWorkspaceAssembly'
import { snapshotCanvasAppAssembly } from './CanvasAppAssemblySnapshot'
import type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'

export { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
export { DEFAULT_CANVAS_APP_ASSEMBLY } from './CanvasAppDefaultAssembly'
export type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'

export type CanvasAppAssembly = {
  affordanceConfig: CanvasAffordanceConfig
  componentLibrary: CanvasComponentLibrary
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasAppCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  itemAdapters: CanvasAppItemAdapters
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
  workspaceStorageProvider: CanvasWorkspaceStorageProvider
}

export type CanvasAppAssemblyInput = {
  affordanceConfig?: CanvasAffordanceConfigInput
  componentLibrary?: CanvasComponentLibrary
  componentPresentationRenderers?: CanvasAppComponentPresentationRenderers
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  initialItems?: CanvasItem[]
  initialSelection?: readonly string[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  itemAdapters?: CanvasAppItemAdapters
  itemLayerAdapter?: CanvasAppItemLayerAdapter
  stageAdapter?: CanvasAppStageAdapter
  workspaceStorageProvider?: CanvasWorkspaceStorageProvider
}

export function createCanvasAppAssembly(
  input: CanvasAppAssemblyInput = {},
): CanvasAppAssembly {
  const componentAssembly = createCanvasAppComponentAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const extensionAssembly = createCanvasAppExtensionAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const workspaceAssembly = createCanvasAppWorkspaceAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
    { customItemValidators: extensionAssembly.customItemValidators },
  )
  const adapterAssembly = createCanvasAppAdapterAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )
  const affordanceAssembly = createCanvasAppAffordanceAssembly(
    input,
    DEFAULT_CANVAS_APP_ASSEMBLY,
  )

  const assembly: CanvasAppAssembly = {
    affordanceConfig: affordanceAssembly.affordanceConfig,
    componentLibrary: componentAssembly.componentLibrary,
    componentPresentationRenderers:
      componentAssembly.componentPresentationRenderers,
    customCommands: extensionAssembly.customCommands,
    customCreationTools: extensionAssembly.customCreationTools,
    customItemRenderers: extensionAssembly.customItemRenderers,
    customItemValidators: extensionAssembly.customItemValidators,
    inspectorPanels: extensionAssembly.inspectorPanels,
    initialItems: workspaceAssembly.initialItems,
    initialSelection: workspaceAssembly.initialSelection,
    itemAdapters: adapterAssembly.itemAdapters,
    itemLayerAdapter: adapterAssembly.itemLayerAdapter,
    stageAdapter: adapterAssembly.stageAdapter,
    workspaceStorageProvider: workspaceAssembly.workspaceStorageProvider,
  }

  assertCanvasAppAssembly(assembly)

  return snapshotCanvasAppAssembly(assembly)
}
