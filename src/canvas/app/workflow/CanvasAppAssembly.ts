import type {
  CanvasCommandAdapter,
  CanvasCreationAdapter,
  CanvasTransformAdapter,
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
  DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  createCanvasDemoSvgComponentPresentationRenderers,
  type CanvasDemoSvgComponentPresentationRenderers,
  type CanvasDemoSvgCustomItemRenderers,
} from '../rendering'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'
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
import {
  assertCanvasAppCustomCreationTools,
  type CanvasAppCustomCreationTool,
} from '../tools/CanvasAppCustomCreationTools'

export type CanvasAppItemAdapters = {
  command: CanvasCommandAdapter<CanvasItem>
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

export type CanvasAppAssembly = {
  componentLibrary: CanvasComponentLibrary
  componentPresentationRenderers: CanvasDemoSvgComponentPresentationRenderers
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasDemoSvgCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  initialItems: CanvasItem[]
  itemAdapters: CanvasAppItemAdapters
}

export type CanvasAppAssemblyInput = {
  componentLibrary?: CanvasComponentLibrary
  componentPresentationRenderers?: CanvasDemoSvgComponentPresentationRenderers
  customCommands?: readonly CanvasAppCustomCommand[]
  customCreationTools?: readonly CanvasAppCustomCreationTool[]
  customItemModules?: readonly CanvasAppCustomItemModule[]
  customItemRenderers?: CanvasDemoSvgCustomItemRenderers
  customItemValidators?: CanvasCustomItemValidators
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
  initialItems?: CanvasItem[]
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  itemAdapters?: CanvasAppItemAdapters
}

export const DEFAULT_CANVAS_APP_ASSEMBLY: CanvasAppAssembly = {
  componentLibrary: CANVAS_COMPONENT_LIBRARY,
  componentPresentationRenderers:
    DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  customCommands: [],
  customCreationTools: [],
  customItemRenderers: DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
  customItemValidators: {},
  inspectorPanels: [],
  initialItems: INITIAL_ITEMS,
  itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
}

export function createCanvasAppAssembly(
  input: CanvasAppAssemblyInput = {},
): CanvasAppAssembly {
  const customItemModuleAssembly = createCanvasAppCustomItemModuleAssembly(
    input.customItemModules,
    { disabledModuleIds: input.disabledCustomItemModuleIds },
  )
  const customItemValidators = mergeUniqueCanvasAppExtensionRecord({
    current: {
      ...DEFAULT_CANVAS_APP_ASSEMBLY.customItemValidators,
      ...customItemModuleAssembly.customItemValidators,
    },
    entries: input.customItemValidators ?? {},
    label: 'custom item validator',
    owner: 'app assembly',
  })

  const assembly: CanvasAppAssembly = {
    componentLibrary:
      input.componentLibrary ?? DEFAULT_CANVAS_APP_ASSEMBLY.componentLibrary,
    componentPresentationRenderers: createCanvasDemoSvgComponentPresentationRenderers(
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
      current: [
        ...DEFAULT_CANVAS_APP_ASSEMBLY.customCreationTools,
        ...customItemModuleAssembly.customCreationTools,
      ],
      entries: input.customCreationTools ?? [],
      label: 'custom creation tool',
      owner: 'app assembly',
    }),
    customItemRenderers: mergeUniqueCanvasAppExtensionRecord({
      current: {
        ...DEFAULT_CANVAS_APP_ASSEMBLY.customItemRenderers,
        ...customItemModuleAssembly.customItemRenderers,
      },
      entries: input.customItemRenderers ?? {},
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
  }

  assertCanvasAppExtensionRecordKeys({
    entries: assembly.componentPresentationRenderers,
    label: 'component presentation renderer',
  })
  assertCanvasAppCustomCreationTools(assembly.customCreationTools)

  return assembly
}
