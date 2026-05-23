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
  type CanvasAppCustomItemModuleAssemblyOptions,
} from '../modules/CanvasAppCustomItemModules'
import {
  assertCanvasAppCustomCreationToolShortcuts,
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

export type CanvasAppAssemblyInput = Partial<CanvasAppAssembly> & {
  customItemModules?: readonly CanvasAppCustomItemModule[]
  disabledCustomItemModuleIds?: CanvasAppCustomItemModuleAssemblyOptions['disabledModuleIds']
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

  const assembly: CanvasAppAssembly = {
    componentLibrary:
      input.componentLibrary ?? DEFAULT_CANVAS_APP_ASSEMBLY.componentLibrary,
    componentPresentationRenderers:
      input.componentPresentationRenderers ??
      DEFAULT_CANVAS_APP_ASSEMBLY.componentPresentationRenderers,
    customCommands: appendUniqueById({
      current: [
        ...DEFAULT_CANVAS_APP_ASSEMBLY.customCommands,
        ...customItemModuleAssembly.customCommands,
      ],
      entries: input.customCommands ?? [],
      label: 'custom command',
    }),
    customCreationTools: appendUniqueById({
      current: [
        ...DEFAULT_CANVAS_APP_ASSEMBLY.customCreationTools,
        ...customItemModuleAssembly.customCreationTools,
      ],
      entries: input.customCreationTools ?? [],
      label: 'custom creation tool',
    }),
    customItemRenderers: mergeUniqueRecord({
      current: {
        ...DEFAULT_CANVAS_APP_ASSEMBLY.customItemRenderers,
        ...customItemModuleAssembly.customItemRenderers,
      },
      entries: input.customItemRenderers ?? {},
      label: 'custom item renderer',
    }),
    customItemValidators: mergeUniqueRecord({
      current: {
        ...DEFAULT_CANVAS_APP_ASSEMBLY.customItemValidators,
        ...customItemModuleAssembly.customItemValidators,
      },
      entries: input.customItemValidators ?? {},
      label: 'custom item validator',
    }),
    inspectorPanels: appendUniqueById({
      current: [
        ...DEFAULT_CANVAS_APP_ASSEMBLY.inspectorPanels,
        ...customItemModuleAssembly.inspectorPanels,
      ],
      entries: input.inspectorPanels ?? [],
      label: 'inspector panel',
    }),
    initialItems: input.initialItems ?? DEFAULT_CANVAS_APP_ASSEMBLY.initialItems,
    itemAdapters: input.itemAdapters ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters,
  }

  assertCanvasAppCustomCreationToolShortcuts(assembly.customCreationTools)

  return assembly
}

function appendUniqueById<TEntry extends { id: string }>({
  current,
  entries,
  label,
}: {
  current: readonly TEntry[]
  entries: readonly TEntry[]
  label: string
}) {
  const ids = new Set(current.map((entry) => entry.id))

  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate canvas app assembly ${label}: ${entry.id}`)
    }

    ids.add(entry.id)
  }

  return [...current, ...entries]
}

function mergeUniqueRecord<TValue>({
  current,
  entries,
  label,
}: {
  current: Readonly<Record<string, TValue>>
  entries: Readonly<Record<string, TValue>>
  label: string
}) {
  for (const key of Object.keys(entries)) {
    if (Object.hasOwn(current, key)) {
      throw new Error(`Duplicate canvas app assembly ${label}: ${key}`)
    }
  }

  return {
    ...current,
    ...entries,
  }
}
