import type {
  Bounds,
  CanvasJsonObject,
} from '../../entities'
import {
  type CanvasCustomItemValidator,
  type CanvasCustomItemValidators,
} from '../../host'
import {
  assertCanvasAppCustomCommands,
  type CanvasAppCustomCommand,
} from '../commands/CanvasAppCustomCommands'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionId } from '../extensions/CanvasAppExtensionIds'
import {
  appendUniqueCanvasAppExtensionEntries,
  mergeUniqueCanvasAppExtensionRecord,
} from '../extensions/CanvasAppExtensionRegistries'
import {
  assertCanvasAppInspectorPanels,
  type CanvasAppInspectorPanel,
} from '../inspector/CanvasAppInspectorPanels'
import type {
  CanvasAppCustomItemRendererStrategy,
  CanvasAppCustomItemRenderers,
} from '../rendering'
import {
  assertCanvasAppCustomCreationTools,
  type CanvasAppCustomCreationTool,
  type CanvasAppCustomCreationToolContext,
} from '../tools/CanvasAppCustomCreationTools'
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
  assertCanvasAppCustomItemModuleContracts(module)

  return snapshotCanvasAppCustomItemModule(module)
}

export function createCanvasAppCustomItemModuleAssembly(
  modules: readonly CanvasAppCustomItemModule[] = [],
  options: CanvasAppCustomItemModuleAssemblyOptions = {},
): CanvasAppCustomItemModuleAssembly {
  assertCanvasAppArray(modules, 'custom item modules')

  const disabledModuleIds = options.disabledModuleIds ?? []
  assertCanvasAppArray(disabledModuleIds, 'disabled custom item module ids')

  for (const module of modules) {
    assertCanvasAppCustomItemModuleContracts(module)
  }

  for (const disabledModuleId of disabledModuleIds) {
    assertCanvasAppExtensionId({
      id: disabledModuleId,
      label: 'disabled custom item module',
    })
  }
  const validatedDisabledModuleIds = disabledModuleIds as readonly string[]

  assertUniqueModuleIds(modules)
  assertKnownDisabledModuleIds(modules, validatedDisabledModuleIds)
  const disabledModuleIdSet = new Set(validatedDisabledModuleIds)
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

  assertCanvasAppCustomCreationTools(assembly.customCreationTools)

  return snapshotCanvasAppCustomItemModuleAssembly(assembly)
}

function assertCanvasAppCustomItemModuleContracts(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppDescriptorObject(module, 'custom item module')
  assertCanvasAppExtensionId({
    id: module.id,
    label: 'custom item module',
  })
  assertCanvasAppCustomCommands(module.customCommands ?? [])
  assertCanvasAppCustomItemModuleCreationTools(module)
  assertCanvasAppExtensionId({
    id: module.presentation,
    label: 'custom item presentation',
  })
  assertCanvasAppCustomItemModuleFunction({
    fn: module.renderItem,
    label: 'renderer',
    moduleId: module.id,
  })
  assertCanvasAppCustomItemModuleFunction({
    fn: module.validateItem,
    label: 'validator',
    moduleId: module.id,
  })
  assertCanvasAppInspectorPanels(module.inspectorPanels ?? [])
}

function assertCanvasAppCustomItemModuleFunction({
  fn,
  label,
  moduleId,
}: {
  fn: unknown
  label: string
  moduleId: string
}) {
  if (typeof fn !== 'function') {
    throw new Error(`Canvas custom item module ${moduleId} requires ${label}`)
  }
}

function assertCanvasAppCustomItemModuleCreationTools(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppCustomCreationTools(
    getCanvasAppCustomItemModuleCreationTools(module),
  )

  for (const tool of module.customCreationTools ?? []) {
    assertCanvasAppCustomItemModuleFunction({
      fn: tool.createItem,
      label: `creation tool ${tool.id}`,
      moduleId: module.id,
    })
  }
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

function assertKnownDisabledModuleIds(
  modules: readonly CanvasAppCustomItemModule[],
  disabledModuleIds: readonly string[],
) {
  const ids = new Set(modules.map((module) => module.id))

  for (const disabledModuleId of disabledModuleIds) {
    if (!ids.has(disabledModuleId)) {
      throw new Error(`Unknown disabled canvas custom item module: ${disabledModuleId}`)
    }
  }
}
