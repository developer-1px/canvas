import type { CanvasCustomItemValidators } from '../../host'
import type { CanvasAppCustomCommand } from '../commands/CanvasAppCustomCommands'
import {
  assertCanvasAppExtensionEntries,
  assertCanvasAppExtensionId,
  assertCanvasAppExtensionRecordKeys,
} from '../extensions/CanvasAppExtensionIds'
import {
  appendUniqueCanvasAppExtensionEntries,
  mergeUniqueCanvasAppExtensionRecord,
} from '../extensions/CanvasAppExtensionRegistries'
import type { CanvasAppInspectorPanel } from '../inspector/CanvasAppInspectorPanels'
import type { CanvasDemoSvgCustomItemRenderers } from '../rendering'
import {
  assertCanvasAppCustomCreationTools,
  type CanvasAppCustomCreationTool,
} from '../tools/CanvasAppCustomCreationTools'

export type CanvasAppCustomItemModule = {
  customCommands?: readonly CanvasAppCustomCommand[]
  customCreationTools?: readonly CanvasAppCustomCreationTool[]
  customItemRenderers?: CanvasDemoSvgCustomItemRenderers
  customItemValidators: CanvasCustomItemValidators
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

export type CanvasAppCustomItemModuleAssemblyOptions = {
  disabledModuleIds?: readonly string[]
}

export function defineCanvasAppCustomItemModule(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppCustomItemModuleContracts(module)

  return module
}

export function createCanvasAppCustomItemModuleAssembly(
  modules: readonly CanvasAppCustomItemModule[] = [],
  options: CanvasAppCustomItemModuleAssemblyOptions = {},
): CanvasAppCustomItemModuleAssembly {
  for (const module of modules) {
    assertCanvasAppCustomItemModuleContracts(module)
  }

  for (const disabledModuleId of options.disabledModuleIds ?? []) {
    assertCanvasAppExtensionId({
      id: disabledModuleId,
      label: 'disabled custom item module',
    })
  }

  assertUniqueModuleIds(modules)
  assertKnownDisabledModuleIds(modules, options.disabledModuleIds ?? [])
  const disabledModuleIds = new Set(options.disabledModuleIds ?? [])
  const enabledModules = modules.filter(
    (module) => !disabledModuleIds.has(module.id),
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
        entries: module.customCreationTools ?? [],
        label: 'custom creation tool',
        owner: 'custom item module',
      }),
      customItemRenderers: mergeUniqueCanvasAppExtensionRecord({
        current: assembly.customItemRenderers,
        entries: module.customItemRenderers ?? {},
        label: 'custom item renderer',
        owner: 'custom item module',
      }),
      customItemValidators: mergeUniqueCanvasAppExtensionRecord({
        current: assembly.customItemValidators,
        entries: module.customItemValidators,
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

  return assembly
}

function assertCanvasAppCustomItemModuleContracts(
  module: CanvasAppCustomItemModule,
) {
  assertCanvasAppExtensionId({
    id: module.id,
    label: 'custom item module',
  })
  assertCanvasAppExtensionEntries({
    entries: module.customCommands ?? [],
    label: 'custom command',
  })
  assertCanvasAppCustomCreationTools(module.customCreationTools ?? [])
  assertCanvasAppExtensionRecordKeys({
    entries: module.customItemRenderers ?? {},
    label: 'custom item renderer',
  })
  assertCanvasAppExtensionRecordKeys({
    entries: module.customItemValidators,
    label: 'custom item validator',
  })
  assertCanvasAppCustomItemModuleValidatorCoverage(module)
  assertCanvasAppExtensionEntries({
    entries: module.inspectorPanels ?? [],
    label: 'inspector panel',
  })
}

function assertCanvasAppCustomItemModuleValidatorCoverage(
  module: CanvasAppCustomItemModule,
) {
  const validatorKeys = Object.keys(module.customItemValidators)

  for (const validatorKey of validatorKeys) {
    if (validatorKey !== module.id) {
      throw new Error(
        `Canvas custom item module validator must match module id: ${module.id} owns ${validatorKey}`,
      )
    }
  }

  if (!Object.hasOwn(module.customItemValidators, module.id)) {
    throw new Error(
      `Canvas custom item module must register validator for its item kind: ${module.id}`,
    )
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
