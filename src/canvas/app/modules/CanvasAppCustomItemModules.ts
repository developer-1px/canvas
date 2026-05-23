import type { CanvasCustomItemValidators } from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type { CanvasDemoSvgCustomItemRenderers } from '../rendering'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'

export type CanvasAppCustomItemModule = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customCreationTools?: readonly CanvasAppCustomCreationTool[]
  customItemRenderers?: CanvasDemoSvgCustomItemRenderers
  customItemValidators?: CanvasCustomItemValidators
  id: string
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
}

export type CanvasAppCustomItemModuleAssembly = {
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasDemoSvgCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
  inspectorPanels: readonly CanvasAppInspectorPanel[]
}

export function defineCanvasAppCustomItemModule(
  module: CanvasAppCustomItemModule,
) {
  return module
}

export function createCanvasAppCustomItemModuleAssembly(
  modules: readonly CanvasAppCustomItemModule[] = [],
): CanvasAppCustomItemModuleAssembly {
  assertUniqueModuleIds(modules)

  return modules.reduce<CanvasAppCustomItemModuleAssembly>(
    (assembly, module) => ({
      customCommands: appendUniqueById({
        current: assembly.customCommands,
        entries: module.customCommands ?? [],
        label: 'custom command',
      }),
      customCreationTools: appendUniqueById({
        current: assembly.customCreationTools,
        entries: module.customCreationTools ?? [],
        label: 'custom creation tool',
      }),
      customItemRenderers: mergeUniqueRecord({
        current: assembly.customItemRenderers,
        entries: module.customItemRenderers ?? {},
        label: 'custom item renderer',
      }),
      customItemValidators: mergeUniqueRecord({
        current: assembly.customItemValidators,
        entries: module.customItemValidators ?? {},
        label: 'custom item validator',
      }),
      inspectorPanels: appendUniqueById({
        current: assembly.inspectorPanels,
        entries: module.inspectorPanels ?? [],
        label: 'inspector panel',
      }),
    }),
    {
      customCommands: [],
      customCreationTools: [],
      customItemRenderers: {},
      customItemValidators: {},
      inspectorPanels: [],
    },
  )
}

function assertUniqueModuleIds(modules: readonly CanvasAppCustomItemModule[]) {
  const ids = new Set<string>()

  for (const module of modules) {
    if (ids.has(module.id)) {
      throw new Error(`Duplicate canvas custom item module: ${module.id}`)
    }

    ids.add(module.id)
  }
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
      throw new Error(`Duplicate canvas custom item module ${label}: ${entry.id}`)
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
      throw new Error(`Duplicate canvas custom item module ${label}: ${key}`)
    }
  }

  return {
    ...current,
    ...entries,
  }
}
