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
  type CanvasItem,
} from '../../host'
import {
  DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  type CanvasDemoSvgComponentPresentationRenderers,
} from '../rendering'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'

export type CanvasAppItemAdapters = {
  command: CanvasCommandAdapter<CanvasItem>
  creation: CanvasCreationAdapter<CanvasItem>
  transform: CanvasTransformAdapter<CanvasItem>
}

export type CanvasAppAssembly = {
  componentLibrary: CanvasComponentLibrary
  componentPresentationRenderers: CanvasDemoSvgComponentPresentationRenderers
  customCommands: readonly CanvasAppCustomCommand[]
  inspectorPanels: readonly CanvasAppInspectorPanel[]
  initialItems: CanvasItem[]
  itemAdapters: CanvasAppItemAdapters
}

export type CanvasAppAssemblyInput = Partial<CanvasAppAssembly>

export const DEFAULT_CANVAS_APP_ASSEMBLY: CanvasAppAssembly = {
  componentLibrary: CANVAS_COMPONENT_LIBRARY,
  componentPresentationRenderers:
    DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
  customCommands: [],
  inspectorPanels: [],
  initialItems: INITIAL_ITEMS,
  itemAdapters: CANVAS_ITEM_ENGINE_ADAPTERS,
}

export function createCanvasAppAssembly(
  input: CanvasAppAssemblyInput = {},
): CanvasAppAssembly {
  return {
    componentLibrary:
      input.componentLibrary ?? DEFAULT_CANVAS_APP_ASSEMBLY.componentLibrary,
    componentPresentationRenderers:
      input.componentPresentationRenderers ??
      DEFAULT_CANVAS_APP_ASSEMBLY.componentPresentationRenderers,
    customCommands:
      input.customCommands ?? DEFAULT_CANVAS_APP_ASSEMBLY.customCommands,
    inspectorPanels:
      input.inspectorPanels ?? DEFAULT_CANVAS_APP_ASSEMBLY.inspectorPanels,
    initialItems: input.initialItems ?? DEFAULT_CANVAS_APP_ASSEMBLY.initialItems,
    itemAdapters: input.itemAdapters ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters,
  }
}
