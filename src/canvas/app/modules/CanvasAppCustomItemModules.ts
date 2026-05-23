import type {
  Bounds,
  CanvasJsonObject,
} from '../../entities'
import { type CanvasCustomItemValidator } from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import {
  createEmptyCanvasAppExtensionBundle,
  type CanvasAppExtensionBundle,
  mergeCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemRendererStrategy,
} from '../rendering/CanvasAppRendererRegistries'
import {
  type CanvasAppCustomCreationToolContext,
  type CanvasAppCustomToolShortcut,
} from '../tools/CanvasAppCustomCreationTools'
import {
  assertCanvasAppCustomItemModule,
  assertCanvasAppCustomItemModuleAssembly,
  assertCanvasAppCustomItemModuleAssemblyInput,
} from './CanvasAppCustomItemModuleContracts'
import {
  getCanvasAppCustomItemModuleExtensionBundle,
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

export type CanvasAppCustomItemModuleCreationTool = {
  ariaLabel?: string
  createItem: (
    context: CanvasAppCustomCreationToolContext,
  ) => CanvasAppCustomItemModuleCreationItem | null
  id: string
  label: string
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel?: string
  title: string
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

export type CanvasAppCustomItemModuleAssembly = CanvasAppExtensionBundle

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
    (assembly, module) =>
      mergeCanvasAppExtensionBundle({
        current: assembly,
        entries: getCanvasAppCustomItemModuleExtensionBundle(module),
        owner: 'custom item module',
      }),
    createEmptyCanvasAppExtensionBundle(),
  )

  assertCanvasAppCustomItemModuleAssembly(assembly)

  return snapshotCanvasAppCustomItemModuleAssembly(assembly)
}
