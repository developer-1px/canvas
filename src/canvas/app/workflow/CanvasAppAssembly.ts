import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  createCanvasAffordanceConfig,
  type CanvasAffordanceConfig,
  type CanvasAffordanceConfigInput,
} from '../../engine'
import {
  CANVAS_COMPONENT_LIBRARY,
  CANVAS_ITEM_ENGINE_ADAPTERS,
  INITIAL_ITEMS,
  type CanvasComponentLibrary,
  type CanvasCustomItemValidators,
  type CanvasItem,
} from '../../host'
import {
  DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
  DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasAppComponentPresentationRenderers,
  type CanvasAppCustomItemRenderers,
} from '../rendering/CanvasAppRendererRegistries'
import {
  DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
  type CanvasAppItemLayerAdapter,
} from '../rendering/CanvasAppItemLayerAdapter'
import {
  DEFAULT_CANVAS_APP_STAGE_ADAPTER,
  type CanvasAppStageAdapter,
} from '../rendering/CanvasAppStageAdapter'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import {
  DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER,
  type CanvasWorkspaceStorageProvider,
} from '../document/CanvasWorkspacePersistence'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemModule,
  CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
import { createCanvasAppComponentAssembly } from './CanvasAppComponentAssembly'
import { createCanvasAppExtensionAssembly } from './CanvasAppExtensionAssembly'
import { createCanvasAppWorkspaceAssembly } from './CanvasAppWorkspaceAssembly'
import { snapshotCanvasAppAssembly } from './CanvasAppAssemblySnapshot'
import type { CanvasAppItemAdapters } from './CanvasAppAdapterContracts'

const DEFAULT_CANVAS_APP_INITIAL_SELECTION = [
  'component-sticky',
  'component-card',
]

export { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
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

export const DEFAULT_CANVAS_APP_ASSEMBLY: CanvasAppAssembly =
  snapshotCanvasAppAssembly({
    affordanceConfig: DEFAULT_CANVAS_AFFORDANCE_CONFIG,
    componentLibrary: CANVAS_COMPONENT_LIBRARY,
    componentPresentationRenderers:
      DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
    customCommands: [],
    customCreationTools: [],
    customItemRenderers: DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
    customItemValidators: {},
    inspectorPanels: [],
    initialItems: INITIAL_ITEMS,
    initialSelection: DEFAULT_CANVAS_APP_INITIAL_SELECTION,
    itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
    itemLayerAdapter: DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
    stageAdapter: DEFAULT_CANVAS_APP_STAGE_ADAPTER,
    workspaceStorageProvider: DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER,
  })

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

  const assembly: CanvasAppAssembly = {
    affordanceConfig: input.affordanceConfig === undefined
      ? DEFAULT_CANVAS_APP_ASSEMBLY.affordanceConfig
      : createCanvasAffordanceConfig(input.affordanceConfig),
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
    itemAdapters: input.itemAdapters ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters,
    itemLayerAdapter:
      input.itemLayerAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemLayerAdapter,
    stageAdapter: input.stageAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.stageAdapter,
    workspaceStorageProvider: workspaceAssembly.workspaceStorageProvider,
  }

  assertCanvasAppAssembly(assembly)

  return snapshotCanvasAppAssembly(assembly)
}
