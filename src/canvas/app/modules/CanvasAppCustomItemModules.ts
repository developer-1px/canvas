import type {
  Bounds,
  CanvasJsonObject,
} from '../../entities'
import {
  type CanvasCustomItemValidator,
  type CanvasCustomItemValidators,
} from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import {
  appendUniqueCanvasAppExtensionEntries,
  mergeUniqueCanvasAppExtensionRecord,
} from '../extensions/CanvasAppExtensionRegistries'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderers,
} from '../rendering'
import {
  type CanvasAppCustomCreationTool,
  type CanvasAppCustomCreationToolContext,
} from '../tools/CanvasAppCustomCreationTools'
import {
  assertCanvasAppCustomItemModule,
  assertCanvasAppCustomItemModuleAssembly,
  assertCanvasAppCustomItemModuleAssemblyInput,
} from './CanvasAppCustomItemModuleContracts'
import {
  getCanvasAppCustomItemModuleCreationTools,
  getCanvasAppCustomItemModuleRenderers,
  getCanvasAppCustomItemModuleValidators,
} from './CanvasAppCustomItemModuleRuntime'
import {
  snapshotCanvasAppCustomItemModule,
  snapshotCanvasAppCustomItemModuleAssembly,
} from './CanvasAppCustomItemModuleSnapshot'

export type CanvasAppCustomItemModuleCreationItem = Bounds & {
  data: CanvasJsonObject
  locked?: boolean
  title: string
}

export type CanvasAppCustomItemModuleCreationTool = Omit<
  CanvasAppCustomCreationTool,
  'createItem'
> & {
  createItem: (
    context: CanvasAppCustomCreationToolContext,
  ) => CanvasAppCustomItemModuleCreationItem | null
}

export type CanvasAppCustomItemModule = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customCreationTools?: readonly CanvasAppCustomItemModuleCreationTool[]
  id: string
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  presentation: string
  renderItem: CanvasAppCustomItemRendererStrategy
  validateItem: CanvasCustomItemValidator
}

export type CanvasAppCustomItemModuleAssembly = {
  customCommands: readonly CanvasAppCustomCommand[]
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  customItemRenderers: CanvasAppCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
  inspectorPanels: readonly CanvasAppInspectorPanel[]
}

export type CanvasAppCustomItemModuleAssemblyOptions = {
  disabledModuleIds?: readonly string[]
}

export function defineCanvasAppCustomItemModule(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppCustomItemModule(module)

  return snapshotCanvasAppCustomItemModule(module)
}

export function createCanvasAppCustomItemModuleAssembly(
  modules: readonly CanvasAppCustomItemModule[] = [],
  options: CanvasAppCustomItemModuleAssemblyOptions = {},
): CanvasAppCustomItemModuleAssembly {
  const disabledModuleIds = assertCanvasAppCustomItemModuleAssemblyInput({
    disabledModuleIds: options.disabledModuleIds ?? [],
    modules,
  })
  const disabledModuleIdSet = new Set(disabledModuleIds)
  const enabledModules = modules.filter(
    (module) => !disabledModuleIdSet.has(module.id),
  )

  const assembly = enabledModules.reduce<CanvasAppCustomItemModuleAssembly>(
    (assembly, module) => ({
      customCommands: appendUniqueCanvasAppExtensionEntries({
        current: assembly.customCommands,
        entries: module.customCommands ?? [],
        label: 'custom command',
        owner: 'custom item module',
      }),
      customCreationTools: appendUniqueCanvasAppExtensionEntries({
        current: assembly.customCreationTools,
        entries: getCanvasAppCustomItemModuleCreationTools(module),
        label: 'custom creation tool',
        owner: 'custom item module',
      }),
      customItemRenderers: mergeUniqueCanvasAppExtensionRecord({
        current: assembly.customItemRenderers,
        entries: getCanvasAppCustomItemModuleRenderers(module),
        label: 'custom item renderer',
        owner: 'custom item module',
      }),
      customItemValidators: mergeUniqueCanvasAppExtensionRecord({
        current: assembly.customItemValidators,
        entries: getCanvasAppCustomItemModuleValidators(module),
        label: 'custom item validator',
        owner: 'custom item module',
      }),
      inspectorPanels: appendUniqueCanvasAppExtensionEntries({
        current: assembly.inspectorPanels,
        entries: module.inspectorPanels ?? [],
        label: 'inspector panel',
        owner: 'custom item module',
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

  assertCanvasAppCustomItemModuleAssembly(assembly)

  return snapshotCanvasAppCustomItemModuleAssembly(assembly)
}
