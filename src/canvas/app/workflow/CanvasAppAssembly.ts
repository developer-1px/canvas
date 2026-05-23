import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  createCanvasAffordanceConfig,
  type CanvasAffordanceConfig,
  type CanvasAffordanceConfigInput,
  type CanvasCommandAdapter,
  type CanvasCreationAdapter,
  type CanvasTransformAdapter,
} from '../../engine'
import {
  CANVAS_COMPONENT_LIBRARY,
  CANVAS_ITEM_ENGINE_ADAPTERS,
  INITIAL_ITEMS,
  normalizeCanvasItems,
  type CanvasComponentLibrary,
  type CanvasCustomItemValidators,
  type CanvasItem,
} from '../../host'
import {
  DEFAULT_CANVAS_APP_CUSTOM_ITEM_RENDERERS,
  DEFAULT_CANVAS_APP_COMPONENT_PRESENTATION_RENDERERS,
  DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
  DEFAULT_CANVAS_APP_STAGE_ADAPTER,
  createCanvasAppComponentPresentationRenderers,
  type CanvasAppComponentPresentationRenderers,
  type CanvasAppCustomItemRenderers,
  type CanvasAppItemLayerAdapter,
  type CanvasAppStageAdapter,
} from '../rendering'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import {
  appendUniqueCanvasAppExtensionEntries,
  mergeUniqueCanvasAppExtensionRecord,
} from '../extensions/CanvasAppExtensionRegistries'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import {
  createCanvasAppCustomItemModuleAssembly,
  type CanvasAppCustomItemModule,
  type CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'
import { snapshotCanvasAppAssembly } from './CanvasAppAssemblySnapshot'

export { assertCanvasAppAssembly } from './CanvasAppAssemblyContracts'

export type CanvasAppItemAdapters = {
  command: CanvasCommandAdapter<CanvasItem>
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

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
  itemAdapters: CanvasAppItemAdapters
  itemLayerAdapter: CanvasAppItemLayerAdapter
  stageAdapter: CanvasAppStageAdapter
}

export type CanvasAppAssemblyInput = {
  affordanceConfig?: CanvasAffordanceConfigInput
  componentLibrary?: CanvasComponentLibrary
  componentPresentationRenderers?: CanvasAppComponentPresentationRenderers
  customCommands?: readonly CanvasAppCustomCommand[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  initialItems?: CanvasItem[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  itemAdapters?: CanvasAppItemAdapters
  itemLayerAdapter?: CanvasAppItemLayerAdapter
  stageAdapter?: CanvasAppStageAdapter
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
    itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
    itemLayerAdapter: DEFAULT_CANVAS_APP_ITEM_LAYER_ADAPTER,
    stageAdapter: DEFAULT_CANVAS_APP_STAGE_ADAPTER,
  })

export function createCanvasAppAssembly(
  input: CanvasAppAssemblyInput = {},
): CanvasAppAssembly {
  const customItemModuleAssembly = createCanvasAppCustomItemModuleAssembly(
    input.customItemModules,
    { disabledModuleIds: input.disabledCustomItemModuleIds },
  )
  const customItemValidators = mergeUniqueCanvasAppExtensionRecord({
    current: DEFAULT_CANVAS_APP_ASSEMBLY.customItemValidators,
    entries: customItemModuleAssembly.customItemValidators,
    label: 'custom item validator',
    owner: 'app assembly',
  })

  const assembly: CanvasAppAssembly = {
    affordanceConfig: input.affordanceConfig === undefined
      ? DEFAULT_CANVAS_APP_ASSEMBLY.affordanceConfig
      : createCanvasAffordanceConfig(input.affordanceConfig),
    componentLibrary:
      input.componentLibrary ?? DEFAULT_CANVAS_APP_ASSEMBLY.componentLibrary,
    componentPresentationRenderers: createCanvasAppComponentPresentationRenderers(
      input.componentPresentationRenderers,
    ),
    customCommands: appendUniqueCanvasAppExtensionEntries({
      current: [
        ...DEFAULT_CANVAS_APP_ASSEMBLY.customCommands,
        ...customItemModuleAssembly.customCommands,
      ],
      entries: input.customCommands ?? [],
      label: 'custom command',
      owner: 'app assembly',
    }),
    customCreationTools: appendUniqueCanvasAppExtensionEntries({
      current: DEFAULT_CANVAS_APP_ASSEMBLY.customCreationTools,
      entries: customItemModuleAssembly.customCreationTools,
      label: 'custom creation tool',
      owner: 'app assembly',
    }),
    customItemRenderers: mergeUniqueCanvasAppExtensionRecord({
      current: DEFAULT_CANVAS_APP_ASSEMBLY.customItemRenderers,
      entries: customItemModuleAssembly.customItemRenderers,
      label: 'custom item renderer',
      owner: 'app assembly',
    }),
    customItemValidators,
    inspectorPanels: appendUniqueCanvasAppExtensionEntries({
      current: [
        ...DEFAULT_CANVAS_APP_ASSEMBLY.inspectorPanels,
        ...customItemModuleAssembly.inspectorPanels,
      ],
      entries: input.inspectorPanels ?? [],
      label: 'inspector panel',
      owner: 'app assembly',
    }),
    initialItems: normalizeCanvasItems(
      input.initialItems ?? DEFAULT_CANVAS_APP_ASSEMBLY.initialItems,
      { customItemValidators },
    ),
    itemAdapters: input.itemAdapters ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters,
    itemLayerAdapter:
      input.itemLayerAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemLayerAdapter,
    stageAdapter: input.stageAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.stageAdapter,
  }

  assertCanvasAppAssembly(assembly)

  return snapshotCanvasAppAssembly(assembly)
}
