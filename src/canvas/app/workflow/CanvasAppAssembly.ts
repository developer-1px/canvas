import type {
  CanvasCommandAdapter,
  CanvasCreationAdapter,
  CanvasTransformAdapter,
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
  DEFAULT_CANVAS_DEMO_SVG_CUSTOM_ITEM_RENDERERS,
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasDemoSvgComponentPresentationRenderers,
  type CanvasDemoSvgCustomItemRenderers,
} from '../rendering'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import {
  createCanvasAppCustomItemModuleAssembly,
  type CanvasAppCustomItemModule,
} from '../modules/CanvasAppCustomItemModules'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'

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

export type CanvasAppAssemblyInput = Partial<CanvasAppAssembly> & {
  customItemModules?: readonly CanvasAppCustomItemModule[]
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
  )

  return {
    componentLibrary:
      input.componentLibrary ?? DEFAULT_CANVAS_APP_ASSEMBLY.componentLibrary,
    componentPresentationRenderers:
      input.componentPresentationRenderers ??
      DEFAULT_CANVAS_APP_ASSEMBLY.componentPresentationRenderers,
    customCommands: [
      ...DEFAULT_CANVAS_APP_ASSEMBLY.customCommands,
      ...customItemModuleAssembly.customCommands,
      ...(input.customCommands ?? []),
    ],
    customCreationTools: [
      ...DEFAULT_CANVAS_APP_ASSEMBLY.customCreationTools,
      ...customItemModuleAssembly.customCreationTools,
      ...(input.customCreationTools ?? []),
    ],
    customItemRenderers: {
      ...DEFAULT_CANVAS_APP_ASSEMBLY.customItemRenderers,
      ...customItemModuleAssembly.customItemRenderers,
      ...(input.customItemRenderers ?? {}),
    },
    customItemValidators: {
      ...DEFAULT_CANVAS_APP_ASSEMBLY.customItemValidators,
      ...customItemModuleAssembly.customItemValidators,
      ...(input.customItemValidators ?? {}),
    },
    inspectorPanels: [
      ...DEFAULT_CANVAS_APP_ASSEMBLY.inspectorPanels,
      ...customItemModuleAssembly.inspectorPanels,
      ...(input.inspectorPanels ?? []),
    ],
    initialItems: input.initialItems ?? DEFAULT_CANVAS_APP_ASSEMBLY.initialItems,
    itemAdapters: input.itemAdapters ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters,
  }
}
